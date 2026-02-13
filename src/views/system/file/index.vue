<template>
  <div class="page-container">
    <ProTable
      :key="refreshKey"
      :columns="columns"
      :request="loadFileList"
      :toolbar="{
        title: '文件管理',
        actions: []
      }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'originalName'">
          <div class="file-name">
            <span class="file-icon" :style="{ color: getExtColor(record.ext) }">
              <FileImageOutlined v-if="isImage(record.ext)" />
              <VideoCameraOutlined v-else-if="isVideo(record.ext)" />
              <FilePdfOutlined v-else-if="record.ext === 'pdf'" />
              <FileExcelOutlined v-else-if="['xlsx', 'xls'].includes(record.ext)" />
              <FileWordOutlined v-else-if="['docx', 'doc'].includes(record.ext)" />
              <FilePptOutlined v-else-if="['pptx', 'ppt'].includes(record.ext)" />
              <FileZipOutlined v-else-if="['zip', 'rar', '7z'].includes(record.ext)" />
              <FileTextOutlined v-else />
            </span>
            <span>{{ record.originalName }}</span>
          </div>
        </template>
        <template v-if="column.key === 'size'">
          {{ formatSize(record.size) }}
        </template>
        <template v-if="column.key === 'storage'">
          <a-tag :color="storageColor[record.storage]">{{ storageLabel[record.storage] }}</a-tag>
        </template>
        <template v-if="column.key === 'action'">
          <a-space :size="4">
            <a-button type="link" size="small" danger @click="handleDelete(record)">
              <template #icon><DeleteOutlined /></template>
              删除
            </a-button>
          </a-space>
        </template>
      </template>
    </ProTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message, Modal } from 'antdv-next'
import {
  DeleteOutlined, FileImageOutlined, VideoCameraOutlined,
  FilePdfOutlined, FileExcelOutlined, FileWordOutlined,
  FilePptOutlined, FileZipOutlined, FileTextOutlined
} from '@antdv-next/icons'
import ProTable from '@/components/Pro/ProTable/index.vue'
import type { ProTableColumn } from '@/types/pro'
import type { SysFile } from '@/types/file'
import { getFileList, deleteFile } from '@/api/file'

const refreshKey = ref(0)

const storageLabel: Record<string, string> = { local: '本地', oss: 'OSS', cos: 'COS' }
const storageColor: Record<string, string> = { local: 'default', oss: 'blue', cos: 'green' }

const isImage = (ext: string) => ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)
const isVideo = (ext: string) => ['mp4', 'avi', 'mov', 'wmv'].includes(ext)

const getExtColor = (ext: string) => {
  const colors: Record<string, string> = {
    jpg: '#f5222d', jpeg: '#f5222d', png: '#fa541c', gif: '#fa8c16', svg: '#a0d911',
    pdf: '#cf1322', docx: '#1677ff', doc: '#1677ff', xlsx: '#52c41a', xls: '#52c41a',
    pptx: '#fa541c', ppt: '#fa541c', zip: '#faad14', rar: '#faad14',
    mp4: '#722ed1', txt: '#8c8c8c'
  }
  return colors[ext] || '#8c8c8c'
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

const columns: ProTableColumn[] = [
  { title: '文件名', dataIndex: 'originalName', key: 'originalName', search: true, searchType: 'input', ellipsis: true },
  { title: '扩展名', dataIndex: 'ext', key: 'ext', width: 90, search: true, searchType: 'select', searchOptions: [
    { label: '图片(jpg)', value: 'jpg' }, { label: '图片(png)', value: 'png' },
    { label: 'PDF', value: 'pdf' }, { label: 'Word', value: 'docx' },
    { label: 'Excel', value: 'xlsx' }, { label: '压缩包', value: 'zip' },
    { label: '视频', value: 'mp4' }, { label: '文本', value: 'txt' },
    { label: 'PPT', value: 'pptx' }, { label: 'SVG', value: 'svg' }
  ]},
  { title: '文件大小', dataIndex: 'size', key: 'size', width: 120 },
  { title: '存储方式', dataIndex: 'storage', key: 'storage', width: 100, search: true, searchType: 'select', searchOptions: [
    { label: '本地', value: 'local' }, { label: 'OSS', value: 'oss' }, { label: 'COS', value: 'cos' }
  ]},
  { title: '上传者', dataIndex: 'uploader', key: 'uploader', width: 100 },
  { title: '上传时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 100, fixed: 'right' }
]

const loadFileList = async (params: any) => {
  try {
    const response = await getFileList({
      name: params.originalName,
      ext: params.ext,
      storage: params.storage,
      page: params.current,
      pageSize: params.pageSize
    }) as any
    if (response.code === 200) {
      return { data: response.data.list, total: response.data.total, success: true }
    }
  } catch (error) {
    console.error('加载文件列表失败:', error)
  }
  return { data: [], total: 0, success: false }
}

const handleDelete = (record: SysFile) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除文件"${record.originalName}"吗？`,
    onOk: async () => {
      try {
        const response = await deleteFile(record.id) as any
        if (response.code === 200) {
          message.success('删除成功')
          refreshKey.value++
        } else {
          message.error(response.message || '删除失败')
        }
      } catch { message.error('删除失败') }
    }
  })
}
</script>

<style scoped lang="scss">
.file-name {
  display: flex;
  align-items: center;
  gap: 8px;

  .file-icon {
    font-size: 18px;
    flex-shrink: 0;
  }
}
</style>
