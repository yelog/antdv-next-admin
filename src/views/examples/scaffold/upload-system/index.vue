<template>
  <div class="page-container">
    <div class="card">
      <h2>上传体系示例</h2>
      <p class="text-secondary mb-lg">拖拽上传 + 进度 + 失败重试 + 图片预览，便于直接迁移到业务页。</p>

      <a-space wrap class="mb-md">
        <a-tag color="processing">上传中 {{ uploadingCount }}</a-tag>
        <a-tag color="success">成功 {{ doneCount }}</a-tag>
        <a-tag color="error">失败 {{ errorCount }}</a-tag>
      </a-space>

      <a-upload-dragger
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
        <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p class="ant-upload-hint">支持图片与文档，上传过程会随机模拟失败，用于验证重试逻辑。</p>
      </a-upload-dragger>

      <div class="toolbar">
        <a-space>
          <a-button :disabled="errorCount === 0" @click="retryFailed">重试失败项</a-button>
          <a-button danger :disabled="fileList.length === 0" @click="clearAll">清空列表</a-button>
        </a-space>
        <div class="text-secondary">失败率：{{ Math.round(failureRate * 100) }}%</div>
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
const previewTitle = ref('文件预览')

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
      const error = new Error('网络波动导致上传失败')

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
      message.success(`上传成功：${options.file.name}`)
    },
    onError: (error) => {
      options.onError?.(error)
      message.error(`上传失败：${options.file.name}`)
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

  message.info(`开始重试 ${failedFiles.length} 个失败文件`)
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
    message.warning('该文件暂不支持预览')
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

.preview-image {
  width: 100%;
  max-height: 72vh;
  object-fit: contain;
  border-radius: 8px;
}
</style>
