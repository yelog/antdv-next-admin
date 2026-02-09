import { defineMock } from 'vite-plugin-mock-dev-server'
import {
  mockStats,
  mockSalesTrend,
  mockUserDistribution,
  mockActivities,
  mockChartData
} from '../data/dashboard.data'

export default defineMock([
  // Get statistics
  {
    url: '/api/dashboard/stats',
    method: 'GET',
    body: {
      code: 200,
      message: 'Success',
      data: mockStats,
      success: true
    }
  },

  // Get sales trend
  {
    url: '/api/dashboard/sales-trend',
    method: 'GET',
    body: {
      code: 200,
      message: 'Success',
      data: mockSalesTrend,
      success: true
    }
  },

  // Get user distribution
  {
    url: '/api/dashboard/user-distribution',
    method: 'GET',
    body: {
      code: 200,
      message: 'Success',
      data: mockUserDistribution,
      success: true
    }
  },

  // Get recent activities
  {
    url: '/api/dashboard/activities',
    method: 'GET',
    body: {
      code: 200,
      message: 'Success',
      data: mockActivities,
      success: true
    }
  },

  // Get chart data
  {
    url: '/api/dashboard/chart-data',
    method: 'GET',
    body: {
      code: 200,
      message: 'Success',
      data: mockChartData,
      success: true
    }
  }
])
