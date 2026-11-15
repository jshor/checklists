import type { Doc, History, Update } from '../types'

/**
 * Returns the history with one doc field updated as a new undo step.
 */
export const change = <K extends keyof Doc>(h: History, key: K, update: Update<Doc[K]>): History => {
  const value = typeof update === 'function'
    ? (update as (value: Doc[K]) => Doc[K])(h.present[key])
    : update

  if (value === h.present[key]) {
    return h
  }

  return {
    past: [...h.past, h.present],
    present: {
      ...h.present,
      [key]: value
    },
    future: []
  }
}
