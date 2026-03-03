import type { ComputedRef, Ref } from 'vue'
import type { ProFormItem } from '@/types/pro'
import { message, Modal } from 'antdv-next'
import { computed, ref } from 'vue'
import { $t } from '@/locales'

/**
 * CRUD Modal configuration
 */
export interface UseCrudModalOptions<T, F = Record<string, any>> {
  /**
   * Default form values factory function
   */
  defaultFormValues: () => F

  /**
   * Form items configuration (can be a computed ref for dynamic forms)
   */
  formItems: ProFormItem[] | ComputedRef<ProFormItem[]>

  /**
   * API function to create a new record
   */
  createApi: (data: Partial<T>) => Promise<{ success: boolean, message?: string }>

  /**
   * API function to update an existing record
   */
  updateApi: (id: string, data: Partial<T>) => Promise<{ success: boolean, message?: string }>

  /**
   * API function to delete a record
   */
  deleteApi: (id: string) => Promise<{ success: boolean, message?: string }>

  /**
   * Transform form values before submitting to API
   * Useful for converting form data to API payload format
   */
  transformFormValues?: (values: F, editingRecord: T | null) => Partial<T>

  /**
   * Transform record data for editing
   * Useful for converting API data to form values
   */
  transformRecordToForm?: (record: T) => F

  /**
   * Callback after successful create
   */
  onCreated?: (record: T) => void

  /**
   * Callback after successful update
   */
  onUpdated?: (record: T) => void

  /**
   * Callback after successful delete
   */
  onDeleted?: (id: string) => void

  /**
   * Custom delete confirmation message
   */
  deleteConfirmMessage?: string | ((record: T) => string)

  /**
   * Modal width
   */
  modalWidth?: number | string

  /**
   * Modal title for create
   */
  createTitle?: string

  /**
   * Modal title for edit
   */
  editTitle?: string
}

/**
 * Form ref interface
 */
export interface FormRef {
  validate: () => Promise<boolean>
  getFieldsValue: () => Record<string, any>
  resetFields: () => void
}

/**
 * CRUD Modal return type
 */
export interface UseCrudModalReturn<T, F> {
  // State
  modalVisible: Ref<boolean>
  submitting: Ref<boolean>
  editingId: Ref<string | null>
  editingRecord: Ref<T | null>
  formData: Ref<F>
  formRef: Ref<FormRef | null>

  // Computed
  modalTitle: ComputedRef<string>
  isEditing: ComputedRef<boolean>
  resolvedFormItems: ComputedRef<ProFormItem[]>

  // Methods
  openCreate: (initialValues?: Partial<F>) => void
  openEdit: (record: T, id: keyof T) => void
  closeModal: () => void
  handleSubmit: () => Promise<void>
  handleDelete: (record: T, id: keyof T) => void

  // Helpers
  resetForm: () => void
}

/**
 * Composable for managing CRUD modal state and operations
 *
 * @example
 * ```ts
 * const {
 *   modalVisible,
 *   submitting,
 *   formData,
 *   formRef,
 *   modalTitle,
 *   openCreate,
 *   openEdit,
 *   closeModal,
 *   handleSubmit,
 *   handleDelete
 * } = useCrudModal({
 *   defaultFormValues: () => ({ name: '', email: '' }),
 *   formItems: computed(() => [
 *     { name: 'name', label: 'Name', type: 'input', required: true },
 *     { name: 'email', label: 'Email', type: 'input' }
 *   ]),
 *   createApi: createUser,
 *   updateApi: updateUser,
 *   deleteApi: deleteUser,
 *   onCreated: () => tableRef.value?.reload(),
 *   onUpdated: () => tableRef.value?.refresh()
 * })
 * ```
 */
export function useCrudModal<T extends Record<string, any>, F = Record<string, any>>(
  options: UseCrudModalOptions<T, F>,
): UseCrudModalReturn<T, F> {
  const {
    defaultFormValues,
    formItems,
    createApi,
    updateApi,
    deleteApi,
    transformFormValues,
    transformRecordToForm,
    onCreated,
    onUpdated,
    onDeleted,
    deleteConfirmMessage,
    createTitle,
    editTitle,
  } = options

  // State
  const modalVisible = ref(false)
  const submitting = ref(false)
  const editingId = ref<string | null>(null)
  const editingRecord = ref<T | null>(null) as Ref<T | null>
  const formData = ref<F>(defaultFormValues()) as Ref<F>
  const formRef = ref<FormRef | null>(null)

  // Computed
  const isEditing = computed(() => editingId.value !== null)

  const modalTitle = computed(() => {
    if (isEditing.value) {
      return editTitle || $t('common.edit')
    }
    return createTitle || $t('common.add')
  })

  const resolvedFormItems = computed<ProFormItem[]>(() => {
    if (Array.isArray(formItems)) {
      return formItems
    }
    return (formItems as ComputedRef<ProFormItem[]>).value
  })

  // Methods
  const resetForm = () => {
    formData.value = defaultFormValues()
    formRef.value?.resetFields()
  }

  const openCreate = (initialValues?: Partial<F>) => {
    editingId.value = null
    editingRecord.value = null
    formData.value = {
      ...defaultFormValues(),
      ...(initialValues || {}),
    } as F
    modalVisible.value = true
  }

  const openEdit = (record: T, idKey: keyof T = 'id' as keyof T) => {
    const id = record[idKey]
    editingId.value = typeof id === 'string' ? id : String(id)
    editingRecord.value = record

    if (transformRecordToForm) {
      formData.value = transformRecordToForm(record)
    }
    else {
      formData.value = { ...record } as unknown as F
    }

    modalVisible.value = true
  }

  const closeModal = () => {
    modalVisible.value = false
    editingId.value = null
    editingRecord.value = null
    resetForm()
  }

  const handleSubmit = async () => {
    const valid = await formRef.value?.validate()
    if (!valid) {
      return
    }

    const values = formRef.value?.getFieldsValue() || {}
    let payload: Partial<T>

    if (transformFormValues) {
      payload = transformFormValues(values as F, editingRecord.value)
    }
    else {
      payload = values as Partial<T>
    }

    submitting.value = true
    try {
      if (isEditing.value && editingId.value) {
        const result = await updateApi(editingId.value, payload)
        if (result.success) {
          message.success(result.message || $t('common.updateSuccess'))
          onUpdated?.(editingRecord.value as T)
          closeModal()
        }
      }
      else {
        const result = await createApi(payload)
        if (result.success) {
          message.success(result.message || $t('common.createSuccess'))
          onCreated?.(payload as T)
          closeModal()
        }
      }
    }
    finally {
      submitting.value = false
    }
  }

  const handleDelete = (record: T, idKey: keyof T = 'id' as keyof T) => {
    const id = record[idKey]
    const idString = typeof id === 'string' ? id : String(id)

    const confirmMessage = typeof deleteConfirmMessage === 'function'
      ? deleteConfirmMessage(record)
      : deleteConfirmMessage || $t('common.confirmDelete')

    Modal.confirm({
      title: $t('common.confirm'),
      content: confirmMessage,
      okType: 'danger',
      async onOk() {
        const result = await deleteApi(idString)
        if (result.success) {
          message.success(result.message || $t('common.deleteSuccess'))
          onDeleted?.(idString)
        }
      },
    })
  }

  return {
    // State
    modalVisible,
    submitting,
    editingId,
    editingRecord,
    formData,
    formRef,

    // Computed
    modalTitle,
    isEditing,
    resolvedFormItems,

    // Methods
    openCreate,
    openEdit,
    closeModal,
    handleSubmit,
    handleDelete,

    // Helpers
    resetForm,
  }
}
