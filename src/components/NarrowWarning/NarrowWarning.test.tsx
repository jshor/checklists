import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import NarrowWarning from './NarrowWarning'

let resize = () => {}

const setDocumentWidth = (width: number) => {
  Object.defineProperty(document.documentElement, 'clientWidth', { value: width, configurable: true })
}

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 816 } as DOMRect)
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: () => void) { resize = callback }
    observe() {}
    disconnect() {}
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('NarrowWarning', () => {
  it('shows the warning when the document is narrower than a page and hides it on OK', () => {
    setDocumentWidth(815)
    render(<NarrowWarning />)

    expect(screen.getByRole('alertdialog').textContent).toContain('designed to be used on a desktop')

    fireEvent.click(screen.getByText('OK'))

    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('shows nothing when the document is at least a page wide', () => {
    setDocumentWidth(816)
    render(<NarrowWarning />)

    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('reacts to the document being resized', () => {
    setDocumentWidth(1000)
    render(<NarrowWarning />)

    setDocumentWidth(500)
    act(() => resize())

    expect(screen.queryByRole('alertdialog')).not.toBeNull()
  })
})
