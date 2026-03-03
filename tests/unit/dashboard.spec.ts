import type { DashboardStats, SalesTrendItem } from '@/api/dashboard'
import { describe, expect, it } from 'vitest'

describe('dashboard API Types', () => {
  it('should have correct DashboardStats structure', () => {
    const stats: DashboardStats = {
      totalUsers: 1000,
      totalOrders: 500,
      totalRevenue: 9999.99,
      conversionRate: 3.5,
    }

    expect(stats.totalUsers).toBe(1000)
    expect(stats.totalOrders).toBe(500)
    expect(stats.totalRevenue).toBe(9999.99)
    expect(stats.conversionRate).toBe(3.5)
  })

  it('should have correct SalesTrendItem structure', () => {
    const item: SalesTrendItem = {
      month: '2024-01',
      sales: 10000,
      orders: 100,
    }

    expect(item.month).toBe('2024-01')
    expect(item.sales).toBe(10000)
    expect(item.orders).toBe(100)
  })

  it('should calculate total correctly', () => {
    const items: SalesTrendItem[] = [
      { month: 'Jan', sales: 100, orders: 10 },
      { month: 'Feb', sales: 200, orders: 20 },
      { month: 'Mar', sales: 300, orders: 30 },
    ]

    const totalSales = items.reduce((sum, item) => sum + item.sales, 0)
    const totalOrders = items.reduce((sum, item) => sum + item.orders, 0)

    expect(totalSales).toBe(600)
    expect(totalOrders).toBe(60)
  })
})
