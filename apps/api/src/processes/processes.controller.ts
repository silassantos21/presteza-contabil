import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { ProcessesService, CreateProcessDto, UpdateProcessDto } from './processes.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('processes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('processes')
export class ProcessesController {
  constructor(private processesService: ProcessesService) {}

  @Get()
  findAll(@Query('clientId') clientId?: string) {
    return this.processesService.findAll(clientId)
  }

  @Get('my-processes')
  findMyProcesses(@Request() req: any) {
    return this.processesService.findMyProcesses(req.user.sub)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.processesService.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateProcessDto) {
    return this.processesService.create(dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProcessDto) {
    return this.processesService.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.processesService.remove(id)
  }
}
