import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateMeDto } from './dto/update-me.dto'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } })
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        active: true,
        createdAt: true,
      },
    })
    if (!user) throw new NotFoundException('Usuário não encontrado')
    return user
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        active: true,
        createdAt: true,
      },
    })
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('Usuário não encontrado')

    const data: Record<string, unknown> = {}

    if (dto.name?.trim()) data.name = dto.name.trim()

    if (dto.email && dto.email !== user.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
      if (existing) throw new ConflictException('E-mail já está em uso')
      data.email = dto.email
    }

    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Informe a senha atual para alterá-la')
      }
      const valid = await bcrypt.compare(dto.currentPassword, user.password)
      if (!valid) throw new UnauthorizedException('Senha atual incorreta')
      data.password = await bcrypt.hash(dto.newPassword, 10)
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        active: true,
        createdAt: true,
      },
    })
  }

  async getRecentActivity(limit = 10) {
    const [processes, documents] = await Promise.all([
      this.prisma.process.findMany({
        take: limit,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true,
          createdAt: true,
          client: { select: { tradeName: true, companyName: true } },
        },
      }),
      this.prisma.document.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          type: true,
          createdAt: true,
          client: { select: { tradeName: true, companyName: true } },
          uploadedBy: { select: { name: true } },
        },
      }),
    ])

    const statusLabel: Record<string, string> = {
      PENDING: 'Pendente',
      IN_PROGRESS: 'Em andamento',
      DONE: 'Concluído',
      CANCELLED: 'Cancelado',
    }

    const items = [
      ...processes.map((p) => ({
        id: p.id,
        kind: 'process' as const,
        title: p.title,
        subtitle: `${p.client.tradeName ?? p.client.companyName} · ${statusLabel[p.status] ?? p.status}`,
        date: p.updatedAt.toISOString(),
      })),
      ...documents.map((d) => ({
        id: d.id,
        kind: 'document' as const,
        title: d.name,
        subtitle: `${d.client.tradeName ?? d.client.companyName} · enviado por ${d.uploadedBy.name}`,
        date: d.createdAt.toISOString(),
      })),
    ]

    return items
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
  }
}
