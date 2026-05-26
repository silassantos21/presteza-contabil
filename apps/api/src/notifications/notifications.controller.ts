import { Controller, Get, Patch, Request, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { NotificationsService } from './notifications.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  findAll(@Request() req) {
    return this.notificationsService.findByUser(req.user.sub)
  }

  @Patch('read-all')
  markAllRead(@Request() req) {
    return this.notificationsService.markAllRead(req.user.sub)
  }
}
