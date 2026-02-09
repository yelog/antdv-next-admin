import { faker } from '@faker-js/faker'

// Statistics data
export const mockStats = {
  totalUsers: 12458,
  totalOrders: 8946,
  totalRevenue: 456789.56,
  conversionRate: 3.24
}

// Sales trend data (last 12 months)
export const mockSalesTrend = Array.from({ length: 12 }, (_, index) => {
  const date = new Date()
  date.setMonth(date.getMonth() - (11 - index))
  return {
    month: date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' }),
    sales: faker.number.int({ min: 20000, max: 80000 }),
    orders: faker.number.int({ min: 500, max: 2000 })
  }
})

// User distribution by city
export const mockUserDistribution = [
  { city: '北京', value: 2341 },
  { city: '上海', value: 2156 },
  { city: '广州', value: 1876 },
  { city: '深圳', value: 1654 },
  { city: '杭州', value: 1432 },
  { city: '成都', value: 1289 },
  { city: '其他', value: 2710 }
]

// Recent activities
export const mockActivities = Array.from({ length: 10 }, (_, index) => ({
  id: faker.string.uuid(),
  user: faker.person.fullName(),
  avatar: faker.image.avatar(),
  action: faker.helpers.arrayElement([
    '创建了新用户',
    '更新了角色权限',
    '删除了过期数据',
    '导出了报表',
    '修改了系统配置',
    '上传了新文件'
  ]),
  timestamp: faker.date.recent({ days: 7 }).toISOString(),
  type: faker.helpers.arrayElement(['success', 'info', 'warning', 'error'])
}))

// Chart data for different visualizations
export const mockChartData = {
  // Line chart - Sales trend
  lineChart: {
    xAxis: mockSalesTrend.map(item => item.month),
    series: [
      {
        name: '销售额',
        data: mockSalesTrend.map(item => item.sales)
      },
      {
        name: '订单数',
        data: mockSalesTrend.map(item => item.orders)
      }
    ]
  },

  // Bar chart - Monthly comparison
  barChart: {
    xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
    series: [
      {
        name: '本年',
        data: [820, 932, 901, 934, 1290, 1330]
      },
      {
        name: '去年',
        data: [720, 832, 801, 834, 1190, 1230]
      }
    ]
  },

  // Pie chart - User distribution
  pieChart: {
    data: mockUserDistribution.map(item => ({
      name: item.city,
      value: item.value
    }))
  },

  // Area chart - Traffic trend
  areaChart: {
    xAxis: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    series: [
      {
        name: '访问量',
        data: Array.from({ length: 24 }, () => faker.number.int({ min: 100, max: 1000 }))
      }
    ]
  }
}
