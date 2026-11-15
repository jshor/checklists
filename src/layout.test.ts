import { describe, expect, it } from 'vitest'
import { layout, type Sizes } from './layout'
import type { Band, Fragment, Img, Placed, Section } from './types'

const sizes: Sizes = { gap: 10, fullW: 200, colW: 95, pageH: 100, head: 20, row: 10 }

let id = 1
const section = (n: number): Section => ({
  id: id++, type: 'section', title: 'S',
  items: Array.from({ length: n }, () => ({ id: id++, label: 'L', value: 'V' })),
})
const image = (ratio: number, wide = false): Img => ({ id: id++, type: 'image', src: '', ratio, wide })

const run = (...blocks: (Section | Img)[]) => layout(blocks, sizes)
const cols = (band: Band | Placed) => (band as Band).cols
const counts = (band: Band | Placed) => cols(band).map(col => col.map(e => (e as Fragment).items.length))

describe('layout', () => {
  it('returns one page with two empty columns for no blocks', () => {
    expect(run()).toEqual([[{ cols: [[], []], h: [0, 0] }]])
  })

  it('keeps a section that fits in the left column', () => {
    const [[band]] = run(section(5))
    const [frag] = cols(band)[0] as Fragment[]

    expect(counts(band)).toEqual([[5], []])
    expect(frag).toMatchObject({ cont: false, last: true })
  })

  it('splits a long section across columns and pages', () => {
    const pages = run(section(20))
    const frags = pages.flatMap(p => p.flatMap(b => cols(b).flat())) as Fragment[]

    expect(pages.map(p => counts(p[0]))).toEqual([[[8], [8]], [[4], []]])
    expect(frags.map(f => [f.cont, f.last])).toEqual([[false, false], [true, false], [true, true]])
  })

  it('places an empty section as a header only', () => {
    const [[band]] = run(section(0))

    expect(counts(band)).toEqual([[0], []])
  })

  it('separates sections in a column by the gap', () => {
    const [[band]] = run(section(2), section(2))

    expect(counts(band)).toEqual([[2, 2], []])
    expect((band as Band).h[0]).toBe(40 + 10 + 40)
  })

  it('moves a section to the next column when not even one line fits', () => {
    const [[band]] = run(section(7), section(3))

    expect(counts(band)).toEqual([[7], [3]])
  })

  it('sizes a column image by the column width', () => {
    const [[band]] = run(image(0.5))

    expect(cols(band)[0]).toEqual([{ img: expect.objectContaining({ ratio: 0.5 }), h: 47.5 }])
  })

  it('caps image height at the page height', () => {
    const [[band]] = run(image(5))

    expect((cols(band)[0][0] as Placed).h).toBe(100)
  })

  it('puts a wide image between bands', () => {
    const [page] = run(section(2), image(0.05, true), section(1))

    expect(page.map(e => ('img' in e ? 'img' : 'band'))).toEqual(['band', 'img', 'band'])
    expect((page[1] as Placed).h).toBe(10)
    expect(counts(page[2])).toEqual([[1], []])
  })

  it('starts a wide image at the top of a page when there is no band above it', () => {
    const [page] = run(image(0.1, true))

    expect(page.map(e => ('img' in e ? 'img' : 'band'))).toEqual(['img', 'band'])
  })

  it('moves a wide image that does not fit to a new page', () => {
    const pages = run(section(7), image(0.3, true))

    expect(pages).toHaveLength(2)
    expect('img' in pages[1][0]).toBe(true)
  })

  it('shortens columns below a wide image', () => {
    const [page] = run(image(0.2, true), section(10))

    expect(counts(page[1])).toEqual([[3], [3]])
  })
})
