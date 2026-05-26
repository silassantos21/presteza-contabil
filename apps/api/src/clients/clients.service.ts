import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.client.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { companyName: 'asc' },
    })
  }

  findOne(id: string) {
    return this.prisma.client.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        processes: { orderBy: { createdAt: 'desc' }, take: 5 },
        documents: { orderBy: { createdAt: 'desc' }, take: 5 },
        timeline: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    })
  }
}
