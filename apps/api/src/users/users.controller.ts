import { Controller, Get, Patch, Body, UseGuards, Request, Query } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { UpdateMeDto } from './dto/update-me.dto'

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os usuários' })
  findAll() {
    return this.usersService.findAll()
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualiza perfil do usuário autenticado' })
  updateMe(@Request() req, @Body() dto: UpdateMeDto) {
    return this.usersService.updateMe(req.user.sub, dto)
  }

  @Get('activity/recent')
  @ApiOperation({ summary: 'Retorna atividade recente (processos + documentos)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getRecentActivity(@Query('limit') limit?: string) {
    return this.usersService.getRecentActivity(limit ? parseInt(limit) : 10)
  }
}
