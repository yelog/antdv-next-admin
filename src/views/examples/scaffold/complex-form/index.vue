<template>
  <div class="page-container">
    <div class="card">
      <h2>{{ $t('examples.scaffold.complexForm.title') }}</h2>
      <p class="text-secondary mb-lg">{{ $t('examples.scaffold.complexForm.description') }}</p>

      <a-steps :current="currentStep" size="small" class="mb-lg">
        <a-step :title="$t('examples.scaffold.complexForm.step1Title')" />
        <a-step :title="$t('examples.scaffold.complexForm.step2Title')" />
        <a-step :title="$t('examples.scaffold.complexForm.step3Title')" />
      </a-steps>

      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        layout="vertical"
      >
        <template v-if="currentStep === 0">
          <div class="grid-two">
            <a-form-item :label="$t('examples.scaffold.complexForm.projectNameLabel')" name="projectName">
              <a-input v-model:value="formState.projectName" :placeholder="$t('examples.scaffold.complexForm.projectNamePlaceholder')" />
            </a-form-item>
            <a-form-item :label="$t('examples.scaffold.complexForm.ownerLabel')" name="owner">
              <a-input v-model:value="formState.owner" :placeholder="$t('examples.scaffold.complexForm.ownerPlaceholder')" />
            </a-form-item>
            <a-form-item :label="$t('examples.scaffold.complexForm.sceneLabel')" name="scene">
              <a-select
                v-model:value="formState.scene"
                :placeholder="$t('examples.scaffold.complexForm.scenePlaceholder')"
                :options="sceneOptions"
              />
            </a-form-item>
            <a-form-item :label="$t('examples.scaffold.complexForm.descriptionLabel')" name="description">
              <a-textarea v-model:value="formState.description" :rows="3" :placeholder="$t('examples.scaffold.complexForm.descriptionPlaceholder')" />
            </a-form-item>
          </div>
        </template>

        <template v-else-if="currentStep === 1">
          <div class="mb-md">
            <a-space>
              <a-button type="dashed" @click="addRule">{{ $t('examples.scaffold.complexForm.addRuleButton') }}</a-button>
              <a-tag>{{ $t('examples.scaffold.complexForm.currentRulesCount', { count: formState.rules.length }) }}</a-tag>
            </a-space>
          </div>

          <div v-for="(rule, index) in formState.rules" :key="rule.id" class="rule-row">
            <a-input
              v-model:value="rule.metric"
              :placeholder="$t('examples.scaffold.complexForm.metricPlaceholder')"
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
            <a-button danger @click="removeRule(index)">{{ $t('examples.scaffold.complexForm.deleteButton') }}</a-button>
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
            <a-form-item :label="$t('examples.scaffold.complexForm.publishTypeLabel')" name="publishType">
              <a-radio-group v-model:value="formState.publishType">
                <a-radio value="immediate">{{ $t('examples.scaffold.complexForm.publishImmediate') }}</a-radio>
                <a-radio value="schedule">{{ $t('examples.scaffold.complexForm.publishSchedule') }}</a-radio>
              </a-radio-group>
            </a-form-item>

            <a-form-item
              :label="$t('examples.scaffold.complexForm.publishTimeLabel')"
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

            <a-form-item :label="$t('examples.scaffold.complexForm.notifyUsersLabel')" name="notifyUsers" class="full-row">
              <a-select
                v-model:value="formState.notifyUsers"
                mode="tags"
                :token-separators="[',']"
                :placeholder="$t('examples.scaffold.complexForm.notifyUsersPlaceholder')"
              />
            </a-form-item>
          </div>
        </template>
      </a-form>

      <div class="footer-actions">
        <a-space wrap>
          <a-button :disabled="currentStep === 0" @click="prevStep">{{ $t('examples.scaffold.complexForm.prevButton') }}</a-button>
          <a-button v-if="currentStep < 2" type="primary" @click="nextStep">{{ $t('examples.scaffold.complexForm.nextButton') }}</a-button>
          <a-button v-else type="primary" @click="submitForm">{{ $t('examples.scaffold.complexForm.submitButton') }}</a-button>
          <a-button @click="saveDraft">{{ $t('examples.scaffold.complexForm.saveDraftButton') }}</a-button>
          <a-button @click="resetForm">{{ $t('examples.scaffold.complexForm.resetButton') }}</a-button>
        </a-space>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'antdv-next'
import { $t } from '@/locales'

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

const sceneOptions = computed(() => [
  { label: $t('examples.scaffold.complexForm.sceneGrowth'), value: 'growth' },
  { label: $t('examples.scaffold.complexForm.sceneRisk'), value: 'risk' },
  { label: $t('examples.scaffold.complexForm.sceneStability'), value: 'stability' }
])

const operatorOptions = [
  { label: '>', value: '>' },
  { label: '>=', value: '>=' },
  { label: '<', value: '<' },
  { label: '<=', value: '<=' }
]

const checkProjectNameUnique = async (_rule: any, value: string) => {
  if (!value) {
    return Promise.reject(new Error($t('examples.scaffold.complexForm.projectNameRequired')))
  }

  await new Promise(resolve => setTimeout(resolve, 300))

  const reservedNames = ['default', 'admin', 'production']
  if (reservedNames.includes(value.trim().toLowerCase())) {
    return Promise.reject(new Error($t('examples.scaffold.complexForm.projectNameExists')))
  }

  return Promise.resolve()
}

const rules = {
  projectName: [
    { required: true, message: $t('examples.scaffold.complexForm.projectNameRequired') },
    { validator: checkProjectNameUnique, trigger: 'blur' }
  ],
  owner: [{ required: true, message: $t('examples.scaffold.complexForm.ownerRequired') }],
  scene: [{ required: true, message: $t('examples.scaffold.complexForm.sceneRequired') }],
  publishType: [{ required: true, message: $t('examples.scaffold.complexForm.publishTypeRequired') }]
}

const validatePublishTime = async () => {
  if (formState.publishType === 'schedule' && !formState.publishTime) {
    return Promise.reject(new Error($t('examples.scaffold.complexForm.publishTimeRequired')))
  }
  return Promise.resolve()
}

const validateRuleList = () => {
  if (formState.rules.length === 0) {
    ruleError.value = $t('examples.scaffold.complexForm.ruleListEmpty')
    return false
  }

  const invalid = formState.rules.some(item => {
    return !item.metric || !item.operator || item.threshold == null
  })

  if (invalid) {
    ruleError.value = $t('examples.scaffold.complexForm.ruleListIncomplete')
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
  message.success($t('examples.scaffold.complexForm.draftSaved'))
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
        errors: [$t('examples.scaffold.complexForm.serverValidationError')]
      }
    ])
    message.error($t('examples.scaffold.complexForm.submitFailed'))
    return
  }

  await new Promise(resolve => setTimeout(resolve, 600))
  localStorage.removeItem(DRAFT_KEY)
  message.success($t('examples.scaffold.complexForm.submitSuccess'))
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
