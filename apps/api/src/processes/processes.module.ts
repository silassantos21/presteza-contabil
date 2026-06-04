import { Module } from '@nestjs/common'
import { ProcessesService } from './processes.service'
import { ProcessesController } from './processes.controller'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [NotificationsModule],
  providers: [ProcessesService],
  controllers: [ProcessesController],
})
export class ProcessesModule {}
