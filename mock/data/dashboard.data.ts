// Statistics data
export const mockStats = {
  totalUsers: 12458,
  totalOrders: 8946,
  totalRevenue: 456789.56,
  conversionRate: 3.24
}

// Sales trend data (last 12 months) - static data
export const mockSalesTrend = [
  { month: '2024-04', sales: 45230, orders: 1234 },
  { month: '2024-05', sales: 52450, orders: 1456 },
  { month: '2024-06', sales: 38760, orders: 987 },
  { month: '2024-07', sales: 61280, orders: 1678 },
  { month: '2024-08', sales: 55340, orders: 1523 },
  { month: '2024-09', sales: 48920, orders: 1345 },
  { month: '2024-10', sales: 72450, orders: 1890 },
  { month: '2024-11', sales: 58670, orders: 1612 },
  { month: '2024-12', sales: 67890, orders: 1756 },
  { month: '2025-01', sales: 43210, orders: 1189 },
  { month: '2025-02', sales: 51560, orders: 1432 },
  { month: '2025-03', sales: 69870, orders: 1823 }
]

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

// Recent activities - static data
export const mockActivities = [
  {
    id: '1',
    user: 'Zhang San',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
    action: 'Created a new user',
    timestamp: '2025-03-04T10:30:00.000Z',
    type: 'success'
  },
  {
    id: '2',
    user: 'Li Si',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
    action: 'Updated role permissions',
    timestamp: '2025-03-04T09:45:00.000Z',
    type: 'info'
  },
  {
    id: '3',
    user: 'Wang Wu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
    action: 'Deleted expired data',
    timestamp: '2025-03-04T09:15:00.000Z',
    type: 'warning'
  },
  {
    id: '4',
    user: 'Zhao Liu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu',
    action: 'Exported reports',
    timestamp: '2025-03-04T08:50:00.000Z',
    type: 'info'
  },
  {
    id: '5',
    user: 'Sun Qi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunqi',
    action: 'Updated system settings',
    timestamp: '2025-03-04T08:30:00.000Z',
    type: 'success'
  },
  {
    id: '6',
    user: 'Zhou Ba',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhouba',
    action: 'Uploaded a new file',
    timestamp: '2025-03-03T17:20:00.000Z',
    type: 'info'
  },
  {
    id: '7',
    user: 'Wu Jiu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wujiu',
    action: 'Created a new user',
    timestamp: '2025-03-03T16:45:00.000Z',
    type: 'success'
  },
  {
    id: '8',
    user: 'Zheng Shi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhengshi',
    action: 'Deleted expired data',
    timestamp: '2025-03-03T15:30:00.000Z',
    type: 'error'
  },
  {
    id: '9',
    user: 'Wang Fang',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangfang',
    action: 'Exported reports',
    timestamp: '2025-03-03T14:20:00.000Z',
    type: 'info'
  },
  {
    id: '10',
    user: 'Chen Ming',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chenming',
    action: 'Updated role permissions',
    timestamp: '2025-03-03T13:10:00.000Z',
    type: 'warning'
  }
]

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

  // Area chart - Traffic trend (static data)
  areaChart: {
    xAxis: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    series: [
      {
        name: 'Visits',
        data: [120, 156, 234, 345, 456, 567, 678, 789, 890, 901, 812, 723, 634, 545, 456, 567, 678, 789, 890, 901, 812, 723, 434, 245]
      }
    ]
  }
}