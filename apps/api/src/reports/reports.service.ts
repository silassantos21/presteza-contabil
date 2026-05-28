import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

/* eslint-disable @typescript-eslint/no-require-imports */
const PdfPrinter = require('pdfmake')
const vfsFonts = require('pdfmake/build/vfs_fonts')
/* eslint-enable @typescript-eslint/no-require-imports */

// pdfmake 0.2.x exporta as fontes diretamente no nível raiz do módulo
const vfs: Record<string, string> = vfsFonts.pdfMake?.vfs ?? vfsFonts.vfs ?? vfsFonts

const fonts = {
  Roboto: {
    normal: Buffer.from(vfs['Roboto-Regular.ttf'], 'base64'),
    bold: Buffer.from(vfs['Roboto-Medium.ttf'], 'base64'),
    italics: Buffer.from(vfs['Roboto-Italic.ttf'], 'base64'),
    bolditalics: Buffer.from(vfs['Roboto-MediumItalic.ttf'], 'base64'),
  },
}

const printer = new PdfPrinter(fonts)

const BRAND = '#1E3A5F'

const TABLE_LAYOUT = {
  hLineWidth: (i: number) => (i <= 1 ? 0 : 0.5),
  vLineWidth: () => 0,
  hLineColor: () => '#E5E7EB',
  fillColor: (row: number) => (row === 0 ? BRAND : row % 2 === 0 ? '#F9FAFB' : null),
  paddingLeft: () => 8,
  paddingRight: () => 8,
  paddingTop: () => 5,
  paddingBottom: () => 5,
}

const INFO_LAYOUT = {
  hLineWidth: () => 0.5,
  vLineWidth: () => 0.5,
  hLineColor: () => '#E5E7EB',
  vLineColor: () => '#E5E7EB',
  paddingLeft: () => 8,
  paddingRight: () => 8,
  paddingTop: () => 5,
  paddingBottom: () => 5,
}

const SHARED_STYLES = {
  brandHeader: { fontSize: 13, bold: true, color: BRAND },
  headerDate: { fontSize: 8, color: '#94A3B8' },
  title: { fontSize: 18, bold: true, color: BRAND, margin: [0, 0, 0, 4] as [number, number, number, number] },
  subtitle: { fontSize: 10, color: '#6B7280', margin: [0, 0, 0, 20] as [number, number, number, number] },
  sectionTitle: { fontSize: 11, bold: true, color: BRAND, margin: [0, 8, 0, 6] as [number, number, number, number] },
  tableHeader: { fontSize: 8, bold: true, color: '#FFFFFF' },
  infoLabel: { fontSize: 8, color: '#6B7280', bold: true },
  infoValue: { fontSize: 9 },
  emptyMsg: { fontSize: 9, color: '#94A3B8', italics: true, margin: [0, 0, 0, 12] as [number, number, number, number] },
}

function buildPdf(docDef: object, tableLayouts: Record<string, object>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = printer.createPdfKitDocument(docDef, { tableLayouts })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    doc.end()
  })
}

