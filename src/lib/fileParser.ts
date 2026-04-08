import mammoth from 'mammoth'
import * as pdfjsLib from 'pdfjs-dist'

// Používáme CDN worker pro PDF.js – nevyžaduje žádnou lokální konfiguraci
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

export async function parseFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (ext === 'txt') return parseTxt(file)
  if (ext === 'docx') return parseDocx(file)
  if (ext === 'pdf') return parsePdf(file)

  throw new Error(`Nepodporovaný formát: .${ext ?? 'neznámý'}. Podporované formáty: TXT, DOCX, PDF`)
}

async function parseTxt(file: File): Promise<string> {
  return file.text()
}

async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

async function parsePdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pageText = (content.items as any[])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => (typeof item.str === 'string' ? item.str : ''))
      .join(' ')
    pages.push(pageText)
  }

  return pages.join('\n')
}
