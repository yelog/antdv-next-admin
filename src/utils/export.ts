/**
 * Excel 导入导出工具
 * 基于原生实现，不依赖第三方库，生成标准 CSV 格式
 */

export interface ExportColumn {
  title: string
  dataIndex: string
  /** 自定义格式化 */
  render?: (value: any, record: any) => string
}

/**
 * 导出数据为 CSV 文件
 */
export function exportToCSV(
  columns: ExportColumn[],
  data: any[],
  filename: string = 'export'
) {
  const BOM = '\uFEFF'
  const header = columns.map(col => `"${col.title}"`).join(',')
  const rows = data.map(record =>
    columns.map(col => {
      const value = col.render
        ? col.render(record[col.dataIndex], record)
        : record[col.dataIndex] ?? ''
      return `"${String(value).replace(/"/g, '""')}"`
    }).join(',')
  )

  const csv = BOM + [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `${filename}.csv`)
}

/**
 * 解析 CSV 文件为数据数组
 */
export function parseCSV(file: File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = (e.target?.result as string).replace(/^\uFEFF/, '')
        const rows = text.split('\n').filter(row => row.trim())
        const result = rows.map(row => {
          const cells: string[] = []
          let current = ''
          let inQuotes = false
          for (let i = 0; i < row.length; i++) {
            const char = row[i]
            if (inQuotes) {
              if (char === '"' && row[i + 1] === '"') {
                current += '"'
                i++
              } else if (char === '"') {
                inQuotes = false
              } else {
                current += char
              }
            } else {
              if (char === '"') {
                inQuotes = true
              } else if (char === ',') {
                cells.push(current.trim())
                current = ''
              } else {
                current += char
              }
            }
          }
          cells.push(current.trim())
          return cells
        })
        resolve(result)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsText(file, 'utf-8')
  })
}

/**
 * 导出数据为 JSON 文件
 */
export function exportToJSON(data: any[], filename: string = 'export') {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
  downloadBlob(blob, `${filename}.json`)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
