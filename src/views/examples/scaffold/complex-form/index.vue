<template>
  <div class="page-container">
    <div class="card">
      <h2>复杂表单示例</h2>
      <p class="text-secondary mb-lg">步骤表单 + 动态策略项 + 异步校验 + 草稿保存 + 服务端字段错误映射。</p>

      <a-steps :current="currentStep" size="small" class="mb-lg">
        <a-step title="基本信息" />
        <a-step title="策略配置" />
        <a-step title="发布设置" />
      </a-steps>

      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        layout="vertical"
      >
        <template v-if="currentStep === 0">
          <div class="grid-two">
            <a-form-item label="项目名称" name="projectName">
              <a-input v-model:value="formState.projectName" placeholder="请输入项目名称" />
            </a-form-item>
            <a-form-item label="负责人" name="owner">
              <a-input v-model:value="formState.owner" placeholder="请输入负责人" />
            </a-form-item>
            <a-form-item label="场景" name="scene">
              <a-select
                v-model:value="formState.scene"
                placeholder="请选择场景"
                :options="sceneOptions"
              />
            </a-form-item>
            <a-form-item label="说明" name="description">
              <a-textarea v-model:value="formState.description" :rows="3" placeholder="请输入补充说明" />
            </a-form-item>
          </div>
        </template>

        <template v-else-if="currentStep === 1">
          <div class="mb-md">
            <a-space>
              <a-button type="dashed" @click="addRule">新增策略规则</a-button>
              <a-tag>当前 {{ formState.rules.length }} 条</a-tag>
            </a-space>
          </div>

          <div v-for="(rule, index) in formState.rules" :key="rule.id" class="rule-row">
            <a-input
              v-model:value="rule.metric"
              placeholder="指标名，如 error_rate"
            />
            <a-select
              v-model:value="rule.operator"
              :options="operatorOptions"
              style="width: 120px"
            />
            <a-input-number
              v-model:value="rule.threshold"
              :min="0"
              :max="10000"
              style="width: 180px"
            />
            <a-button danger @click="removeRule(index)">删除</a-button>
          </div>

          <a-alert
            v-if="ruleError"
            class="mt-md"
            type="error"
            show-icon
            :message="ruleError"
          />
        </template>

        <template v-else>
          <div class="grid-two">
            <a-form-item label="发布方式" name="publishType">
              <a-radio-group v-model:value="formState.publishType">
                <a-radio value="immediate">立即发布</a-radio>
                <a-radio value="schedule">定时发布</a-radio>
              </a-radio-group>
            </a-form-item>

            <a-form-item
              label="发布时间"
              name="publishTime"
              :rules="[
                {
                  validator: validatePublishTime,
                  trigger: 'change'
                }
              ]"
            >
              <a-date-picker
                v-model:value="formState.publishTime"
                show-time
                style="width: 100%"
                :disabled="formState.publishType !== 'schedule'"
              />
            </a-form-item>

            <a-form-item label="通知对象" name="notifyUsers" class="full-row">
              <a-select
                v-model:value="formState.notifyUsers"
                mode="tags"
                :token-separators="[',']"
                placeholder="输入用户名并回车"
              />
            </a-form-item>
          </div>
        </template>
      </a-form>

      <div class="footer-actions">
        <a-space wrap>
          <a-button :disabled="currentStep === 0" @click="prevStep">上一步</a-button>
          <a-button v-if="currentStep < 2" type="primary" @click="nextStep">下一步</a-button>
          <a-button v-else type="primary" @click="submitForm">提交</a-button>
          <a-button @click="saveDraft">保存草稿</a-button>
          <a-button @click="resetForm">重置</a-button>
        </a-space>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { message } from 'antdv-next'

interface PolicyRule {
  id: string
  metric: string
  operator: '>' | '>=' | '<' | '<='
  threshold: number | null
}

interface FormState {
  projectName: string
  owner: string
  scene: string
  description: string
  rules: PolicyRule[]
  publishType: 'immediate' | 'schedule'
  publishTime: any
  notifyUsers: string[]
}

const DRAFT_KEY = 'example:complex-form:draft'

const formRef = ref<any>()
const currentStep = ref(0)
const ruleError = ref('')

const formState = reactive<FormState>({
  projectName: '',
  owner: '',
  scene: '',
  description: '',
  rules: [
    {
      id: `${Date.now()}`,
      metric: 'error_rate',
      operator: '>',
      threshold: 5
    }
  ],
  publishType: 'immediate',
  publishTime: null,
  notifyUsers: []
})

