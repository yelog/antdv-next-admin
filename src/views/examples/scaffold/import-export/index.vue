<template>
  <div class="page-container">
    <div class="card">
      <h2>{{ $t('examples.scaffold.importExport.title') }}</h2>
      <p class="text-secondary mb-lg">{{ $t('examples.scaffold.importExport.description') }}</p>

      <a-space wrap class="mb-lg">
        <a-button @click="downloadTemplate">
          <DownloadOutlined />
          {{ $t('examples.scaffold.importExport.downloadTemplate') }}
        </a-button>

        <a-upload
          :show-upload-list="false"
          accept=".csv"
          :before-upload="handleImport"
        >
          <a-button type="primary" :loading="importing">
            <UploadOutlined />
            {{ $t('examples.scaffold.importExport.importCsv') }}
          </a-button>
        </a-upload>

        <a-button @click="exportCurrentData">
          <DownloadOutlined />
          {{ $t('examples.scaffold.importExport.exportCurrent') }}
        </a-button>

        <a-button :disabled="importErrors.length === 0" @click="exportErrorReceipt">
          <DownloadOutlined />
          {{ $t('examples.scaffold.importExport.exportErrorReceipt') }}
        </a-button>
      </a-space>

      <a-row :gutter="12" class="mb-lg">
        <a-col :xs="12" :md="6">
          <a-statistic :title="$t('examples.scaffold.importExport.totalRows')" :value="lastSummary.total" />
        </a-col>
        <a-col :xs="12" :md="6">
          <a-statistic :title="$t('examples.scaffold.importExport.successRows')" :value="lastSummary.success" />
        </a-col>
        <a-col :xs="12" :md="6">
          <a-statistic :title="$t('examples.scaffold.importExport.updatedRows')" :value="lastSummary.updated" />
        </a-col>
        <a-col :xs="12" :md="6">
          <a-statistic :title="$t('examples.scaffold.importExport.failedRows')" :value="lastSummary.failed" />
        </a-col>
      </a-row>

      <a-alert
        class="mb-lg"
        type="info"
        show-icon
        :message="$t('examples.scaffold.importExport.importHint')"
      />

      <a-table
        row-key="code"
        size="small"
        :columns="dataColumns"
        :data-source="rows"
        :pagination="{ pageSize: 8 }"
      />

      <a-divider />

      <a-table
        row-key="id"
        size="small"
        :columns="errorColumns"
        :data-source="importErrors"
        :pagination="{ pageSize: 6 }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'antdv-next'
import { DownloadOutlined, UploadOutlined } from '@antdv-next/icons'
import { $t } from '@/locales'

interface ProductRow {
  code: string
  name: string
  category: string
  price: number
  stock: number
}

interface ImportErrorRow {
  id: string
  rowNo: number
  reason: string
  raw: string
}

interface ImportSummary {
  total: number
  success: number
  updated: number
  failed: number
}

const rows = ref<ProductRow[]>([
  { code: 'SKU-1001', name: 'Keyboard', category: 'Accessory', price: 299, stock: 120 },
  { code: 'SKU-1002', name: 'Mouse', category: 'Accessory', price: 159, stock: 200 },
  { code: 'SKU-1003', name: 'Monitor', category: 'Display', price: 1299, stock: 45 }
])

const importing = ref(false)
const importErrors = ref<ImportErrorRow[]>([])
const lastSummary = ref<ImportSummary>({
  total: 0,
  success: 0,
  updated: 0,
  failed: 0
})

const dataColumns = computed(() => [
  { title: $t('examples.scaffold.importExport.colCode'), dataIndex: 'code', width: 140 },
  { title: $t('examples.scaffold.importExport.colName'), dataIndex: 'name', width: 220 },
  { title: $t('examples.scaffold.importExport.colCategory'), dataIndex: 'category', width: 160 },
  { title: $t('examples.scaffold.importExport.colPrice'), dataIndex: 'price', width: 120 },
  { title: $t('examples.scaffold.importExport.colStock'), dataIndex: 'stock', width: 120 }
])

const errorColumns = computed(() => [
  { title: $t('examples.scaffold.importExport.errorRowNo'), dataIndex: 'rowNo', width: 100 },
  { title: $t('examples.scaffold.importExport.errorReason'), dataIndex: 'reason', width: 260 },
  { title: $t('examples.scaffold.importExport.errorRaw'), dataIndex: 'raw' }
])

