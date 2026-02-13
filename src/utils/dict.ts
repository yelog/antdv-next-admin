import { useDictStore } from '@/stores/dict'
import type { DictData } from '@/types/dict'

/**
 * 字典工具类
 * 提供便捷的字典操作方法
 */
class DictUtil {
  private store = useDictStore()

  /**
   * 根据类型获取字典数据
   */
  getByType(typeCode: string): DictData[] {
    return this.store.getDictByType(typeCode)
  }

  /**
   * 根据类型和值获取标签
   */
  getLabel(typeCode: string, value: string): string {
    return this.store.getDictLabel(typeCode, value)
  }

  /**
   * 根据类型和标签获取值
   */
  getValue(typeCode: string, label: string): string {
    return this.store.getDictValue(typeCode, label)
  }

  /**
   * 获取字典选项（用于下拉框）
   */
  getOptions(typeCode: string) {
    return this.store.getDictOptions(typeCode)
  }

  /**
   * 批量获取标签
   */
  getLabels(typeCode: string, values: string[]): string[] {
    return values.map(value => this.getLabel(typeCode, value))
  }

  /**
   * 批量获取值
   */
  getValues(typeCode: string, labels: string[]): string[] {
    return labels.map(label => this.getValue(typeCode, label))
  }

  /**
   * 判断字典值是否存在
   */
  hasValue(typeCode: string, value: string): boolean {
    const dict = this.getByType(typeCode)
    return dict.some(item => item.value === value)
  }

  /**
   * 判断字典标签是否存在
   */
  hasLabel(typeCode: string, label: string): boolean {
    const dict = this.getByType(typeCode)
    return dict.some(item => item.label === label)
  }

  /**
   * 获取字典数据对象（value 为 key）
   */
  getMap(typeCode: string): Record<string, DictData> {
    const dict = this.getByType(typeCode)
    const map: Record<string, DictData> = {}
    dict.forEach(item => {
      map[item.value] = item
    })
    return map
  }

  /**
   * 刷新字典数据
   */
  refresh() {
    return this.store.refreshDictData()
  }
}

// 导出单例
export const dict = new DictUtil()

// 导出类（用于需要创建新实例的场景）
export default DictUtil
