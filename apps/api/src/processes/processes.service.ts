import { Injectable, NotFoundException } from '@nestjs/common'
import { ProcessStatus, ProcessType } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { NotificationsService } from '../notifications/notifications.service'

export interface CreateProcessDto {
  title: string
  type: ProcessType
  clientId: string
  assignedToId?: string
  dueDate?: string
  description?: string
}

export interface UpdateProcessDto {
  title?: string
  type?: ProcessType
  status?: ProcessStatus
  assignedToId?: string
  dueDate?: string
  description?: string
}

const processInclude = {
  client: { select: { id: true, companyName: true } },
  assignedTo: { select: { id: true, name: true } },
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em andamento',
  DONE: 'Concluído',
  CANCELLED: 'Cancelado',
}

@Injectable()
export class ProcessesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  findAll(clientId?: string) {
    return this.prisma.process.findMany({
      where: clientId ? { clientId } : undefined,
      include: processInclude,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string) {
    const process = await this.prisma.process.findUnique({
      where: { id },
      include: processInclude,
    })
    if (!process) throw new NotFoundException('Processo não encontrado')
    return process
  }

  findByClient(clientId: string) {
    return this.prisma.process.findMany({
      where: { clientId },
      include: processInclude,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findMyProcesses(userId: string) {
    const client = await this.prisma.client.findUnique({ where: { userId } })
    if (!client) return []
    return this.prisma.process.findMany({
      where: { clientId: client.id },
      include: processInclude,
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(dto: CreateProcessDto) {
    const process = await this.prisma.process.create({
      data: {
        title: dto.title,
        type: dto.type,
        clientId: dto.clientId,
        assignedToId: dto.assignedToId ?? null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        description: dto.description ?? null,
      },
      include: processInclude,
    })

    try {
      const client = await this.prisma.client.findUnique({
        where: { id: dto.clientId },
        select: { userId: true },
      })
      if (client?.userId) {
        await this.notificationsService.createAndNotify({
          userId: client.userId,
          type: 'PROCESS_UPDATE',
          title: 'Novo processo aberto',
          body: `O processo "${process.title}" foi criado para você.`,
          referenceId: process.id,
        })
      }
    } catch {}

    return process
  }

  async update(id: string, dto: UpdateProcessDto) {
    await this.findOne(id)
    const updated = await this.prisma.process.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.assignedToId !== undefined && { assignedToId: dto.assignedToId }),
        ...(dto.dueDate !== undefined && { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
      include: processInclude,
    })

    if (dto.status !== undefined) {
      try {
        const client = await this.prisma.client.findUnique({
          where: { id: updated.clientId },
          select: { userId: true },
        })
        if (client?.userId) {
          await this.notificationsService.createAndNotify({
            userId: client.userId,
            type: 'PROCESS_UPDATE',
            title: 'Processo atualizado',
            body: `"${updated.title}" está agora ${statusLabels[dto.status] ?? dto.status}.`,
            referenceId: updated.id,
          })
        }
      } catch {}
    }

    return updated
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.process.delete({ where: { id } })
  }
}
