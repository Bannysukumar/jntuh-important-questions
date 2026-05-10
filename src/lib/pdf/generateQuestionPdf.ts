import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'
import type { QuestionSet } from '@/types/models'
import { SITE_NAME, WATERMARK_DEFAULT } from '@/lib/constants'

export interface PdfOptions {
  pageUrl: string
  watermarkText?: string
  logoDataUrl?: string
}

function drawWatermark(doc: jsPDF, text: string, pageWidth: number, pageHeight: number) {
  doc.setTextColor(230, 230, 235)
  doc.setFontSize(26)
  doc.setFont('helvetica', 'bold')
  const angle = 32
  const step = 52
  for (let x = -50; x < pageWidth + 100; x += step) {
    for (let y = -50; y < pageHeight + 100; y += step * 1.35) {
      doc.text(text, x, y, { angle, align: 'left' })
    }
  }
  doc.setTextColor(30, 41, 59)
}

export async function generateQuestionPdf(q: QuestionSet, opts: PdfOptions): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 16
  const footerReserve = 24
  const watermark = opts.watermarkText ?? WATERMARK_DEFAULT
  const ts = new Date().toLocaleString()

  let qrDataUrl: string | null = null
  try {
    qrDataUrl = await QRCode.toDataURL(opts.pageUrl, { margin: 0, width: 120 })
  } catch {
    /* leave qrDataUrl null */
  }

  const paragraphs = q.questions.map((text, i) => `${i + 1}. ${text}`)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10.5)
  const lineHeight = 5.2
  const maxTextY = pageH - footerReserve

  const allLines: string[] = []
  for (const p of paragraphs) {
    const wrapped = doc.splitTextToSize(p, pageW - margin * 2) as string[]
    allLines.push(...wrapped, '')
  }

  let i = 0
  let pageIndex = 0

  const newPage = (isFirst: boolean) => {
    if (pageIndex > 0) doc.addPage()
    pageIndex += 1
    drawWatermark(doc, watermark, pageW, pageH)
    if (opts.logoDataUrl) {
      try {
        doc.addImage(opts.logoDataUrl, 'PNG', margin, 12, 20, 20)
      } catch {
        /* ignore */
      }
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(15)
    doc.text(SITE_NAME, margin + (opts.logoDataUrl ? 24 : 0), 22)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`${q.regulation.toUpperCase()} · ${q.branch.toUpperCase()} · ${q.semester}`, margin, 29)
    doc.text(`${q.subjectName} (${q.subjectCode}) — Unit ${q.unitNumber}`, margin, 35)
    doc.setDrawColor(200, 200, 210)
    doc.line(margin, 39, pageW - margin, 39)
    if (isFirst) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      const titleLines = doc.splitTextToSize(q.title, pageW - margin * 2) as string[]
      let ty = 44
      for (const tl of titleLines) {
        doc.text(tl, margin, ty)
        ty += 5.5
      }
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10.5)
      return ty + 4
    }
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10.5)
    return 44
  }

  let y = newPage(true)
  while (i < allLines.length) {
    const line = allLines[i]!
    if (y > maxTextY) {
      y = newPage(false)
    }
    doc.text(line, margin, y)
    y += lineHeight
    i += 1
  }

  const total = doc.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    const baseY = pageH - footerReserve + 6
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text(`Downloaded: ${ts}`, margin, baseY)
    doc.text(`Page ${p} / ${total}`, pageW - margin, baseY, { align: 'right' })
    doc.text(
      `© ${new Date().getFullYear()} ${SITE_NAME}. Personal use only. ${watermark}`,
      margin,
      baseY + 4,
      { maxWidth: pageW - margin * 2 - (qrDataUrl ? 22 : 0) },
    )
    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', pageW - margin - 18, baseY - 2, 18, 18)
    }
    doc.setTextColor(30, 41, 59)
  }

  doc.save(`${q.slug}.pdf`)
}
