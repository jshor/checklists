import type { Fragment, Page as PageData, Placed } from '../../types'
import Footer from '../Footer/Footer'
import ImageBlock from '../ImageBlock/ImageBlock'
import Section from '../Section/Section'
import './Page.scss'

/**
 * Renders a column entry: an image or a section fragment.
 */
const entry = (e: Fragment | Placed) => ('img' in e
  ? <ImageBlock key={e.img.id} {...e} />
  : <Section key={`${e.s.id}-${e.cont ? e.items[0].id : ''}`} {...e} />)

/**
 * Renders a printed sheet: two-column bands and full-width images, plus the footer.
 */
export default function Page({ page }: { page: PageData }) {
  return (
    <div className="page">
      {page.map((e, k) => ('img' in e ? entry(e) : (
        <div className="page__band" key={`band-${k}`}>
          {e.cols.map((col, c) => <div className="page__col" key={c}>{col.map(entry)}</div>)}
        </div>
      )))}
      <Footer />
    </div>
  )
}
