import { Controller, Get, Param, UseGuards } from '@nestjs/common'
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

  @Get('conversations/:conversationId/messages')
  getMessages(@Param('conversationId') conversationId: string) {
    return this.chatService.getMessages(conversationId)
  }
}
