<template>
  <div class="page-container">
    <ProTable
      :key="refreshKey"
      :columns="columns"
      :request="loadFileList"
      :toolbar="{
        title: t('file.title'),
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
          <a-tag :color="storageColor[record.storage]">{{ t(`file.storageType.${record.storage}`) }}</a-tag>
        </template>
        <template v-if="column.key === 'action'">
          <a-space :size="4">
            <a-button type="link" size="small" danger @click="handleDelete(record)">
              <template #icon><DeleteOutlined /></template>
              {{ t('file.delete') }}
            </a-button>
          </a-space>
        </template>
      </template>
    </ProTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message, Modal } from 'antdv-next'
import { useI18n } from 'vue-i18n'
import {
  DeleteOutlined, FileImageOutlined, VideoCameraOutlined,
  FilePdfOutlined, FileExcelOutlined, FileWordOutlined,
  FilePptOutlined, FileZipOutlined, FileTextOutlined
} from '@antdv-next/icons'
import ProTable from '@/components/Pro/ProTable/index.vue'
import type { ProTableColumn } from '@/types/pro'
import type { SysFile } from '@/types/file'
import { getFileList, deleteFile } from '@/api/file'

const { t } = useI18n()
const refreshKey = ref(0)

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

const columns = computed<ProTableColumn[]>(() => [
  { title: t('file.fileName'), dataIndex: 'originalName', key: 'originalName', search: true, searchType: 'input', ellipsis: true },
  { title: t('file.ext'), dataIndex: 'ext', key: 'ext', width: 90, search: true, searchType: 'select', searchOptions: [
    { label: t('file.extType.imageJpg'), value: 'jpg' }, { label: t('file.extType.imagePng'), value: 'png' },
    { label: t('file.extType.pdf'), value: 'pdf' }, { label: t('file.extType.word'), value: 'docx' },
    { label: t('file.extType.excel'), value: 'xlsx' }, { label: t('file.extType.zip'), value: 'zip' },
    { label: t('file.extType.video'), value: 'mp4' }, { label: t('file.extType.text'), value: 'txt' },
    { label: t('file.extType.ppt'), value: 'pptx' }, { label: t('file.extType.svg'), value: 'svg' }
  ]},
  { title: t('file.size'), dataIndex: 'size', key: 'size', width: 120 },
  { title: t('file.storage'), dataIndex: 'storage', key: 'storage', width: 100, search: true, searchType: 'select', searchOptions: [
    { label: t('file.storageType.local'), value: 'local' }, { label: t('file.storageType.oss'), value: 'oss' }, { label: t('file.storageType.cos'), value: 'cos' }
  ]},
  { title: t('file.uploader'), dataIndex: 'uploader', key: 'uploader', width: 100 },
  { title: t('file.uploadTime'), dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: t('file.action'), key: 'action', width: 100, fixed: 'right' }
])

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
    console.error(t('file.loadFailed'), error)
  }
  return { data: [], total: 0, success: false }
}

const handleDelete = (record: SysFile) => {
  Modal.confirm({
    title: t('file.confirmDelete'),
    content: t('file.confirmDeleteContent', { name: record.originalName }),
    onOk: async () => {
      try {
        const response = await deleteFile(record.id) as any
        if (response.code === 200) {
          message.success(t('file.deleteSuccess'))
          refreshKey.value++
        } else {
          message.error(response.message || t('file.deleteFailed'))
        }
      } catch { message.error(t('file.deleteFailed')) }
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
