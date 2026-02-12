<template>
  <div class="page-container">
    <div class="card">
      <h2>请求与鉴权闭环示例</h2>
      <p class="mb-lg text-secondary">
        演示并发请求触发 401 时的排队刷新机制，以及刷新失败后的重登兜底。
      </p>

      <a-alert
        v-if="reloginRequired"
        type="error"
        show-icon
        class="mb-lg"
        message="刷新失败，已进入重登态"
        description="后续请求会继续失败，点击“重置会话”后重新发起请求。"
      />

      <div class="status-grid mb-lg">
        <div class="status-item">
          <span class="label">Access Token</span>
          <code>{{ accessToken || '空' }}</code>
        </div>
        <div class="status-item">
          <span class="label">Refresh Token</span>
          <code>{{ refreshToken || '空' }}</code>
        </div>
        <div class="status-item">
          <span class="label">刷新状态</span>
          <a-tag :color="refreshing ? 'processing' : 'default'">
            {{ refreshing ? '刷新中' : '空闲' }}
          </a-tag>
        </div>
      </div>

      <a-space wrap :size="10" class="mb-lg">
        <a-button type="primary" @click="handleSingleRequest">发起单请求</a-button>
        <a-button @click="handleConcurrentRequest">并发 5 个请求</a-button>
        <a-button @click="expireAccessToken">令 Token 过期</a-button>
        <a-button danger @click="handleRefreshFailScenario">模拟刷新失败</a-button>
        <a-button @click="resetSession">重置会话</a-button>
      </a-space>

      <div class="log-toolbar">
        <span class="text-secondary">事件日志（最近 80 条）</span>
        <a-button size="small" @click="logs = []">清空日志</a-button>
      </div>

      <div class="log-list">
        <div v-if="logs.length === 0" class="log-empty">暂无日志</div>
        <div v-for="item in logs" :key="item.id" class="log-item" :class="`is-${item.level}`">
          <span class="log-time">{{ item.time }}</span>
          <span class="log-text">{{ item.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'antdv-next'

type LogLevel = 'info' | 'success' | 'error'

type RequestError = {
  status: number
  message: string
}

type SessionState = {
  accessToken: string
  refreshToken: string
}

const logs = ref<Array<{ id: number; time: string; level: LogLevel; text: string }>>([])
const accessToken = ref('expired-token')
const refreshToken = ref('refresh-token-demo')
const refreshing = ref(false)
const reloginRequired = ref(false)

let failNextRefresh = false
let logId = 0
let refreshPromise: Promise<string> | null = null

const now = () => new Date().toLocaleTimeString('zh-CN', { hour12: false })

const pushLog = (text: string, level: LogLevel = 'info') => {
  logs.value.unshift({
    id: ++logId,
    time: now(),
    level,
    text
  })

  if (logs.value.length > 80) {
    logs.value = logs.value.slice(0, 80)
  }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const mockProtectedApi = async (apiName: string) => {
  await delay(280 + Math.round(Math.random() * 320))

  if (!accessToken.value || accessToken.value.startsWith('expired')) {
    throw {
      status: 401,
      message: `[${apiName}] token 已过期`
    } as RequestError
  }

  return {
    code: 200,
    message: `[${apiName}] 请求成功`
  }
}

const mockRefreshApi = async () => {
  await delay(700)

  if (!refreshToken.value || failNextRefresh) {
    failNextRefresh = false
    throw {
      status: 401,
      message: 'refresh token 无效'
    } as RequestError
  }

  const nextToken = `valid-token-${Date.now()}`
  return {
    code: 200,
    data: {
      token: nextToken,
      refreshToken: refreshToken.value
    }
  }
}

const ensureTokenRefreshed = async () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        refreshing.value = true
        pushLog('触发刷新 token（仅首个 401 请求执行）')
        const result = await mockRefreshApi()
        accessToken.value = result.data.token
        reloginRequired.value = false
        pushLog('token 刷新成功，释放排队请求', 'success')
        return result.data.token
      } catch (error: any) {
        accessToken.value = ''
        reloginRequired.value = true
        pushLog(`token 刷新失败：${error.message}，进入重登态`, 'error')
        throw error
      } finally {
        refreshing.value = false
        refreshPromise = null
      }
    })()
  } else {
    pushLog('检测到刷新进行中，请求进入排队等待')
  }

  return refreshPromise
}

const requestWithAutoRefresh = async (apiName: string) => {
  try {
    const result = await mockProtectedApi(apiName)
    pushLog(result.message, 'success')
    return result
  } catch (error: any) {
    if (error.status !== 401) {
      pushLog(`[${apiName}] 非 401 错误：${error.message}`, 'error')
      throw error
    }

    pushLog(`[${apiName}] 触发 401，准备刷新 token`, 'info')

    await ensureTokenRefreshed()

    const retried = await mockProtectedApi(`${apiName}-retry`)
    pushLog(retried.message, 'success')
    return retried
  }
}

const expireAccessToken = () => {
  accessToken.value = 'expired-token'
  pushLog('手动将 access token 标记为过期')
}

const resetSession = () => {
  const session: SessionState = {
    accessToken: 'expired-token',
    refreshToken: 'refresh-token-demo'
  }

  accessToken.value = session.accessToken
  refreshToken.value = session.refreshToken
  reloginRequired.value = false
  failNextRefresh = false
  pushLog('会话已重置，可重新发起请求')
}

const handleSingleRequest = async () => {
  try {
    await requestWithAutoRefresh('single')
  } catch {
    message.error('单请求执行失败')
  }
}

const handleConcurrentRequest = async () => {
  pushLog('开始并发 5 个请求，观察刷新排队行为')

  const results = await Promise.allSettled(
    Array.from({ length: 5 }, (_, index) => requestWithAutoRefresh(`parallel-${index + 1}`))
  )

  const failedCount = results.filter(item => item.status === 'rejected').length
  if (failedCount > 0) {
    message.warning(`并发请求完成，失败 ${failedCount} 个`)
  } else {
    message.success('并发请求全部成功')
  }
}

const handleRefreshFailScenario = async () => {
  expireAccessToken()
  failNextRefresh = true
  pushLog('下一次刷新将被强制失败')

  try {
    await requestWithAutoRefresh('refresh-fail-case')
  } catch {
    message.error('刷新失败场景已触发')
  }
}
</script>

<style scoped lang="scss">
.mb-lg {
  margin-bottom: var(--spacing-lg);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid var(--color-border-secondary);
  border-radius: 10px;
  padding: 10px 12px;

  .label {
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  code {
    display: block;
    font-family: var(--font-family-code);
    word-break: break-all;
  }
}

.log-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.log-list {
  border: 1px solid var(--color-border-secondary);
  border-radius: 10px;
  overflow: hidden;
  max-height: 340px;
  overflow-y: auto;
}

.log-empty {
  padding: 18px;
  text-align: center;
  color: var(--color-text-tertiary);
}

.log-item {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 10px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border-secondary);
  font-size: 13px;

  &:last-child {
    border-bottom: none;
  }

  &.is-success .log-text {
    color: var(--color-success);
  }

  &.is-error .log-text {
    color: var(--color-error);
  }
}

.log-time {
  color: var(--color-text-tertiary);
  font-family: var(--font-family-code);
}
</style>
