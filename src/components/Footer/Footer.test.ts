import { describe, expect, it } from 'vitest'
import { fillFooter } from './Footer'

describe('fillFooter', () => {
  it('replaces every {n} and {m}', () => {
    expect(fillFooter('Page {n} of {m} ({n}/{m})', 2, 5)).toBe('Page 2 of 5 (2/5)')
  })

  it('leaves other text alone', () => {
    expect(fillFooter('v1.0 {x}', 1, 1)).toBe('v1.0 {x}')
  })
})
