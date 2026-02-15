import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { ScoreReportData } from '@/types'

/**
 * 한글을 로마자로 변환 (간단한 변환)
 */
function koreanToRoman(text: string): string {
  // 한글이 포함되어 있으면 공백으로 대체
  return text.replace(/[\uAC00-\uD7A3]/g, '')
}

/**
 * TOEIC Speaking 성적표 PDF 생성
 */
export async function generateScorePDF(data: ScoreReportData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4 size
  const { width, height } = page.getSize()

  // 폰트 로드
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const margin = 50
  let yPosition = height - margin

  // 헤더
  page.drawText('TOEIC Speaking Score Report', {
    x: margin,
    y: yPosition,
    size: 24,
    font: fontBold,
    color: rgb(0, 0.3, 0.6)
  })

  yPosition -= 60

  // 응시자 정보 - 한글 제거
  // 한글이 있으면 "Korean Name" 레이블만 표시
  const hasKorean = /[\uAC00-\uD7A3]/.test(data.candidateName)
  
  if (hasKorean) {
    page.drawText('Candidate Name: [Korean characters not supported in PDF]', {
      x: margin,
      y: yPosition,
      size: 12,
      font
    })
  } else {
    page.drawText(`Candidate Name: ${data.candidateName}`, {
      x: margin,
      y: yPosition,
      size: 12,
      font
    })
  }

  yPosition -= 25

  page.drawText(`Candidate Number: ${data.candidateNumber}`, {
    x: margin,
    y: yPosition,
    size: 14,
    font: fontBold,
    color: rgb(0, 0.3, 0.6)
  })

  yPosition -= 25

  page.drawText(`Test Date: ${data.testDate}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font
  })

  yPosition -= 60

  // 점수 섹션
  page.drawRectangle({
    x: margin,
    y: yPosition - 100,
    width: width - (margin * 2),
    height: 120,
    borderColor: rgb(0, 0.3, 0.6),
    borderWidth: 2
  })

  page.drawText('TOEIC Speaking Score', {
    x: margin + 20,
    y: yPosition - 30,
    size: 14,
    font: fontBold
  })

  page.drawText(`${data.score}`, {
    x: width / 2 - 30,
    y: yPosition - 70,
    size: 48,
    font: fontBold,
    color: rgb(0, 0.3, 0.6)
  })

  page.drawText('/ 200', {
    x: width / 2 + 40,
    y: yPosition - 60,
    size: 18,
    font
  })

  yPosition -= 140

  // 점수 바 그래프
  const barWidth = (width - (margin * 2)) * (data.score / 200)
  page.drawRectangle({
    x: margin,
    y: yPosition - 20,
    width: width - (margin * 2),
    height: 30,
    color: rgb(0.9, 0.9, 0.9)
  })

  page.drawRectangle({
    x: margin,
    y: yPosition - 20,
    width: barWidth,
    height: 30,
    color: rgb(0, 0.5, 0.8)
  })

  yPosition -= 60

  // CEFR 레벨
  page.drawText('CEFR Level', {
    x: margin,
    y: yPosition,
    size: 14,
    font: fontBold
  })

  yPosition -= 30

  // CEFR 레벨에서 한글 제거
  const cefrLevelText = data.cefrLevel.replace('_', ' ').replace(/[\uAC00-\uD7A3]/g, '')
  page.drawText(cefrLevelText, {
    x: margin,
    y: yPosition,
    size: 20,
    font: fontBold,
    color: rgb(0, 0.5, 0)
  })

  yPosition -= 40

  // CEFR 설명
  page.drawText('Level Description:', {
    x: margin,
    y: yPosition,
    size: 12,
    font: fontBold
  })

  yPosition -= 25

  // 설명 텍스트에서 한글 제거 후 줄바꿈 처리
  const descriptionText = data.cefrDescription.replace(/[\uAC00-\uD7A3]/g, '')
  const maxWidth = width - (margin * 2)
  const words = descriptionText.split(' ')
  let line = ''
  const lines: string[] = []

  for (const word of words) {
    const testLine = line + word + ' '
    const testWidth = font.widthOfTextAtSize(testLine, 11)
    
    if (testWidth > maxWidth && line.length > 0) {
      lines.push(line.trim())
      line = word + ' '
    } else {
      line = testLine
    }
  }
  if (line.length > 0) {
    lines.push(line.trim())
  }

  for (const textLine of lines) {
    page.drawText(textLine, {
      x: margin,
      y: yPosition,
      size: 11,
      font
    })
    yPosition -= 20
  }

  // 푸터
  page.drawText('This is an official TOEIC Speaking test score report.', {
    x: margin,
    y: 50,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5)
  })

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}
