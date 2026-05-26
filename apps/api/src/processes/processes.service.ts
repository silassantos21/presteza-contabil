import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ProcessesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.process.findMany({
      include: {
        client: { select: { id: true, companyName: true } },
        assignedTo: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  findByClient(clientId: string) {
    return this.prisma.process.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    })
  }
}
