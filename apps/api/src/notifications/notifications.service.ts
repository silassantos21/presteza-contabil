import { Injectable } from '@nestjs/common'
import { NotificationType } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { SocketService } from '../socket/socket.service'

interface CreateNotificationData {
  userId: string
  type: NotificationType
  title: string
  body: string
  referenceId?: string
}

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private socketService: SocketService,
  ) {}

  async createAndNotify(data: CreateNotificationData) {
    const notification = await this.prisma.notification.create({ data })
    this.socketService.emitToUser(data.userId, notification)
    return notification
  }

  findByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })
  }

  countUnread(userId: string) {
    return this.prisma.notification.count({
      where: { userId, read: false },
    })
  }

  markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })
  }
}
