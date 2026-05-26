import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getMessages(conversationId: string, take = 50) {
    return this.prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
      take,
    })
  }

  async getConversationByClientId(clientId: string) {
    return this.prisma.conversation.findUnique({
      where: { clientId },
    })
  }

  async saveMessage(data: {
    conversationId: string
    senderId: string
    type: 'TEXT' | 'FILE' | 'SYSTEM'
    content: string
    fileUrl?: string
    fileName?: string
    fileSize?: number
  }) {
    return this.prisma.message.create({
      data,
      include: {
        sender: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
    })
  }

  async listConversations() {
    return this.prisma.conversation.findMany({
      include: {
        client: { select: { id: true, companyName: true, responsibleName: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
