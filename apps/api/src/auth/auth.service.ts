import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { UsersService } from '../users/users.service'
import type { AuthResponse } from '@presteza/types'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email)
    if (!user) throw new UnauthorizedException('Credenciais inválidas')

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new UnauthorizedException('Credenciais inválidas')

    if (!user.active) throw new UnauthorizedException('Usuário desativado')

    return user
  }

  async login(user: any): Promise<AuthResponse> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    }

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    }
  }

  async getProfile(userId: string) {
    try {
      return await this.usersService.findById(userId)
    } catch (e) {
      if (e instanceof NotFoundException) throw new UnauthorizedException('Sessão inválida')
      throw e
    }
  }
}
