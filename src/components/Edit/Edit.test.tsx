import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import Edit from './Edit'

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'innerText', {
    get() { return this.textContent },
    configurable: true,
  })
})

afterEach(cleanup)

const setup = (props: Partial<Parameters<typeof Edit>[0]> = {}) => {
  const onChange = vi.fn()

  render(<Edit value="OLD" onChange={onChange} {...props} />)

  const el = screen.getByText('OLD')
  const type = (text: string) => { el.textContent = text }

  return { el, onChange, type }
}

describe('Edit', () => {
  it('renders an editable, focusable span', () => {
    const { el } = setup({ focusId: 'f', className: 'extra' })

    expect(el.getAttribute('contenteditable')).toBe('true')
    expect(el.tabIndex).toBe(0)
    expect(el.dataset.focus).toBe('f')
    expect(el.classList).toContain('extra')
  })

  it('commits trimmed text on blur', () => {
    const { el, onChange, type } = setup()

    type('  NEW  ')
    fireEvent.blur(el)

    expect(onChange).toHaveBeenCalledWith('NEW')
  })

  it('does not commit unchanged text', () => {
    const { el, onChange } = setup()

    fireEvent.blur(el)

    expect(onChange).not.toHaveBeenCalled()
  })

  it('commits and inserts on Enter, or inserts a note on Shift+Enter', () => {
    const onEnter = vi.fn()
    const { el, onChange, type } = setup({ onEnter })

    type('NEW')
    fireEvent.keyDown(el, { key: 'Enter' })
    fireEvent.keyDown(el, { key: 'Enter', shiftKey: true })

    expect(onChange).toHaveBeenCalledWith('NEW')
    expect(onEnter.mock.calls).toEqual([[false], [true]])
  })

  it('prevents line breaks even without onEnter', () => {
    const { el } = setup()

    expect(fireEvent.keyDown(el, { key: 'Enter' })).toBe(false)
  })

  it('calls onArrow for Up/Down only when given', () => {
    const onArrow = vi.fn()
    const { el } = setup({ onArrow })

    fireEvent.keyDown(el, { key: 'ArrowUp' })
    fireEvent.keyDown(el, { key: 'ArrowDown' })

    expect(onArrow.mock.calls).toEqual([[-1], [1]])
  })

  it('shows display text until focused, then the raw value', () => {
    render(<Edit value="Page {n}" display="Page 2" onChange={vi.fn()} />)
    const el = screen.getByText('Page 2')

    fireEvent.focus(el)
    expect(el.textContent).toBe('Page {n}')

    fireEvent.blur(el)
    expect(el.textContent).toBe('Page 2')
  })

  it('clears a selection inside it on blur', () => {
    const { el } = setup()

    getSelection()!.selectAllChildren(el)
    fireEvent.blur(el)

    expect(getSelection()!.rangeCount).toBe(0)
  })

  it('keeps a selection elsewhere on blur', () => {
    const { el } = setup()
    const other = document.body.appendChild(document.createElement('p'))

    other.textContent = 'other'
    getSelection()!.selectAllChildren(other)
    fireEvent.blur(el)

    expect(getSelection()!.toString()).toBe('other')
    other.remove()
  })

  it('leaves arrow keys alone without onArrow', () => {
    const { el } = setup()

    expect(fireEvent.keyDown(el, { key: 'ArrowUp' })).toBe(true)
  })
})
