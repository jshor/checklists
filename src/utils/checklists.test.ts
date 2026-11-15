import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { checklists, hashName, request } from './checklists'

class FakeXhr {
  static status = 200
  static response: unknown = [{ title: 'T', items: [] }]
  static opened: string[] = []
  status = 0
  response: unknown = null
  responseType = ''
  onload = () => {}
  onerror = () => {}
  open(_method: string, url: string) { FakeXhr.opened.push(url) }
  send() {
    this.status = FakeXhr.status
    this.response = FakeXhr.response
    this.onload()
  }
}

beforeEach(() => {
  vi.stubGlobal('XMLHttpRequest', FakeXhr)
  FakeXhr.status = 200
  FakeXhr.opened = []
})

afterEach(() => {
  vi.unstubAllGlobals()
  location.hash = ''
})

describe('checklists', () => {
  it('lists the JSON files in the checklists folder by name', () => {
    expect(checklists.B38M).toMatch(/B38M\.json/)
  })

  it('reads and decodes the hash', () => {
    location.hash = 'A%20B'

    expect(hashName()).toBe('A B')
  })
})

describe('request', () => {
  it('resolves with the JSON response', async () => {
    await expect(request('/x.json')).resolves.toBe(FakeXhr.response)
    expect(FakeXhr.opened).toEqual(['/x.json'])
  })

  it('rejects on HTTP errors', async () => {
    FakeXhr.status = 404

    await expect(request('/x.json')).rejects.toThrow('HTTP 404')
  })
})
