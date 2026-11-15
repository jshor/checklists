import { describe, expect, it } from 'vitest'
import { imageUrl } from './images'

describe('imageUrl', () => {
  it('passes data URLs through', () => {
    expect(imageUrl('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA')
  })

  it('encodes SVG markup as a data URL', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>'
    const url = imageUrl(svg)

    expect(url.startsWith('data:image/svg+xml,')).toBe(true)
    expect(url).not.toMatch(/["<>#]/)
    expect(decodeURIComponent(url.slice('data:image/svg+xml,'.length))).toBe(svg)
  })
})
