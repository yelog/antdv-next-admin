<template>
  <!-- Button mode -->
  <a-upload
    v-if="mode === 'button'"
    v-model:file-list="fileList"
    :accept="accept"
    :max-count="maxCount"
    :action="action"
    :before-upload="handleBeforeUpload"
    v-bind="$attrs"
    @update:file-list="handleChange"
  >
    <a-button>
      <UploadOutlined />
      {{ buttonText || $t('proUpload.uploadFile') }}
    </a-button>
    <template v-if="hint" #itemRender>
      <span />
    </template>
  </a-upload>

  <!-- Dragger mode -->
  <a-upload-dragger
    v-else-if="mode === 'dragger'"
    v-model:file-list="fileList"
    :accept="accept"
    :max-count="maxCount"
    :action="action"
    :before-upload="handleBeforeUpload"
    v-bind="$attrs"
    @update:file-list="handleChange"
  >
    <p class="ant-upload-drag-icon">
      <InboxOutlined />
    </p>
    <p class="ant-upload-text">{{ buttonText || $t('proUpload.dragHint') }}</p>
    <p v-if="hint" class="ant-upload-hint">{{ hint }}</p>
  </a-upload-dragger>

  <!-- Image mode -->
  <a-upload
    v-else-if="mode === 'image'"
    v-model:file-list="fileList"
    :accept="accept || 'image/*'"
    :max-count="maxCount"
    :action="action"
    :before-upload="handleBeforeUpload"
    list-type="picture-card"
    v-bind="$attrs"
    @update:file-list="handleChange"
  >
    <div v-if="!maxCount || fileList.length < maxCount">
      <PlusOutlined />
      <div style="margin-top: 8px">{{ buttonText || $t('proUpload.uploadImage') }}</div>
    </div>
  </a-upload>

  <!-- Avatar mode -->
  <a-upload
    v-else-if="mode === 'avatar'"
    v-model:file-list="fileList"
    :accept="accept || 'image/*'"
    :max-count="1"
    :action="action"
    :before-upload="handleBeforeUpload"
    :show-upload-list="false"
    class="pro-upload-avatar"
    v-bind="$attrs"
    @update:file-list="handleChange"
  >
    <div class="pro-upload-avatar-wrapper">
      <a-avatar v-if="avatarUrl" :src="avatarUrl" :size="96" />
      <div v-else class="pro-upload-avatar-placeholder">
        <UserOutlined style="font-size: 32px; color: var(--color-text-quaternary)" />
      </div>
      <div class="pro-upload-avatar-overlay">
        <CameraOutlined />
      </div>
    </div>
  </a-upload>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { message } from 'antdv-next'
import { UploadOutlined, InboxOutlined, PlusOutlined, UserOutlined, CameraOutlined } from '@antdv-next/icons'
import { $t } from '@/locales'
import type { ProUploadMode } from '@/types/pro'

interface UploadFile {
  uid: string
  name: string
  status?: string
  url?: string
  thumbUrl?: string
  originFileObj?: File
  [key: string]: any
}

interface Props {
  value?: UploadFile[]
  mode?: ProUploadMode
  accept?: string
  maxSize?: number
  maxCount?: number
  action?: string
  buttonText?: string
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'button',
  maxSize: 10
})

const emit = defineEmits(['update:value', 'change'])

const fileList = ref<UploadFile[]>(props.value ?? [])

watch(() => props.value, (val) => {
  if (val) fileList.value = val
})

const avatarUrl = computed(() => {
  const file = fileList.value[0]
  if (!file) return ''
  if (file.thumbUrl) return file.thumbUrl
  if (file.url) return file.url
  if (file.originFileObj) return URL.createObjectURL(file.originFileObj)
  return ''
})

const handleBeforeUpload = (file: File) => {
  if (props.maxSize) {
    const isLt = file.size / 1024 / 1024 < props.maxSize
    if (!isLt) {
      message.error($t('proUpload.fileSizeExceed', { size: props.maxSize }))
      return false
    }
  }
  if (props.accept) {
    const acceptList = props.accept.split(',').map(s => s.trim())
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    const mime = file.type
    const match = acceptList.some(a => {
      if (a.startsWith('.')) return ext === a.toLowerCase()
      if (a.endsWith('/*')) return mime.startsWith(a.replace('/*', '/'))
      return mime === a
    })
    if (!match) {
      message.error($t('proUpload.fileTypeNotAllowed'))
      return false
    }
  }
  return true
}

const handleChange = (files: UploadFile[]) => {
  fileList.value = files
  emit('update:value', files)
  emit('change', files)
}
</script>

<style scoped lang="scss">
.pro-upload-avatar {
  :deep(.ant-upload) {
    cursor: pointer;
  }

  .pro-upload-avatar-wrapper {
    position: relative;
    width: 96px;
    height: 96px;
    border-radius: 50%;
    overflow: hidden;

    .pro-upload-avatar-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-fill-quaternary, #fafafa);
      border: 1px dashed var(--color-border);
      border-radius: 50%;
    }

    .pro-upload-avatar-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.4);
      color: #fff;
      font-size: 20px;
      opacity: 0;
      transition: opacity 0.2s;
      border-radius: 50%;
    }

    &:hover .pro-upload-avatar-overlay {
      opacity: 1;
    }
  }
}
</style>
