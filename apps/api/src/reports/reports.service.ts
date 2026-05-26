import { Injectable } from '@nestjs/common'

@Injectable()
export class ReportsService {
  // Implementação completa na Sprint 5
  async generateClientReport(_clientId: string): Promise<Buffer> {
    return Buffer.from('Relatório em desenvolvimento')
  }
}
