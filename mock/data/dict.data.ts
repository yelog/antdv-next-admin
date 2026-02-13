import type { DictType, DictData } from '@/types/dict'

/**
 * 字典类型数据
 */
export const dictTypes: DictType[] = [
  {
    id: '1',
    name: '用户状态',
    code: 'user_status',
    description: '用户账号状态',
    status: 'enabled',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: '2',
    name: '性别',
    code: 'gender',
    description: '用户性别',
    status: 'enabled',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: '3',
    name: '订单状态',
    code: 'order_status',
    description: '订单状态',
    status: 'enabled',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: '4',
    name: '支付方式',
    code: 'payment_method',
    description: '支付方式',
    status: 'enabled',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: '5',
    name: '通知类型',
    code: 'notification_type',
    description: '系统通知类型',
    status: 'enabled',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  }
]

/**
 * 字典数据
 */
export const dictData: DictData[] = [
  // 用户状态
  {
    id: '1',
    typeCode: 'user_status',
    label: '正常',
    value: 'active',
    sort: 1,
    status: 'enabled',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: '2',
    typeCode: 'user_status',
    label: '禁用',
    value: 'inactive',
    sort: 2,
    status: 'enabled',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: '3',
    typeCode: 'user_status',
    label: '锁定',
    value: 'locked',
    sort: 3,
    status: 'enabled',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  // 性别
  {
    id: '4',
    typeCode: 'gender',
    label: '男',
    value: 'male',
    sort: 1,
    status: 'enabled',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: '5',
    typeCode: 'gender',
    label: '女',
    value: 'female',
    sort: 2,
    status: 'enabled',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: '6',
    typeCode: 'gender',
    label: '未知',
    value: 'unknown',
    sort: 3,
    status: 'enabled',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  // 订单状态
  {
    id: '7',
    typeCode: 'order_status',
    label: '待支付',
    value: 'pending',
    sort: 1,
    status: 'enabled',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: '8',
    typeCode: 'order_status',
    label: '已支付',
    value: 'paid',
    sort: 2,
    status: 'enabled',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: '9',
    typeCode: 'order_status',
    label: '配送中',
    value: 'shipping',
    sort: 3,
    status: 'enabled',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: '10',
    typeCode: 'order_status',
    label: '已完成',
    value: 'completed',
    sort: 4,
    status: 'enabled',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: '11',
    typeCode: 'order_status',
    label: '已取消',
    value: 'cancelled',
    sort: 5,
    status: 'enabled',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  // 支付方式
  {
    id: '12',
    typeCode: 'payment_method',
    label: '支付宝',
    value: 'alipay',
    sort: 1,
    status: 'enabled',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: '13',
    typeCode: 'payment_method',
    label: '微信支付',
    value: 'wechat',
    sort: 2,
    status: 'enabled',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: '14',
    typeCode: 'payment_method',
    label: '银行卡',
    value: 'bank_card',
    sort: 3,
    status: 'enabled',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  // 通知类型
  {
    id: '15',
    typeCode: 'notification_type',
    label: '系统通知',
    value: 'system',
    sort: 1,
    status: 'enabled',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: '16',
    typeCode: 'notification_type',
    label: '订单通知',
    value: 'order',
    sort: 2,
    status: 'enabled',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: '17',
    typeCode: 'notification_type',
    label: '活动通知',
    value: 'activity',
    sort: 3,
    status: 'enabled',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  }
]
