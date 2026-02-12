/**
 * Unit test template for keyword matching logic.
 *
 * Note:
 * - This repository currently does not install vitest dependencies.
 * - Keep this file as a starter for future test setup.
 */
import { describe, expect, it } from 'vitest'

const splitKeywords = (keyword: string) => {
  return keyword
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
}

const includesKeywords = (text: string, keyword: string) => {
  const keys = splitKeywords(keyword)
  if (!keys.length) {
    return true
  }

  const lower = text.toLowerCase()
  return keys.every(item => lower.includes(item))
}

describe('keyword matcher', () => {
  it('should match all keywords', () => {
    expect(includesKeywords('John Brown', 'john bro')).toBe(true)
  })

  it('should fail when one keyword not found', () => {
    expect(includesKeywords('John Brown', 'john alex')).toBe(false)
  })
})
