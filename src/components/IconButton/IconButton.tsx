import type { ComponentProps } from 'react'
import type { LucideIcon } from 'lucide-react'
import './IconButton.scss'

type Props = ComponentProps<'button'> & { icon: LucideIcon; large?: boolean }

/**
 * Renders a borderless, non-printing button showing a lucide icon.
 */
export default function IconButton({ icon: Icon, large, className = '', ...props }: Props) {
  return (
    <button className={`icon-button ${large ? 'icon-button--large' : ''} no-print ${className}`} {...props}>
      <Icon className="icon-button__icon" />
    </button>
  )
}