function fmtDate(d: Date | null | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

function fmtSize(bytes: number | null | undefined): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1_048_576).toFixed(1)} MB`
}

function statusLabel(s: string): string {
  return { PENDING: 'Pendente', IN_PROGRESS: 'Em andamento', DONE: 'Concluído', CANCELLED: 'Cancelado' }[s] ?? s
}

function statusColor(s: string): string {
  return { PENDING: '#D97706', IN_PROGRESS: '#2563EB', DONE: '#16A34A', CANCELLED: '#94A3B8' }[s] ?? '#94A3B8'
}

function docTypeLabel(t: string): string {
  return { NFSE: 'NFS-e', NFE: 'NF-e', BOLETO: 'Boleto', CONTRATO: 'Contrato', GUIA: 'Guia', OUTROS: 'Outros' }[t] ?? t
}

function clientStatusLabel(s: string): string {
  return { ACTIVE: 'Ativo', INACTIVE: 'Inativo', PENDING: 'Pendente' }[s] ?? s
}

function pageHeader(title: string, date: string) {
  return {
    columns: [
      { text: title, style: 'brandHeader', width: '*' },
      { text: `Gerado em ${date}`, style: 'headerDate', width: 'auto', margin: [0, 3, 0, 0] },
    ],
    margin: [40, 14, 40, 0],
  }
}

function pageFooter(current: number, total: number) {
  return {
    text: `Página ${current} de ${total}`,
    alignment: 'center',
    fontSize: 8,
    color: '#94A3B8',
    margin: [40, 0],
  }
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateClientPdf(clientId: string): Promise<Buffer> {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' },
          include: { uploadedBy: { select: { name: true } } },
        },
        processes: {
          orderBy: { createdAt: 'desc' },
          include: { assignedTo: { select: { name: true } } },
        },
      },
    })
    if (!client) throw new NotFoundException('Cliente não encontrado')

    const now = new Date().toLocaleDateString('pt-BR')

    const docRows = client.documents.map((d) => [
      { text: d.name, fontSize: 8 },
      { text: docTypeLabel(d.type), fontSize: 8 },
      { text: fmtSize(d.fileSize), fontSize: 8 },
      { text: d.uploadedBy.name, fontSize: 8 },
      { text: fmtDate(d.createdAt), fontSize: 8 },
    ])

    const procRows = client.processes.map((p) => [
      { text: p.title, fontSize: 8 },
      { text: p.type, fontSize: 8 },
      { text: statusLabel(p.status), fontSize: 8, color: statusColor(p.status), bold: true },
      { text: p.assignedTo?.name ?? '—', fontSize: 8 },
      { text: fmtDate(p.dueDate), fontSize: 8 },
    ])

    const docDef = {
      pageMargins: [40, 56, 40, 48],
      defaultStyle: { font: 'Roboto', fontSize: 9 },
      header: (_page: number, _total: number) => pageHeader('Presteza Contábil', now),
      footer: (page: number, total: number) => pageFooter(page, total),
      styles: SHARED_STYLES,
      content: [
        { text: 'Extrato do Cliente', style: 'title' },

        // Info block
        {
          table: {
            widths: [70, '*', 70, '*'],
            body: [
              [
                { text: 'Empresa', style: 'infoLabel' },
                {
                  text: client.companyName + (client.tradeName ? ` (${client.tradeName})` : ''),
                  style: 'infoValue',
                  colSpan: 3,
                },
                {}, {},
              ],
              [
                { text: 'Responsável', style: 'infoLabel' },
                { text: client.responsibleName, style: 'infoValue' },
                { text: 'Status', style: 'infoLabel' },
                { text: clientStatusLabel(client.status), style: 'infoValue' },
              ],
              [
                { text: 'E-mail', style: 'infoLabel' },
                { text: client.email, style: 'infoValue' },
                { text: 'Contato', style: 'infoLabel' },
                { text: client.phone ?? '—', style: 'infoValue' },
              ],
              [
                { text: 'CNPJ / CPF', style: 'infoLabel' },
                { text: client.cnpj ?? client.cpf ?? '—', style: 'infoValue', colSpan: 3 },
                {}, {},
              ],
            ],
          },
          layout: 'infoLayout',
          margin: [0, 0, 0, 8],
        },

        // Documents
        { text: `Documentos  (${client.documents.length})`, style: 'sectionTitle' },
        client.documents.length === 0
          ? { text: 'Nenhum documento registrado.', style: 'emptyMsg' }
          : {
              table: {
                headerRows: 1,
                widths: ['*', 55, 52, 80, 60],
                body: [
                  [
                    { text: 'Nome', style: 'tableHeader' },
                    { text: 'Tipo', style: 'tableHeader' },
                    { text: 'Tamanho', style: 'tableHeader' },
                    { text: 'Enviado por', style: 'tableHeader' },
                    { text: 'Data', style: 'tableHeader' },
                  ],
                  ...docRows,
                ],
              },
              layout: 'tableLayout',
              margin: [0, 0, 0, 8],
            },

        // Processes
        { text: `Processos  (${client.processes.length})`, style: 'sectionTitle' },
        client.processes.length === 0
          ? { text: 'Nenhum processo registrado.', style: 'emptyMsg' }
          : {
              table: {
                headerRows: 1,
                widths: ['*', 48, 78, 90, 60],
                body: [
                  [
                    { text: 'Título', style: 'tableHeader' },
                    { text: 'Tipo', style: 'tableHeader' },
                    { text: 'Status', style: 'tableHeader' },
                    { text: 'Responsável', style: 'tableHeader' },
                    { text: 'Vencimento', style: 'tableHeader' },
                  ],
                  ...procRows,
                ],
              },
              layout: 'tableLayout',
            },
      ],
    }

    return buildPdf(docDef, { tableLayout: TABLE_LAYOUT, infoLayout: INFO_LAYOUT })
  }

  async generateProcessesPdf(): Promise<Buffer> {
    const processes = await this.prisma.process.findMany({
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
      include: {
        client: { select: { companyName: true } },
        assignedTo: { select: { name: true } },
      },
    })

    const now = new Date().toLocaleDateString('pt-BR')
    const STATUSES = ['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED']
    const sections: object[] = []

    for (const status of STATUSES) {
      const group = processes.filter((p) => p.status === status)

      sections.push({
        text: `${statusLabel(status)}  (${group.length})`,
        style: 'sectionTitle',
        color: statusColor(status),
      })

      if (group.length === 0) {
        sections.push({ text: 'Nenhum processo neste status.', style: 'emptyMsg' })
      } else {
        sections.push({
          table: {
            headerRows: 1,
            widths: ['*', 48, 80, 90, 60],
            body: [
              [
                { text: 'Título', style: 'tableHeader' },
                { text: 'Tipo', style: 'tableHeader' },
                { text: 'Cliente', style: 'tableHeader' },
                { text: 'Responsável', style: 'tableHeader' },
                { text: 'Vencimento', style: 'tableHeader' },
              ],
              ...group.map((p) => [
                { text: p.title, fontSize: 8 },
                { text: p.type, fontSize: 8 },
                { text: p.client.companyName, fontSize: 8 },
                { text: p.assignedTo?.name ?? '—', fontSize: 8 },
                { text: fmtDate(p.dueDate), fontSize: 8 },
              ]),
            ],
          },
          layout: 'tableLayout',
          margin: [0, 0, 0, 8],
        })
      }
    }

    const docDef = {
      pageMargins: [40, 56, 40, 48],
      defaultStyle: { font: 'Roboto', fontSize: 9 },
      header: (_page: number, _total: number) => pageHeader('Presteza Contábil', now),
      footer: (page: number, total: number) => pageFooter(page, total),
      styles: SHARED_STYLES,
      content: [
        { text: 'Relatório de Processos', style: 'title' },
        {
          text: `Total: ${processes.length} processo${processes.length !== 1 ? 's' : ''}`,
          style: 'subtitle',
        },
        ...sections,
      ],
    }

    return buildPdf(docDef, { tableLayout: TABLE_LAYOUT })
  }
}
