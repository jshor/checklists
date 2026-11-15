import { FoldHorizontal, UnfoldHorizontal } from 'lucide-react'
import { useStore } from '../../store'
import type { Placed } from '../../types'
import Arrows from '../Arrows/Arrows'
import IconButton from '../IconButton/IconButton'
import './ImageBlock.scss'

/**
 * Renders an image with a section-like frame, move arrows and width toggle on hover/focus.
 */
export default function ImageBlock({ img, h }: Placed) {
  const st = useStore()
  
  return (
    <div className="image-block" tabIndex={0} style={{ height: h, backgroundImage: `url(${img.src})` }}>
      <div className="image-block__frame no-print">
        <div className="image-block__head">
          <Arrows onMove={dir => st.move(img.id, dir)} />
          <IconButton large icon={img.wide ? FoldHorizontal : UnfoldHorizontal}
            title={img.wide ? 'Column width' : 'Full width'}
            onClick={() => st.toggleWide(img.id)} />
        </div>
      </div>
    </div>
  )
}
