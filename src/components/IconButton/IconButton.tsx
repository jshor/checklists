import type { ComponentProps } from 'react'
import type { LucideIcon } from 'lucide-react'
import './IconButton.scss'

type Props = ComponentProps<'button'> & { icon: LucideIcon; large?: boolean; bare?: boolean }

/**
 * Renders a borderless, non-printing button showing a lucide icon; bare ones get no hover background.
 */
export default function IconButton({ icon: Icon, large, bare, className = '', ...props }: Props) {
  return (
    <button className={`icon-button ${large ? 'icon-button--large' : ''} ${bare ? 'icon-button--bare' : ''} no-print ${className}`}
      {...props}>
      <Icon className="icon-button__icon" />
    </button>
  )
}
