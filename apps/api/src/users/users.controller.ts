import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

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
}
