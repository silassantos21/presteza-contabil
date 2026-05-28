import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { ClientStatus } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'

export interface CreateClientDto {
  companyName: string
  tradeName?: string
  cnpj?: string
  cpf?: string
  email: string
  phone?: string
  responsibleName: string
  notes?: string
}

export interface UpdateClientDto {
  companyName?: string
  tradeName?: string
  cnpj?: string
  cpf?: string
  email?: string
  phone?: string
  responsibleName?: string
  status?: ClientStatus
  notes?: string
}

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.client.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { companyName: 'asc' },
    })
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        processes: { orderBy: { createdAt: 'desc' }, take: 5 },
        documents: { orderBy: { createdAt: 'desc' }, take: 5 },
        timeline: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    })
    if (!client) throw new NotFoundException('Cliente não encontrado')
    return client
  }

  create(dto: CreateClientDto) {
    return this.prisma.client.create({
      data: {
        companyName: dto.companyName,
        tradeName: dto.tradeName ?? null,
        cnpj: dto.cnpj ?? null,
        cpf: dto.cpf ?? null,
        email: dto.email,
        phone: dto.phone ?? null,
        responsibleName: dto.responsibleName,
        notes: dto.notes ?? null,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findOne(id)
    return this.prisma.client.update({
      where: { id },
      data: {
        ...(dto.companyName !== undefined && { companyName: dto.companyName }),
        ...(dto.tradeName !== undefined && { tradeName: dto.tradeName }),
        ...(dto.cnpj !== undefined && { cnpj: dto.cnpj }),
        ...(dto.cpf !== undefined && { cpf: dto.cpf }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.responsibleName !== undefined && { responsibleName: dto.responsibleName }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.client.delete({ where: { id } })
  }

  getTimeline(clientId: string) {
    return this.prisma.timelineEvent.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    })
  }

  createTimelineEvent(clientId: string, title: string, description?: string) {
    return this.prisma.timelineEvent.create({
      data: { clientId, title, description: description ?? null },
    })
  }

  async createPortalAccess(clientId: string, email: string, password: string) {
    const client = await this.findOne(clientId)

    if (client.userId) {
      throw new ConflictException('Este cliente já possui acesso ao portal.')
    }

    const existing = await this.prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw new ConflictException('Já existe um usuário com este e-mail.')
    }

    const hashed = await bcrypt.hash(password, 10)

    const user = await this.prisma.user.create({
      data: {
        name: client.responsibleName,
        email,
        password: hashed,
        role: 'CLIENT',
      },
    })

    return this.prisma.client.update({
      where: { id: clientId },
      data: { userId: user.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
  }
}