function downloadTemplate() {
  const header = ['code', 'name', 'category', 'price', 'stock']
  const examples = [
    ['SKU-2001', 'Laptop Stand', 'Accessory', '399', '80'],
    ['SKU-2002', 'USB-C Hub', 'Accessory', '259', '150']
  ]
  downloadCsv([header, ...examples], 'import-template.csv')
}

function exportCurrentData() {
  const header = ['code', 'name', 'category', 'price', 'stock']
  const body = rows.value.map(item => [
    item.code,
    item.name,
    item.category,
    String(item.price),
    String(item.stock)
  ])
  downloadCsv([header, ...body], 'products-export.csv')
}

function exportErrorReceipt() {
  if (importErrors.value.length === 0) {
    return
  }

  const header = ['rowNo', 'reason', 'raw']
  const body = importErrors.value.map(item => [
    String(item.rowNo),
    item.reason,
    item.raw
  ])
  downloadCsv([header, ...body], 'import-error-receipt.csv')
}

async function handleImport(file: File) {
  importing.value = true

  try {
    const text = await file.text()
    const rowsInCsv = parseCsv(text)
    if (rowsInCsv.length < 2) {
      message.warning($t('examples.scaffold.importExport.emptyFile'))
      return false
    }

    const header = rowsInCsv[0].map(item => item.trim().toLowerCase())
    const indexes = {
      code: header.indexOf('code'),
      name: header.indexOf('name'),
      category: header.indexOf('category'),
      price: header.indexOf('price'),
      stock: header.indexOf('stock')
    }

    if (Object.values(indexes).some(index => index < 0)) {
      message.error($t('examples.scaffold.importExport.invalidHeader'))
      return false
    }

    const validRows: ProductRow[] = []
    const errors: ImportErrorRow[] = []
    let updatedCount = 0

    rowsInCsv.slice(1).forEach((line, idx) => {
      const rowNo = idx + 2
      const code = getCell(line, indexes.code)
      const name = getCell(line, indexes.name)
      const category = getCell(line, indexes.category)
      const priceText = getCell(line, indexes.price)
      const stockText = getCell(line, indexes.stock)

      const price = Number(priceText)
      const stock = Number(stockText)

      if (!code || !name || !category) {
        errors.push({
          id: `${rowNo}-required`,
          rowNo,
          reason: $t('examples.scaffold.importExport.errorRequired'),
          raw: line.join(' | ')
        })
        return
      }

      if (Number.isNaN(price) || price < 0) {
        errors.push({
          id: `${rowNo}-price`,
          rowNo,
          reason: $t('examples.scaffold.importExport.errorPrice'),
          raw: line.join(' | ')
        })
        return
      }

      if (!Number.isInteger(stock) || stock < 0) {
        errors.push({
          id: `${rowNo}-stock`,
          rowNo,
          reason: $t('examples.scaffold.importExport.errorStock'),
          raw: line.join(' | ')
        })
        return
      }

      const row: ProductRow = {
        code,
        name,
        category,
        price,
        stock
      }

      const target = rows.value.find(item => item.code === row.code)
      if (target) {
        target.name = row.name
        target.category = row.category
        target.price = row.price
        target.stock = row.stock
        updatedCount += 1
      } else {
        validRows.push(row)
      }
    })

    rows.value = [...rows.value, ...validRows]
    importErrors.value = errors
    lastSummary.value = {
      total: rowsInCsv.length - 1,
      success: validRows.length + updatedCount,
      updated: updatedCount,
      failed: errors.length
    }

    message.success($t('examples.scaffold.importExport.importDone', {
      success: lastSummary.value.success,
      failed: lastSummary.value.failed
    }))
  } catch (error) {
    console.error(error)
    message.error($t('examples.scaffold.importExport.parseFailed'))
  } finally {
    importing.value = false
  }

  return false
}

function parseCsv(csvText: string) {
  const lines = csvText
    .replace(/\r/g, '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  return lines.map(parseCsvLine)
}

function parseCsvLine(line: string) {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  result.push(current.trim())
  return result
}

function getCell(line: string[], index: number) {
  if (index < 0 || index >= line.length) {
    return ''
  }
  return line[index].trim()
}

function downloadCsv(rowsForExport: string[][], fileName: string) {
  const csv = rowsForExport
    .map(line => line.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()

  URL.revokeObjectURL(url)
}
</script>

<style scoped lang="scss">
.mb-lg {
  margin-bottom: var(--spacing-lg);
}
</style>
