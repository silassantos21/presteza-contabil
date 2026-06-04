import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { ChatService } from './chat.service'
import { NotificationsService } from '../notifications/notifications.service'
import { SocketService } from '../socket/socket.service'
import { WS_EVENTS } from '@presteza/types'

@WebSocketGateway({
  // origin: true reflete a origem do request — elimina qualquer CORS mismatch em dev
  cors: { origin: true, credentials: true },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server

  constructor(
    private chatService: ChatService,
    private notificationsService: NotificationsService,
    private socketService: SocketService,
  ) {}

  afterInit(server: Server) {
    this.socketService.setServer(server)
  }

  handleConnection(client: Socket) {
    console.log(`🔌 WebSocket conectado: ${client.id}`)
    client.on('disconnect', (reason: string) => {
      console.log(`❌ WebSocket desconectado: ${client.id} — motivo: ${reason}`)
    })
  }

  handleDisconnect(_client: Socket) {
    // motivo logado acima
  }

  @SubscribeMessage(WS_EVENTS.JOIN_CONVERSATION)
  async handleJoin(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.conversationId)
    console.log(`💬 Cliente ${client.id} entrou na conversa ${data.conversationId}`)
  }

  @SubscribeMessage(WS_EVENTS.JOIN_USER_ROOM)
  handleJoinUserRoom(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`user:${data.userId}`)
  }

  @SubscribeMessage(WS_EVENTS.SEND_MESSAGE)
  async handleMessage(
    @MessageBody()
    data: {
      conversationId: string
      senderId: string
      content: string
      type?: 'TEXT' | 'FILE' | 'SYSTEM'
    },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.saveMessage({
      conversationId: data.conversationId,
      senderId: data.senderId,
      type: data.type || 'TEXT',
      content: data.content,
    })

    this.server.to(data.conversationId).emit(WS_EVENTS.NEW_MESSAGE, message)

    try {
      const { senderName, recipientIds } =
        await this.chatService.getConversationRecipients(
          data.conversationId,
          data.senderId,
        )
      for (const userId of recipientIds) {
        await this.notificationsService.createAndNotify({
          userId,
          type: 'NEW_MESSAGE',
          title: 'Nova mensagem',
          body: `${senderName}: ${data.content.slice(0, 80)}`,
          referenceId: data.conversationId,
        })
      }
    } catch {}

    return message
  }

  emitToConversation(conversationId: string, message: any) {
    this.server.to(conversationId).emit(WS_EVENTS.NEW_MESSAGE, message)
  }
}
