import { Controller, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { ReportsService } from './reports.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}
  // Rotas implementadas na Sprint 5
}
