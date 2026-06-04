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

  async getOrCreateConversationByClientId(clientId: string) {
    let conversation = await this.prisma.conversation.findUnique({
      where: { clientId },
    })
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: { clientId },
      })
    }
    return conversation
  }

  async getConversationRecipients(
    conversationId: string,
    senderId: string,
  ): Promise<{ senderName: string; recipientIds: string[] }> {
    const [conv, sender] = await Promise.all([
      this.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { client: { select: { userId: true } } },
      }),
      this.prisma.user.findUnique({
        where: { id: senderId },
        select: { role: true, name: true },
      }),
    ])

    if (sender?.role === 'ADMIN') {
      const recipientId = conv?.client?.userId
      return {
        senderName: sender.name,
        recipientIds: recipientId ? [recipientId] : [],
      }
    }

    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    })
    return {
      senderName: sender?.name ?? 'Cliente',
      recipientIds: admins.map((a) => a.id),
    }
  }

  async getConversationByUserId(userId: string) {
    // Encontra o cliente vinculado a este usuário e retorna sua conversa
    const client = await this.prisma.client.findUnique({
      where: { userId },
    })
    if (!client) return null

    let conversation = await this.prisma.conversation.findUnique({
      where: { clientId: client.id },
    })

    // Cria a conversa automaticamente se ainda não existir
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: { clientId: client.id },
      })
    }

    return conversation
  }
}
