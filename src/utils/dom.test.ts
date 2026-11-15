import { describe, expect, it } from 'vitest'
import { safeFileName } from './dom'

describe('safeFileName', () => {
  it('replaces characters not allowed in file names', () => {
    expect(safeFileName('B737/MAX: "Normal"?*<>|\\')).toBe('B737-MAX- -Normal-------')
  })

  it('keeps other text', () => {
    expect(safeFileName('Untitled Checklist (v2)')).toBe('Untitled Checklist (v2)')
  })
})