const sceneOptions = [
  { label: '用户增长', value: 'growth' },
  { label: '风控预警', value: 'risk' },
  { label: '稳定性监控', value: 'stability' }
]

const operatorOptions = [
  { label: '>', value: '>' },
  { label: '>=', value: '>=' },
  { label: '<', value: '<' },
  { label: '<=', value: '<=' }
]

const checkProjectNameUnique = async (_rule: any, value: string) => {
  if (!value) {
    return Promise.reject(new Error('请输入项目名称'))
  }

  await new Promise(resolve => setTimeout(resolve, 300))

  const reservedNames = ['default', 'admin', 'production']
  if (reservedNames.includes(value.trim().toLowerCase())) {
    return Promise.reject(new Error('项目名称已存在，请更换'))
  }

  return Promise.resolve()
}

const rules = {
  projectName: [
    { required: true, message: '请输入项目名称' },
    { validator: checkProjectNameUnique, trigger: 'blur' }
  ],
  owner: [{ required: true, message: '请输入负责人' }],
  scene: [{ required: true, message: '请选择场景' }],
  publishType: [{ required: true, message: '请选择发布方式' }]
}

const validatePublishTime = async () => {
  if (formState.publishType === 'schedule' && !formState.publishTime) {
    return Promise.reject(new Error('定时发布必须选择发布时间'))
  }
  return Promise.resolve()
}

const validateRuleList = () => {
  if (formState.rules.length === 0) {
    ruleError.value = '请至少添加一条策略规则'
    return false
  }

  const invalid = formState.rules.some(item => {
    return !item.metric || !item.operator || item.threshold == null
  })

  if (invalid) {
    ruleError.value = '策略规则存在未填写项，请补充完整'
    return false
  }

  ruleError.value = ''
  return true
}

const addRule = () => {
  formState.rules.push({
    id: `${Date.now()}-${Math.random()}`,
    metric: '',
    operator: '>',
    threshold: null
  })
}

const removeRule = (index: number) => {
  formState.rules.splice(index, 1)
}

const nextStep = async () => {
  if (currentStep.value === 0) {
    await formRef.value?.validateFields?.(['projectName', 'owner', 'scene'])
  }

  if (currentStep.value === 1 && !validateRuleList()) {
    return
  }

  currentStep.value += 1
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value -= 1
  }
}

const saveDraft = () => {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(formState))
  message.success('草稿已保存')
}

const loadDraft = () => {
  const draft = localStorage.getItem(DRAFT_KEY)
  if (!draft) {
    return
  }

  try {
    const parsed = JSON.parse(draft)
    Object.assign(formState, parsed)
  } catch {
    localStorage.removeItem(DRAFT_KEY)
  }
}

const resetForm = () => {
  formState.projectName = ''
  formState.owner = ''
  formState.scene = ''
  formState.description = ''
  formState.rules = [{ id: `${Date.now()}`, metric: 'error_rate', operator: '>', threshold: 5 }]
  formState.publishType = 'immediate'
  formState.publishTime = null
  formState.notifyUsers = []
  currentStep.value = 0
  ruleError.value = ''
  formRef.value?.clearValidate?.()
}

const submitForm = async () => {
  await formRef.value?.validateFields?.(['publishType', 'publishTime'])

  if (!validateRuleList()) {
    currentStep.value = 1
    return
  }

  // 模拟后端字段错误映射
  if (formState.projectName.toLowerCase().includes('fail')) {
    currentStep.value = 0
    formRef.value?.setFields?.([
      {
        name: ['projectName'],
        errors: ['服务端校验失败：项目名称不能包含 fail']
      }
    ])
    message.error('提交失败，已映射服务端字段错误')
    return
  }

  await new Promise(resolve => setTimeout(resolve, 600))
  localStorage.removeItem(DRAFT_KEY)
  message.success('提交成功')
}

onMounted(() => {
  loadDraft()
})
</script>

<style scoped lang="scss">
.mb-lg {
  margin-bottom: var(--spacing-lg);
}

.mb-md {
  margin-bottom: var(--spacing-md);
}

.mt-md {
  margin-top: var(--spacing-md);
}

.grid-two {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.full-row {
  grid-column: 1 / -1;
}

.rule-row {
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr 120px 180px 80px;
  margin-bottom: 10px;
}

.footer-actions {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border-secondary);
}

@media (max-width: 900px) {
  .grid-two {
    grid-template-columns: 1fr;
  }

  .rule-row {
    grid-template-columns: 1fr;
  }
}
</style>
