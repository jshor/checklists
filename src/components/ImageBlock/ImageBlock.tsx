import { FoldHorizontal, Trash2, UnfoldHorizontal } from 'lucide-react'
import { ARROW_KEYS } from '../../constants'
import { useStore } from '../../store'
import type { Placed } from '../../types'
import Arrows from '../Arrows/Arrows'
import IconButton from '../IconButton/IconButton'
import './ImageBlock.scss'

/**
 * Returns a CSS-usable URL for an image source.
 */
export const imageUrl = (src: string) => {
  return src.startsWith('<') ? `data:image/svg+xml,${encodeURIComponent(src)}` : src
}

/**
 * Renders an image with a section-like frame.
 */
export default function ImageBlock({ img, h }: Placed) {
  const st = useStore()
  
  return (
    <div className="image-block" tabIndex={0} data-focus={`image-${img.id}`}
      style={{ height: h, backgroundImage: `url("${imageUrl(img.src)}")` }}
      onKeyDown={e => {
        const dir = ARROW_KEYS[e.key]

        if (!dir || e.target !== e.currentTarget) return

        e.preventDefault()
        st.move(img.id, dir)
        st.focus(`image-${img.id}`)
      }}>
      <div className="image-block__frame no-print">
        <div className="image-block__head">
          <Arrows onMove={dir => st.move(img.id, dir)} />
          <IconButton large icon={img.wide ? FoldHorizontal : UnfoldHorizontal}
            title={img.wide ? 'Column width' : 'Full width'}
            onClick={() => st.toggleWide(img.id)} />
          <IconButton large icon={Trash2} title="Delete image"
            onClick={() => confirm('Delete image?') && st.removeBlock(img.id)} />
        </div>
      </div>
    </div>
  )
}
