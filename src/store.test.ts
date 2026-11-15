import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import b38m from './checklists/B38M.json'
import { fromJson, toJson, useChecklist } from './store'
import type { JsonBlock, Section } from './types'

const defaults = b38m as JsonBlock[]

const setup = () => {
  const hook = renderHook(() => useChecklist())

  act(() => hook.result.current.load(defaults))
  return hook
}
type Hook = ReturnType<typeof setup>['result']

const sections = (r: Hook) => r.current.blocks.filter(b => b.type === 'section') as Section[]
const titles = (r: Hook) => r.current.blocks.map(b => (b.type === 'section' ? b.title : 'IMG'))
const labels = (s: Section) => s.items.map(it => it.label ?? it.note)

describe('fromJson / toJson', () => {
  it('round-trips the default checklist', () => {
    expect(JSON.parse(toJson(fromJson(defaults)))).toEqual(defaults)
  })

  it('reads notes, pairs and images', () => {
    const blocks = fromJson([
      { title: 'T', items: [['A', 'B'], 'note'] },
      { image: 'data:x', ratio: 2, wide: true },
    ])

    expect(blocks).toMatchObject([
      { type: 'section', title: 'T', items: [{ label: 'A', value: 'B' }, { note: 'note' }] },
      { type: 'image', src: 'data:x', ratio: 2, wide: true },
    ])
  })

  it('assigns unique ids', () => {
    const blocks = fromJson(defaults)
    const ids = blocks.flatMap(b => [b.id, ...(b.type === 'section' ? b.items.map(it => it.id) : [])])

    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('useChecklist', () => {
  it('starts empty with the default footer', () => {
    const { result } = renderHook(() => useChecklist())

    expect(result.current.blocks).toEqual([])
    expect(result.current.footer).toEqual(['Aircraft', 'For Flight Simulation Only.', 'v1.0'])
  })

  it('loads a checklist in order', () => {
    const { result } = setup()

    expect(titles(result)).toEqual(defaults.map(d => ('title' in d ? d.title : 'IMG')))
  })

  it('loads a checklist', () => {
    const { result } = setup()

    act(() => result.current.load([{ title: 'ONLY', items: [] }]))

    expect(titles(result)).toEqual(['ONLY'])
  })

  it('adds and removes sections', () => {
    const { result } = setup()
    const count = result.current.blocks.length

    act(() => result.current.addSection())
    const added = result.current.blocks.at(-1)!

    expect(added).toMatchObject({ type: 'section', title: 'SECTION', items: [] })

    act(() => result.current.removeBlock(added.id))

    expect(result.current.blocks).toHaveLength(count)
  })

  it('moves blocks and ignores moves past either end', () => {
    const { result } = setup()
    const [first, second] = titles(result)
    const last = titles(result).at(-1)

    act(() => result.current.move(result.current.blocks[0].id, -1))
    expect(titles(result).slice(0, 2)).toEqual([first, second])

    act(() => result.current.move(result.current.blocks[0].id, 1))
    expect(titles(result).slice(0, 2)).toEqual([second, first])

    act(() => result.current.move(result.current.blocks.at(-1)!.id, 1))
    expect(titles(result).at(-1)).toBe(last)
  })

  it('sets a section title', () => {
    const { result } = setup()

    act(() => result.current.setTitle(result.current.blocks[0].id, 'NEW'))

    expect(titles(result)[0]).toBe('NEW')
  })

  it('adds images and toggles their width', () => {
    const { result } = setup()

    act(() => result.current.addImage('data:x', 0.5))
    const img = result.current.blocks.at(-1)!

    expect(img).toMatchObject({ type: 'image', src: 'data:x', ratio: 0.5, wide: false })

    act(() => result.current.toggleWide(img.id))

    expect(result.current.blocks.at(-1)).toMatchObject({ wide: true })
  })

  it('inserts a line after another and requests focus on it', () => {
    const { result } = setup()
    const s = sections(result)[0]

    act(() => result.current.insertItem(s.id, s.items[0].id, false))
    const items = sections(result)[0].items

    expect(items[1]).toMatchObject({ label: 'ITEM', value: 'VALUE' })
    expect(items).toHaveLength(s.items.length + 1)
    expect(result.current.focusId).toBe(`item-${items[1].id}`)
  })

  it('inserts a note at the top when afterId is null', () => {
    const { result } = setup()
    const s = sections(result)[0]

    act(() => result.current.insertItem(s.id, null, true))

    expect(sections(result)[0].items[0]).toMatchObject({ note: 'Note' })
  })

  it('sets and removes lines', () => {
    const { result } = setup()
    const s = sections(result)[0]
    const [a, b] = s.items

    act(() => result.current.setItem(s.id, a.id, 'value', 'X'))
    expect(sections(result)[0].items[0].value).toBe('X')

    act(() => result.current.removeItem(s.id, a.id))
    expect(sections(result)[0].items[0].id).toBe(b.id)
  })

  it('sorts lines within a section', () => {
    const { result } = setup()
    const s = sections(result)[0]
    const [a, b, c] = labels(s)

    act(() => result.current.sortItems(s.items[0].id, s.items[2].id))

    expect(labels(sections(result)[0]).slice(0, 3)).toEqual([b, c, a])
  })

  it('ignores drops onto another section', () => {
    const { result } = setup()
    const [s, t] = sections(result)

    act(() => result.current.sortItems(s.items[0].id, t.items[0].id))

    expect(labels(sections(result)[0])).toEqual(labels(s))
    expect(labels(sections(result)[1])).toEqual(labels(t))
  })

  it('tracks the dragged item', () => {
    const { result } = setup()
    const item = sections(result)[0].items[1]

    expect(result.current.dragItem).toBeUndefined()

    act(() => result.current.setDragId(item.id))

    expect(result.current.dragItem).toBe(item)
  })

  it('sets footer texts', () => {
    const { result } = setup()

    act(() => result.current.setFooterText(1, 'X'))

    expect(result.current.footer).toEqual(['Aircraft', 'X', 'v1.0'])
  })
})
