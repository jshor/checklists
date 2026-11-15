import type { MouseEvent } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import IconButton from '../IconButton/IconButton'
import './Arrows.scss'

type Props = { onMove: (dir: -1 | 1) => void; className?: string }

/**
 * Renders up/down buttons that move a section or image in the list.
 */
export default function Arrows({ onMove, className = '' }: Props) {
  const click = (dir: -1 | 1) => (e: MouseEvent) => {
    e.stopPropagation();
    onMove(dir)
  }

  return (
    <span className={`arrows ${className}`}>
      <IconButton icon={ArrowUp} title="Move up" onClick={click(-1)} />
      <IconButton icon={ArrowDown} title="Move down" onClick={click(1)} />
    </span>
  )
}
