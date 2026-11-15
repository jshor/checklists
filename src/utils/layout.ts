import type { Band, Block, Fragment, Page, Placed } from '../types'
import { px } from './dom'

// sizes come from the global CSS variables defined in styles.scss
export type Sizes = ReturnType<typeof measure>
let sizes: Sizes

/**
 * Returns the current layout sizes, measuring them from the DOM if necessary.
 */
function measure() {
  const gap = px('--gap'), fullW = px('--page-w') - 2 * gap

  return {
    gap, fullW, colW: (fullW - gap) / 2, pageH: px('--page-h') - 2 * gap,
    head: px('--head-h') + 2 * px('--border'), row: px('--row-h'),
  }
}

/**
 * Layouts the blocks into pages.
 */
export function layout(blocks: Block[], s: Sizes = (sizes ??= measure())): Page[] {
  const { gap: GAP, fullW, colW, pageH, head, row } = s
  const pages: Page[] = []
  let page!: Page, band!: Band, col = 0, top = 0
  const newBand = () => { band = { cols: [[], []], h: [0, 0] }; page.push(band); col = 0 }
  const newPage = () => { page = []; pages.push(page); top = 0; newBand() }
  const advance = () => (col === 0 ? (col = 1) : newPage())
  const gap = () => (band.cols[col].length ? GAP : 0)
  const room = () => pageH - top - band.h[col] - gap()
  const put = (entry: Fragment | Placed, h: number) => { band.h[col] += gap() + h; band.cols[col].push(entry) }

  newPage()

  for (const b of blocks) {
    if (b.type === 'image' && b.wide) {
      // full-width image: closes the current band, spans both columns
      const h = Math.min(fullW * b.ratio, pageH)
      let bandH = Math.max(...band.h)

      if (top + (bandH && bandH + GAP) + h > pageH) {
        newPage();
        bandH = 0
      }
      if (!bandH) page.pop()
        
      page.push({ img: b, h })
      top += (bandH && bandH + GAP) + h + GAP

      newBand()
    } else if (b.type === 'image') {
      // column image: goes in the next column with room
      const h = Math.min(colW * b.ratio, pageH)

      while (room() < h) advance()

      put({ img: b, h }, h)
    } else {
      // section: split into "(cont.)" fragments across columns as they fill
      for (let i = 0; ;) {
        const left = b.items.length - i
        const fit = Math.floor((room() - head) / row)

        if (fit < Math.min(1, left)) {
          advance()
          continue
        }

        const n = Math.min(fit, left)

        put({
          s: b,
          items: b.items.slice(i, i + n),
          cont: i > 0, last: n === left
        }, head + n * row)

        if ((i += n) >= b.items.length) break
      }
    }
  }
  return pages
}
