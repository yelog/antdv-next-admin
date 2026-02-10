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
    month: date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' }),
    sales: faker.number.int({ min: 20000, max: 80000 }),
    orders: faker.number.int({ min: 500, max: 2000 })
  }
})

// User distribution by city
export const mockUserDistribution = [
  { city: 'Beijing', value: 2341 },
  { city: 'Shanghai', value: 2156 },
  { city: 'Guangzhou', value: 1876 },
  { city: 'Shenzhen', value: 1654 },
  { city: 'Hangzhou', value: 1432 },
  { city: 'Chengdu', value: 1289 },
  { city: 'Other', value: 2710 }
]

// Recent activities
export const mockActivities = Array.from({ length: 10 }, (_, index) => ({
  id: faker.string.uuid(),
  user: faker.person.fullName(),
  avatar: faker.image.avatar(),
  action: faker.helpers.arrayElement([
    'Created a new user',
    'Updated role permissions',
    'Deleted expired data',
    'Exported reports',
    'Updated system settings',
    'Uploaded a new file'
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
        name: 'Sales',
        data: mockSalesTrend.map(item => item.sales)
      },
      {
        name: 'Orders',
        data: mockSalesTrend.map(item => item.orders)
      }
    ]
  },

  // Bar chart - Monthly comparison
  barChart: {
    xAxis: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    series: [
      {
        name: 'Current Year',
        data: [820, 932, 901, 934, 1290, 1330]
      },
      {
        name: 'Last Year',
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
        name: 'Visits',
        data: Array.from({ length: 24 }, () => faker.number.int({ min: 100, max: 1000 }))
      }
    ]
  }
}
