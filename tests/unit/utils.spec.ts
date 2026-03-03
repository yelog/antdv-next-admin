import { describe, expect, it } from 'vitest'

// Simple unit tests for utility functions
describe('utility Functions', () => {
  describe('string manipulation', () => {
    it('should format number with commas', () => {
      const formatNumber = (num: number) => num.toLocaleString()
      expect(formatNumber(1234567)).toBe('1,234,567')
    })

    it('should truncate long text', () => {
      const truncate = (text: string, maxLength: number) =>
        text.length > maxLength ? `${text.slice(0, maxLength)}...` : text

      expect(truncate('Hello World', 5)).toBe('Hello...')
      expect(truncate('Hi', 10)).toBe('Hi')
    })
  })

  describe('array operations', () => {
    it('should remove duplicates', () => {
      const unique = (arr: number[]) => [...new Set(arr)]
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
    })

    it('should group by key', () => {
      const groupBy = <T, K extends keyof T>(arr: T[], key: K) =>
        arr.reduce((acc, item) => {
          const group = String(item[key])
          acc[group] = acc[group] || []
          acc[group].push(item)
          return acc
        }, {} as Record<string, T[]>)

      const data = [
        { type: 'A', value: 1 },
        { type: 'B', value: 2 },
        { type: 'A', value: 3 },
      ]

      expect(groupBy(data, 'type')).toEqual({
        A: [{ type: 'A', value: 1 }, { type: 'A', value: 3 }],
        B: [{ type: 'B', value: 2 }],
      })
    })
  })
})
