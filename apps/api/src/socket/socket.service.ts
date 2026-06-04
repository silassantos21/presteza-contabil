import { Injectable } from '@nestjs/common'
import { Server } from 'socket.io'
import { WS_EVENTS } from '@presteza/types'

@Injectable()
export class SocketService {
  private server: Server | null = null

  setServer(server: Server) {
    this.server = server
  }

  emitToUser(userId: string, payload: any) {
    this.server?.to(`user:${userId}`).emit(WS_EVENTS.NEW_NOTIFICATION, payload)
  }
}
