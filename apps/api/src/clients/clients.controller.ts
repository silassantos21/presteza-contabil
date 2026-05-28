import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { ClientsService, CreateClientDto, UpdateClientDto } from './clients.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  findAll() {
    return this.clientsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id)
  }

  @Get(':id/timeline')
  getTimeline(@Param('id') id: string) {
    return this.clientsService.getTimeline(id)
  }

  @Post(':id/timeline')
  createTimelineEvent(
    @Param('id') id: string,
    @Body() body: { title: string; description?: string },
  ) {
    return this.clientsService.createTimelineEvent(id, body.title, body.description)
  }

  @Post(':id/portal-access')
  createPortalAccess(
    @Param('id') id: string,
    @Body() body: { email: string; password: string },
  ) {
    return this.clientsService.createPortalAccess(id, body.email, body.password)
  }
}
