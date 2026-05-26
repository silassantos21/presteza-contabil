import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  findByClient(clientId: string) {
    return this.prisma.document.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    })
  }
}
