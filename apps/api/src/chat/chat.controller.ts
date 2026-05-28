import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { ChatService } from './chat.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  listConversations() {
    return this.chatService.listConversations()
  }

  /** Retorna (ou cria) a conversa do cliente autenticado */
  @Get('my-conversation')
  getMyConversation(@Request() req: any) {
    return this.chatService.getConversationByUserId(req.user.sub)
  }

  @Get('conversations/by-client/:clientId')
  getConversationByClientId(@Param('clientId') clientId: string) {
    return this.chatService.getOrCreateConversationByClientId(clientId)
  }

  @Get('conversations/:conversationId/messages')
  getMessages(@Param('conversationId') conversationId: string) {
    return this.chatService.getMessages(conversationId)
  }
}
