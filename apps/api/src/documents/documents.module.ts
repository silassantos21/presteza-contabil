import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { DocumentsService } from './documents.service'
import { DocumentsController } from './documents.controller'
import { StorageModule } from '../storage/storage.module'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [
    StorageModule,
    MulterModule.register({ storage: memoryStorage() }),
    NotificationsModule,
  ],
  providers: [DocumentsService],
  controllers: [DocumentsController],
})
export class DocumentsModule {}
