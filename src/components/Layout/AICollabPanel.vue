<template>
  <aside class="ai-panel">
    <div class="panel-header">
      <div class="title-wrap">
        <div class="title">{{ $t('layout.aiAssistantTitle') }}</div>
        <div class="subtitle">{{ $t('layout.aiAssistantSubtitle') }}</div>
      </div>
      <a-button type="text" class="close-btn" @click="emitClose">
        <CloseOutlined />
      </a-button>
    </div>

    <div class="context-row">
      <a-tag color="blue">{{ $t('layout.aiCurrentPage') }}: {{ currentPageTitle }}</a-tag>
      <a-tag>{{ route.path }}</a-tag>
    </div>

    <div class="quick-actions">
      <div class="section-title">{{ $t('layout.aiQuickActions') }}</div>
      <a-space wrap size="small">
        <a-button
          v-for="item in quickActions"
          :key="item.id"
          size="small"
          @click="applyPrompt(item.prompt)"
        >
          {{ item.label }}
        </a-button>
      </a-space>
    </div>

    <div ref="messagesBodyRef" class="messages">
      <template v-if="messages.length > 0">
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-item"
          :class="[`is-${message.role}`, { 'is-streaming': isStreaming && streamingMessageId === message.id }]"
        >
          <div class="message-role">{{ message.role === 'assistant' ? 'AI' : 'You' }}</div>
          <div class="message-content">{{ message.content }}</div>
        </div>
      </template>
      <div v-else class="message-empty">
        <div class="empty-title">{{ $t('layout.aiEmptyTitle') }}</div>
        <div class="empty-desc">{{ $t('layout.aiEmptyDescription') }}</div>
      </div>
    </div>

    <div class="input-wrap">
      <a-textarea
        v-model:value="draft"
        :rows="3"
        :placeholder="$t('layout.aiInputPlaceholder')"
        @keydown.enter="handleEnter"
      />
      <div class="input-actions">
        <span class="hint">{{ isStreaming ? $t('common.loading') : $t('layout.aiEnterHint') }}</span>
        <a-space size="small">
          <a-button size="small" @click="clearMessages">{{ $t('common.clear') }}</a-button>
          <a-button type="primary" size="small" :disabled="!draft.trim() || isStreaming" @click="sendMessage">
            {{ $t('common.submit') }}
          </a-button>
        </a-space>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { CloseOutlined } from '@antdv-next/icons'
import { $t } from '@/locales'
import { resolveLocaleText } from '@/utils/i18n'

type MessageRole = 'assistant' | 'user'

interface ChatMessage {
  id: number
  role: MessageRole
  content: string
}

interface QuickActionItem {
  id: string
  label: string
  prompt: string
}

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()
const draft = ref('')
const messages = ref<ChatMessage[]>([])
const messagesBodyRef = ref<HTMLElement | null>(null)
const isStreaming = ref(false)
const streamingMessageId = ref<number | null>(null)
let messageId = 0
let streamTimer: number | null = null

const currentPageTitle = computed(() => {
  const routeTitle = typeof route.meta?.title === 'string' ? route.meta.title : ''
  const routeName = typeof route.name === 'string' ? route.name : route.path
  if (routeTitle) {
    return resolveLocaleText(routeTitle, routeName)
  }
  return routeName
})

const quickActions = computed<QuickActionItem[]>(() => {
  return [
    {
      id: 'explain',
      label: $t('layout.aiActionExplain'),
      prompt: $t('layout.aiActionExplain')
    },
    {
      id: 'summary',
      label: $t('layout.aiActionSummary'),
      prompt: $t('layout.aiActionSummary')
    },
    {
      id: 'risk',
      label: $t('layout.aiActionRisk'),
      prompt: $t('layout.aiActionRisk')
    },
    {
      id: 'next-step',
      label: $t('layout.aiActionNextStep'),
      prompt: $t('layout.aiActionNextStep')
    }
  ]
})

const emitClose = () => {
  stopStreaming()
  emit('close')
}

const appendMessage = (role: MessageRole, content: string) => {
  messageId += 1
  messages.value.push({
    id: messageId,
    role,
    content
  })
  return messageId
}

const applyPrompt = (prompt: string) => {
  draft.value = prompt
}

const scrollToBottom = () => {
  requestAnimationFrame(() => {
    const body = messagesBodyRef.value
    if (!body) {
      return
    }
    body.scrollTop = body.scrollHeight
  })
}

const stopStreaming = () => {
  if (streamTimer !== null) {
    window.clearInterval(streamTimer)
    streamTimer = null
  }
  isStreaming.value = false
  streamingMessageId.value = null
}

const streamAssistantReply = (fullReply: string) => {
  stopStreaming()

  const assistantId = appendMessage('assistant', '')
  streamingMessageId.value = assistantId
  isStreaming.value = true

  let index = 0
  streamTimer = window.setInterval(() => {
    const target = messages.value.find(item => item.id === assistantId)
    if (!target) {
      stopStreaming()
      return
    }

    const step = Math.random() > 0.82 ? 2 : 1
    index = Math.min(fullReply.length, index + step)
    target.content = fullReply.slice(0, index)
    scrollToBottom()

    if (index >= fullReply.length) {
      stopStreaming()
    }
  }, 30)
}

const sendMessage = async () => {
  if (isStreaming.value) {
    return
  }

  const input = draft.value.trim()
  if (!input) {
    return
  }

  appendMessage('user', input)
  draft.value = ''
  await nextTick()
  scrollToBottom()

  const reply = $t('layout.aiDemoReply', { page: currentPageTitle.value })
  streamAssistantReply(reply)
}

const handleEnter = (event: KeyboardEvent) => {
  if (event.shiftKey) {
    return
  }
  event.preventDefault()
  void sendMessage()
}

const clearMessages = () => {
  stopStreaming()
  messages.value = []
}

onBeforeUnmount(() => {
  stopStreaming()
})
</script>

<style scoped lang="scss">
.ai-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-container);
  border-radius: 12px;
  border: 1px solid var(--color-border-secondary);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border-secondary);
  background: color-mix(in srgb, var(--color-primary) 6%, var(--color-bg-container));
}

.title-wrap {
  min-width: 0;
}

.title {
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.subtitle {
  margin-top: 2px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.close-btn {
  flex-shrink: 0;
}

.context-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 12px 0;
}

.quick-actions {
  padding: 10px 12px 0;
}

.section-title {
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.messages {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-role {
  font-size: 11px;
  color: var(--color-text-tertiary);
}

.message-content {
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.message-item.is-assistant .message-content {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-text-primary);
}

.message-item.is-user .message-content {
  background: var(--color-bg-layout);
  color: var(--color-text-primary);
}

.message-item.is-streaming .message-content::after {
  content: '';
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-left: 2px;
  vertical-align: -2px;
  background: currentColor;
  animation: ai-stream-caret 1s steps(1) infinite;
}

.message-empty {
  margin: auto;
  text-align: center;
  color: var(--color-text-tertiary);
}

.empty-title {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.empty-desc {
  margin-top: 4px;
  font-size: 12px;
}

.input-wrap {
  border-top: 1px solid var(--color-border-secondary);
  padding: 10px 12px;
}

.input-actions {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.hint {
  font-size: 11px;
  color: var(--color-text-tertiary);
}

@keyframes ai-stream-caret {
  0%, 49% {
    opacity: 1;
  }

  50%, 100% {
    opacity: 0;
  }
}
</style>
