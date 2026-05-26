import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { ChatService } from './chat.service'
import { WS_EVENTS } from '@presteza/types'

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`🔌 WebSocket conectado: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ WebSocket desconectado: ${client.id}`)
  }

  @SubscribeMessage(WS_EVENTS.JOIN_CONVERSATION)
  async handleJoin(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.conversationId)
    console.log(`💬 Cliente ${client.id} entrou na conversa ${data.conversationId}`)
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

    // Emite para todos na sala (conversa)
    this.server.to(data.conversationId).emit(WS_EVENTS.NEW_MESSAGE, message)

    return message
  }

  // Método público para emitir mensagens via outros serviços
  emitToConversation(conversationId: string, message: any) {
    this.server.to(conversationId).emit(WS_EVENTS.NEW_MESSAGE, message)
  }
}
