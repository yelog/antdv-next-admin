import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAllDictData } from '@/api/dict'
import type { DictData, DictGroup } from '@/types/dict'

export const useDictStore = defineStore('dict', () => {
  // 所有字典数据
  const dictData = ref<DictData[]>([])

  // 是否已加载
  const loaded = ref(false)

  // 是否正在加载
  const loading = ref(false)

  // 按类型分组的字典数据
  const dictGroup = computed<DictGroup>(() => {
    const group: DictGroup = {}
    dictData.value.forEach(item => {
      if (!group[item.typeCode]) {
        group[item.typeCode] = []
      }
      group[item.typeCode].push(item)
    })
    // 按 sort 排序
    Object.keys(group).forEach(key => {
      group[key].sort((a, b) => a.sort - b.sort)
    })
    return group
  })

  /**
   * 加载所有字典数据
   */
  const loadDictData = async (force = false) => {
    // 如果已加载且不强制刷新，直接返回
    if (loaded.value && !force) {
      return
    }

    // 如果正在加载，避免重复请求
    if (loading.value) {
      return
    }

    try {
      loading.value = true
      const response = await getAllDictData() as any
      if (response.code === 200) {
        dictData.value = response.data.filter((item: DictData) => item.status === 'enabled')
        loaded.value = true
      }
    } catch (error) {
      console.error('加载字典数据失败:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据类型获取字典数据
   */
  const getDictByType = (typeCode: string): DictData[] => {
    return dictGroup.value[typeCode] || []
  }

  /**
   * 根据类型和值获取标签
   */
  const getDictLabel = (typeCode: string, value: string): string => {
    const dict = dictGroup.value[typeCode]?.find(item => item.value === value)
    return dict?.label || value
  }

  /**
   * 根据类型和标签获取值
   */
  const getDictValue = (typeCode: string, label: string): string => {
    const dict = dictGroup.value[typeCode]?.find(item => item.label === label)
    return dict?.value || label
  }

  /**
   * 获取字典选项（用于下拉框）
   */
  const getDictOptions = (typeCode: string) => {
    return getDictByType(typeCode).map(item => ({
      label: item.label,
      value: item.value
    }))
  }

  /**
   * 刷新字典数据
   */
  const refreshDictData = () => {
    return loadDictData(true)
  }

  /**
   * 清空字典数据
   */
  const clearDictData = () => {
    dictData.value = []
    loaded.value = false
  }

  return {
    dictData,
    dictGroup,
    loaded,
    loading,
    loadDictData,
    getDictByType,
    getDictLabel,
    getDictValue,
    getDictOptions,
    refreshDictData,
    clearDictData
  }
})
