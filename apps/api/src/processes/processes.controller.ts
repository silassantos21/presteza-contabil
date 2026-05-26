import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { ProcessesService } from './processes.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('processes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('processes')
export class ProcessesController {
  constructor(private processesService: ProcessesService) {}

  @Get()
  findAll() {
    return this.processesService.findAll()
  }
}
