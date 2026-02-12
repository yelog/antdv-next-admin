<template>
  <div class="page-container">
    <div class="card mb-lg">
      <h2>可观测性与异常示例</h2>
      <p class="text-secondary">统一处理加载态、空态、错误态，并对错误进行分级与记录，支持一键重试。</p>

      <a-space wrap class="mt-sm">
        <a-button type="primary" @click="runScenario('success')">模拟成功</a-button>
        <a-button @click="runScenario('empty')">模拟空数据</a-button>
        <a-button danger @click="runScenario('network')">模拟网络错误</a-button>
        <a-button danger @click="runScenario('auth')">模拟鉴权错误</a-button>
        <a-button danger @click="runScenario('business')">模拟业务错误</a-button>
      </a-space>
    </div>

    <div class="grid-two">
      <div class="card">
        <div class="section-title">请求状态视图</div>

        <template v-if="state === 'loading'">
          <a-skeleton active :paragraph="{ rows: 5 }" />
        </template>

        <template v-else-if="state === 'empty'">
          <a-empty description="当前无可展示数据" />
        </template>

        <template v-else-if="state === 'error'">
          <a-result
            status="error"
            title="请求失败"
            :sub-title="errorMessage"
          >
            <template #extra>
              <a-button type="primary" @click="retryLast">重试</a-button>
            </template>
          </a-result>
        </template>

        <template v-else-if="state === 'success'">
          <a-list size="small" bordered :data-source="records">
            <template #renderItem="{ item }">
              <a-list-item>
                <strong>{{ item.name }}</strong>
                <span class="text-secondary">{{ item.value }}</span>
              </a-list-item>
            </template>
          </a-list>
        </template>

        <template v-else>
          <a-empty description="点击上方按钮开始模拟" />
        </template>
      </div>

      <div class="card">
        <div class="section-title">错误分类与事件日志</div>

        <div class="error-stats">
          <div class="stat-item">
            <span>网络错误</span>
            <strong>{{ errorStats.network }}</strong>
          </div>
          <div class="stat-item">
            <span>鉴权错误</span>
            <strong>{{ errorStats.auth }}</strong>
          </div>
          <div class="stat-item">
            <span>业务错误</span>
            <strong>{{ errorStats.business }}</strong>
          </div>
        </div>

        <div class="event-list">
          <div v-if="events.length === 0" class="event-empty">暂无事件</div>
          <div v-for="item in events" :key="item.id" class="event-item" :class="`is-${item.level}`">
            <span class="event-time">{{ item.time }}</span>
            <span class="event-text">{{ item.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

type Scenario = 'success' | 'empty' | 'network' | 'auth' | 'business'
type State = 'idle' | 'loading' | 'success' | 'empty' | 'error'

type LogLevel = 'info' | 'error' | 'success'

const state = ref<State>('idle')
const records = ref<Array<{ name: string; value: string }>>([])
const errorMessage = ref('')
const lastScenario = ref<Scenario | null>(null)

const errorStats = reactive({
  network: 0,
  auth: 0,
  business: 0
})

const events = ref<Array<{ id: number; time: string; text: string; level: LogLevel }>>([])
let logId = 0

const pushEvent = (text: string, level: LogLevel = 'info') => {
  events.value.unshift({
    id: ++logId,
    time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
    text,
    level
  })

  if (events.value.length > 60) {
    events.value = events.value.slice(0, 60)
  }
}

const mockFetch = async (scenario: Scenario) => {
  await new Promise(resolve => setTimeout(resolve, 700))

  switch (scenario) {
    case 'success':
      return {
        code: 200,
        data: [
          { name: 'service_a_latency', value: '120ms' },
          { name: 'service_b_qps', value: '2,398' },
          { name: 'error_rate', value: '0.35%' }
        ]
      }
    case 'empty':
      return {
        code: 200,
        data: []
      }
    case 'network':
      throw new Error('NetworkError: 请求超时，请检查网络连接')
    case 'auth':
      throw new Error('AuthError: token 过期，需要重新登录')
    case 'business':
      throw new Error('BusinessError: 规则配置冲突，无法计算')
    default:
      return {
        code: 200,
        data: []
      }
  }
}

const classifyError = (message: string) => {
  const lower = message.toLowerCase()
  if (lower.includes('network')) {
    return 'network' as const
  }
  if (lower.includes('auth') || lower.includes('token')) {
    return 'auth' as const
  }
  return 'business' as const
}

const runScenario = async (scenario: Scenario) => {
  lastScenario.value = scenario
  state.value = 'loading'
  records.value = []
  errorMessage.value = ''

  pushEvent(`开始模拟场景：${scenario}`)

  try {
    const result = await mockFetch(scenario)

    if (result.data.length === 0) {
      state.value = 'empty'
      pushEvent('请求成功但返回空数据')
      return
    }

    state.value = 'success'
    records.value = result.data
    pushEvent('请求成功并返回数据', 'success')
  } catch (error: any) {
    state.value = 'error'
    errorMessage.value = error.message || '未知错误'

    const type = classifyError(errorMessage.value)
    errorStats[type] += 1

    pushEvent(`请求失败（${type}）：${errorMessage.value}`, 'error')
  }
}

const retryLast = async () => {
  if (!lastScenario.value) {
    return
  }
  await runScenario(lastScenario.value)
}
</script>

<style scoped lang="scss">
.mb-lg {
  margin-bottom: var(--spacing-lg);
}

.mt-sm {
  margin-top: var(--spacing-sm);
}

.grid-two {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.section-title {
  font-weight: var(--font-weight-semibold);
  margin-bottom: 12px;
}

.error-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.stat-item {
  border: 1px solid var(--color-border-secondary);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;

  span {
    color: var(--color-text-secondary);
    font-size: 12px;
  }
}

.event-list {
  border: 1px solid var(--color-border-secondary);
  border-radius: 8px;
  max-height: 310px;
  overflow-y: auto;
}

.event-empty {
  text-align: center;
  color: var(--color-text-tertiary);
  padding: 20px;
}

.event-item {
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--color-border-secondary);

  &:last-child {
    border-bottom: none;
  }

  &.is-success .event-text {
    color: var(--color-success);
  }

  &.is-error .event-text {
    color: var(--color-error);
  }
}

.event-time {
  color: var(--color-text-tertiary);
  font-family: var(--font-family-code);
}

@media (max-width: 960px) {
  .grid-two {
    grid-template-columns: 1fr;
  }
}
</style>
