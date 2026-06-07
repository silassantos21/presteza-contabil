import puppeteer from 'puppeteer'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const htmlPath = path.join(__dirname, 'apresentacao.html')
const pdfPath  = path.join(__dirname, 'apresentacao.pdf')

console.log('Iniciando geração do PDF...')

const browser = await puppeteer.launch({ headless: 'new' })
const page    = await browser.newPage()

await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, {
  waitUntil: 'networkidle0',
  timeout: 30000,
})

// Aguarda fontes carregarem
await page.evaluateHandle('document.fonts.ready')

await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
})

await browser.close()
console.log(`PDF gerado com sucesso: ${pdfPath}`)
