import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger'
import { DocumentsService } from './documents.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { DocumentType } from '@prisma/client'

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

  @Get('my-documents')
  findMyDocuments(@Request() req: any) {
    return this.documentsService.findMyDocuments(req.user.sub)
  }

  @Get(':id/signed-url')
  getSignedUrl(@Param('id') id: string, @Request() req: any) {
    return this.documentsService.getSignedUrl(id, req.user.sub, req.user.role)
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        clientId: { type: 'string' },
        type: { type: 'string', enum: Object.values(DocumentType) },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: undefined }))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
    @Body('clientId') clientId: string,
    @Body('type') type: DocumentType = DocumentType.OUTROS,
    @Request() req: any,
  ) {
    return this.documentsService.upload(file, clientId, req.user.sub, type)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id)
  }
}
