import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { ClientsModule } from './clients/clients.module'
import { ChatModule } from './chat/chat.module'
import { DocumentsModule } from './documents/documents.module'
import { ProcessesModule } from './processes/processes.module'
import { NotificationsModule } from './notifications/notifications.module'
import { ReportsModule } from './reports/reports.module'

@Module({
  imports: [
    // Variáveis de ambiente disponíveis em todo o app
    ConfigModule.forRoot({ isGlobal: true }),

    // Banco de dados
    PrismaModule,

    // Módulos de negócio
    AuthModule,
    UsersModule,
    ClientsModule,
    ChatModule,
    DocumentsModule,
    ProcessesModule,
    NotificationsModule,
    ReportsModule,
  ],
})
export class AppModule {}
