import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { StorageService } from '../storage/storage.service'
import { DocumentType } from '@prisma/client'

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  findByClient(clientId: string) {
    return this.prisma.document.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      include: { uploadedBy: { select: { id: true, name: true } } },
    })
  }

  async findMyDocuments(userId: string) {
    const client = await this.prisma.client.findUnique({ where: { userId } })
    if (!client) throw new NotFoundException('Cliente não encontrado')
    return this.findByClient(client.id)
  }

  async upload(
    file: Express.Multer.File,
    clientId: string,
    uploadedById: string,
    type: DocumentType,
  ) {
    const { key, size } = await this.storage.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
    )

    return this.prisma.document.create({
      data: {
        clientId,
        name: file.originalname,
        type,
        fileUrl: key,
        fileSize: size,
        uploadedById,
      },
      include: { uploadedBy: { select: { id: true, name: true } } },
    })
  }

  async getSignedUrl(id: string, requesterId: string, requesterRole: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } })
    if (!doc) throw new NotFoundException('Documento não encontrado')

    if (requesterRole === 'CLIENT') {
      const client = await this.prisma.client.findUnique({
        where: { userId: requesterId },
      })
      if (!client || client.id !== doc.clientId)
        throw new ForbiddenException('Acesso negado')
    }

    return { url: await this.storage.getSignedUrl(doc.fileUrl) }
  }

  async remove(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } })
    if (!doc) throw new NotFoundException('Documento não encontrado')
    await this.storage.delete(doc.fileUrl)
    return this.prisma.document.delete({ where: { id } })
  }
}
