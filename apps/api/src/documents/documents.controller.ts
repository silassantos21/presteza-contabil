import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { DocumentsService } from './documents.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get('client/:clientId')
  findByClient(@Param('clientId') clientId: string) {
    return this.documentsService.findByClient(clientId)
  }
}
