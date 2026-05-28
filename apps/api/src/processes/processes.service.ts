import { Injectable, NotFoundException } from '@nestjs/common'
import { ProcessStatus, ProcessType } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

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

@Injectable()
export class ProcessesService {
  constructor(private prisma: PrismaService) {}

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

  create(dto: CreateProcessDto) {
    return this.prisma.process.create({
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
  }

  async update(id: string, dto: UpdateProcessDto) {
    await this.findOne(id)
    return this.prisma.process.update({
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
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.process.delete({ where: { id } })
  }
}
