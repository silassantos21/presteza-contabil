import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { Response } from 'express'
import { ReportsService } from './reports.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Extrato do cliente em PDF (documentos + processos)' })
  @Get('client/:id/pdf')
  async getClientPdf(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.reportsService.generateClientPdf(id)
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="extrato-cliente.pdf"',
      'Content-Length': String(buffer.length),
    })
    res.send(buffer)
  }

  @ApiOperation({ summary: 'Relatório de todos os processos por status em PDF' })
  @Get('processes/pdf')
  async getProcessesPdf(@Res() res: Response) {
    const buffer = await this.reportsService.generateProcessesPdf()
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="relatorio-processos.pdf"',
      'Content-Length': String(buffer.length),
    })
    res.send(buffer)
  }
}
