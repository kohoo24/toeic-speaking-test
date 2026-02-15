import * as XLSX from 'xlsx'
import { ScoreUploadRow } from '@/types'

/**
 * 엑셀 파일에서 사용자 데이터 파싱 (A열: 이름, B열: 수험번호)
 */
export function parseUsersFromExcel(file: File): Promise<{ name: string; examNumber: string }[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: ['name', 'examNumber'], defval: '' })
        
        console.log('엑셀 원본 데이터:', jsonData)
        
        // 헤더 행 자동 감지 (첫 행이 "이름", "name" 등이면 제거)
        let startIndex = 0
        if (jsonData.length > 0) {
          const firstRow = jsonData[0] as any
          const firstRowName = String(firstRow.name || '').toLowerCase()
          if (firstRowName.includes('이름') || firstRowName.includes('name') || firstRowName === 'a') {
            startIndex = 1
          }
        }
        
        // 데이터 검증 및 변환
        const users = jsonData.slice(startIndex)
          .filter((row: any) => row.name && row.examNumber)
          .map((row: any) => ({
            name: String(row.name).trim(),
            examNumber: String(row.examNumber).trim()
          }))
        
        console.log('파싱된 사용자 데이터:', users)
        
        if (users.length === 0) {
          reject(new Error('엑셀 파일에서 유효한 데이터를 찾을 수 없습니다. A열: 이름, B열: 수험번호 형식을 확인해주세요.'))
        } else {
          resolve(users)
        }
      } catch (error) {
        console.error('엑셀 파싱 에러:', error)
        reject(new Error('엑셀 파일 파싱 중 오류가 발생했습니다. 파일 형식을 확인해주세요.'))
      }
    }
    
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'))
    reader.readAsBinaryString(file)
  })
}

/**
 * 엑셀 파일에서 점수 데이터 파싱 (A열: 이름, B열: 수험번호, C열: 점수)
 */
export function parseScoresFromExcel(file: File): Promise<ScoreUploadRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(sheet, { 
          header: ['name', 'examNumber', 'score'] 
        })
        
        // 헤더 행 제거 및 데이터 검증
        const scores = jsonData.slice(1)
          .filter((row: any) => row.name && row.examNumber && row.score !== undefined)
          .map((row: any) => ({
            name: String(row.name).trim(),
            examNumber: String(row.examNumber).trim(),
            score: Number(row.score)
          }))
          .filter((row) => !isNaN(row.score) && row.score >= 0 && row.score <= 200)
        
        resolve(scores)
      } catch (error) {
        reject(new Error('엑셀 파일 파싱 중 오류가 발생했습니다.'))
      }
    }
    
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'))
    reader.readAsBinaryString(file)
  })
}

/**
 * 사용자 목록을 엑셀 파일로 변환
 */
export function exportUsersToExcel(users: { name: string; examNumber: string; hasCompleted: boolean }[]): Blob {
  const worksheet = XLSX.utils.json_to_sheet([
    { name: '이름', examNumber: '수험번호', hasCompleted: '응시완료' },
    ...users.map(u => ({
      name: u.name,
      examNumber: u.examNumber,
      hasCompleted: u.hasCompleted ? 'Y' : 'N'
    }))
  ], { skipHeader: true })
  
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '사용자 목록')
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

/**
 * 엑셀 파일 다운로드
 */
export function downloadExcelFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
