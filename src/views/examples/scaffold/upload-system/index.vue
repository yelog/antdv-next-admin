<template>
  <div class="page-container">
    <div class="card">
      <h2>{{ $t('examples.scaffold.uploadSystem.title') }}</h2>
      <p class="text-secondary mb-lg">{{ $t('examples.scaffold.uploadSystem.description') }}</p>

      <a-space wrap class="mb-md">
        <a-tag color="processing">{{ $t('examples.scaffold.uploadSystem.uploading') }} {{ uploadingCount }}</a-tag>
        <a-tag color="success">{{ $t('examples.scaffold.uploadSystem.success') }} {{ doneCount }}</a-tag>
        <a-tag color="error">{{ $t('examples.scaffold.uploadSystem.failed') }} {{ errorCount }}</a-tag>
      </a-space>

      <a-upload-dragger
        class="upload-system-dragger"
        v-model:file-list="fileList"
        name="file"
        multiple
        :custom-request="customRequest"
        :accept="'.png,.jpg,.jpeg,.pdf,.csv'"
        @preview="handlePreview"
      >
        <p class="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p class="ant-upload-text">{{ $t('examples.scaffold.uploadSystem.dragText') }}</p>
        <p class="ant-upload-hint">{{ $t('examples.scaffold.uploadSystem.dragHint') }}</p>
      </a-upload-dragger>

      <div class="toolbar">
        <a-space>
          <a-button :disabled="errorCount === 0" @click="retryFailed">{{ $t('examples.scaffold.uploadSystem.retryButton') }}</a-button>
          <a-button danger :disabled="fileList.length === 0" @click="clearAll">{{ $t('examples.scaffold.uploadSystem.clearButton') }}</a-button>
        </a-space>
        <div class="text-secondary">{{ $t('examples.scaffold.uploadSystem.failureRate') }}{{ Math.round(failureRate * 100) }}%</div>
      </div>

      <a-slider
        v-model:value="failureRate"
        :min="0"
        :max="0.9"
        :step="0.05"
      />
    </div>

    <a-modal
      v-model:open="previewOpen"
      :title="previewTitle"
      :footer="null"
      width="720px"
    >
      <img :src="previewSrc" alt="preview" class="preview-image" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { InboxOutlined } from '@antdv-next/icons'
import { message } from 'antdv-next'
import { $t } from '@/locales'

type UploadFileItem = {
  uid: string
  name: string
  status?: 'error' | 'success' | 'done' | 'uploading' | 'removed'
  percent?: number
  url?: string
  thumbUrl?: string
  originFileObj?: File
}

const fileList = ref<UploadFileItem[]>([])
const failureRate = ref(0.25)

const previewOpen = ref(false)
const previewSrc = ref('')
const previewTitle = ref($t('examples.scaffold.uploadSystem.previewTitle'))

const uploadingCount = computed(() => fileList.value.filter(item => item.status === 'uploading').length)
const doneCount = computed(() => fileList.value.filter(item => item.status === 'done' || item.status === 'success').length)
const errorCount = computed(() => fileList.value.filter(item => item.status === 'error').length)

const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = reject
  })
}

const markFileState = (uid: string, updater: (item: UploadFileItem) => void) => {
  const file = fileList.value.find(item => item.uid === uid)
  if (!file) {
    return
  }
  updater(file)
  fileList.value = [...fileList.value]
}

const runUploadTask = (
  uid: string,
  callbacks?: {
    onProgress?: (event: { percent: number }) => void
    onSuccess?: (response: any) => void
    onError?: (error: Error) => void
  }
) => {
  let percent = 0

  const timer = window.setInterval(() => {
    percent += 8 + Math.round(Math.random() * 16)

    if (percent >= 98) {
      percent = 98
    }

    markFileState(uid, (item) => {
      item.status = 'uploading'
      item.percent = percent
    })

    callbacks?.onProgress?.({ percent })
  }, 160)

  window.setTimeout(() => {
    window.clearInterval(timer)

    const failed = Math.random() < failureRate.value
    if (failed) {
      const error = new Error($t('examples.scaffold.uploadSystem.uploadFailedError'))

      markFileState(uid, (item) => {
        item.status = 'error'
        item.percent = 100
      })

      callbacks?.onError?.(error)
      return
    }

    const preview = `https://picsum.photos/seed/${uid}/880/560`

    markFileState(uid, (item) => {
      item.status = 'done'
      item.percent = 100
      item.url = item.url || preview
      item.thumbUrl = item.thumbUrl || preview
    })

    callbacks?.onSuccess?.({ url: preview })
  }, 1400 + Math.round(Math.random() * 900))
}

const customRequest = (options: any) => {
  const uid = options.file.uid

  runUploadTask(uid, {
    onProgress: ({ percent }) => {
      options.onProgress?.({ percent })
    },
    onSuccess: (response) => {
      options.onSuccess?.(response)
      message.success($t('examples.scaffold.uploadSystem.uploadSuccessMsg', { name: options.file.name }))
    },
    onError: (error) => {
      options.onError?.(error)
      message.error($t('examples.scaffold.uploadSystem.uploadFailedMsg', { name: options.file.name }))
    }
  })
}

const retryFailed = () => {
  const failedFiles = fileList.value.filter(item => item.status === 'error')
  if (failedFiles.length === 0) {
    return
  }

  failedFiles.forEach((item) => {
    runUploadTask(item.uid)
  })

  message.info($t('examples.scaffold.uploadSystem.retryMsg', { count: failedFiles.length }))
}

const clearAll = () => {
  fileList.value = []
}

const handlePreview = async (file: UploadFileItem) => {
  if (file.url) {
    previewSrc.value = file.url
  } else if (file.originFileObj) {
    previewSrc.value = await getBase64(file.originFileObj)
  } else {
    message.warning($t('examples.scaffold.uploadSystem.previewNotSupported'))
    return
  }

  previewTitle.value = file.name
  previewOpen.value = true
}
</script>

<style scoped lang="scss">
.mb-lg {
  margin-bottom: var(--spacing-lg);
}

.mb-md {
  margin-bottom: var(--spacing-md);
}

.toolbar {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

:deep(.upload-system-dragger.ant-upload-wrapper .ant-upload-drag) {
  height: 220px;
  min-height: 220px;
  background: var(--color-bg-layout);
}

:deep(.upload-system-dragger.ant-upload-wrapper .ant-upload-drag .ant-upload) {
  height: 100%;
  padding: 16px;
  background: transparent;
}

:deep(.upload-system-dragger.ant-upload-wrapper .ant-upload-drag .ant-upload-btn) {
  background: transparent;
}

:deep(.upload-system-dragger.ant-upload-wrapper .ant-upload-list) {
  margin-top: 10px;
}

.preview-image {
  width: 100%;
  max-height: 72vh;
  object-fit: contain;
  border-radius: 8px;
}
</style>
