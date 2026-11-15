import { useState } from 'react'
import './Edit.scss'

type Props = {
  value: string
  display?: string // shown instead of value while not focused
  onChange: (text: string) => void
  onEnter?: (shift: boolean) => void // Enter inserts a line (Shift: a note) instead of a line break
  onArrow?: (dir: -1 | 1) => void // Up/Down
  focusId?: string
  className?: string
}

const arrows: Record<string, -1 | 1> = { ArrowUp: -1, ArrowDown: 1 }

/**
 * Renders inline editable text that commits on blur, Enter or Up/Down and selects all on focus.
 */
export default function Edit({ value, display, onChange, onEnter, onArrow, focusId, className = '' }: Props) {
  const [focused, setFocused] = useState(false)

  // key={value} remounts after each commit so React never fights the browser over the DOM text.
  const commit = (el: HTMLElement) => {
    const text = el.innerText.trim();
    
    if (text !== value) onChange(text)
  }

  return (
    <span key={value} className={`edit ${className}`} contentEditable suppressContentEditableWarning tabIndex={0}
      data-focus={focusId}
      onKeyDown={e => {
        const dir = onArrow && arrows[e.key]
        if (e.key !== 'Enter' && !dir) return
        e.preventDefault()
        commit(e.currentTarget)
        if (dir) onArrow(dir)
        else onEnter?.(e.shiftKey)
      }}
      // Deferred so it runs after a click has placed the caret.
      onFocus={e => {
        const el = e.currentTarget

        setFocused(true)
        requestAnimationFrame(() => getSelection()?.selectAllChildren(el))
      }}
      onBlur={e => {
        commit(e.currentTarget)
        setFocused(false)
      }}>
      {focused || display == null ? value : display}
    </span>
  )
}
