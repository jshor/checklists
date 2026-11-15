import { describe, expect, it } from 'vitest'
import { change } from './history'
import type { Doc, History } from '../types'

const doc: Doc = { title: 'A', footer: ['x'], blocks: [] }
const history: History = { past: [], present: doc, future: [{ ...doc, title: 'B' }] }

describe('change', () => {
  it('sets a value as a new undo step and clears redo', () => {
    const next = change(history, 'title', 'C')

    expect(next).toEqual({ past: [doc], present: { ...doc, title: 'C' }, future: [] })
  })

  it('applies an update function to the current value', () => {
    expect(change(history, 'footer', f => [...f, 'y']).present.footer).toEqual(['x', 'y'])
  })

  it('returns the same history when nothing changes', () => {
    expect(change(history, 'title', 'A')).toBe(history)
    expect(change(history, 'blocks', b => b)).toBe(history)
  })
})
