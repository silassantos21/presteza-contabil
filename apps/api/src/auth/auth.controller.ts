import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { LoginDto } from './dto/login.dto'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login do usuário' })
  async login(@Request() req, @Body() _: LoginDto) {
    return this.authService.login(req.user)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna o usuário autenticado' })
  async me(@Request() req) {
    return this.authService.getProfile(req.user.sub)
  }
}
