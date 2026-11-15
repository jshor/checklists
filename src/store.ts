import { createContext, useContext, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import type { Block, Item, JsonBlock, JsonChecklist, Section } from './types'

let nextId = 1

/**
 * Deserializes a JSON checklist into a Block[] with unique ids.
 */
export const fromJson = (json: JsonBlock[]): Block[] => {
  return json.map(b => {
    if ('image' in b) {
      return { id: nextId++, type: 'image', src: b.image, ratio: b.ratio, wide: b.wide }
    }

    const items = b.items.map(it => {
      return typeof it === 'string'
        ? { id: nextId++, note: it }
        : { id: nextId++, label: it[0], value: it[1] }
    })

    return { id: nextId++, type: 'section', title: b.title, items }
  })
}

/**
 * Serializes the title, footer and blocks into checklist JSON, omitting the ids.
 */
export const toJson = ({ title, footer, blocks }: { title: string; footer: string[]; blocks: Block[] }) => {
  const json: JsonChecklist = {
    title,
    footer,
    blocks: blocks.map(b => {
      return b.type === 'image'
        ? { image: b.src, ratio: b.ratio, wide: b.wide }
        : { title: b.title, items: b.items.map(it => it.note ?? [it.label!, it.value!]) }
    }),
  }

  return JSON.stringify(json, null, 2)
}

/** Title for a checklist that does not specify one. */
export const DEFAULT_TITLE = 'Untitled Checklist'

/** Footer texts for a checklist that does not specify any. */
export const DEFAULT_FOOTER = ['Aircraft', 'For Flight Simulation Only.', 'Page {n} of {m}']

export function useChecklist() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [title, setDocTitle] = useState(DEFAULT_TITLE)
  const [footer, setFooter] = useState(DEFAULT_FOOTER)
  const [focusId, focus] = useState<string | null>(null) // data-focus of an element to focus after render
  const [dragId, setDragId] = useState<number | null>(null)

  /** Replaces a section's items with the result of fn. */
  const mapItems = (sid: number, fn: (items: Item[]) => Item[]) => {
    return setBlocks(bs => {
      return bs.map(b => {
        return b.id === sid && b.type === 'section' ? { ...b, items: fn(b.items) } : b
      })
    })
  }

  return {
    blocks, title, footer, focusId,

    /** Sets the document title. */
    setDocTitle,

    /** The item being dragged, or null if none. */
    dragItem: blocks.flatMap(b => (b.type === 'section' ? b.items : [])).find(it => it.id === dragId),

    /** Focuses the element with this data-focus after the next render. */
    focus,

    /** Sets the id of the item being dragged. */
    setDragId,

    /** Replaces the whole checklist, including its title and footer. */
    load: (json: JsonChecklist) => {
      setDocTitle(json.title ?? DEFAULT_TITLE)
      setFooter(json.footer ?? DEFAULT_FOOTER)
      return setBlocks(fromJson(json.blocks))
    },

    /** Appends an empty section. */
    addSection: () => {
      return setBlocks(bs => {
        return [...bs, { id: nextId++, type: 'section', title: 'SECTION', items: [] }]
      })
    },

    /** Appends a column-width image. */
    addImage: (src: string, ratio: number) => {
      return setBlocks(bs => {
        return [...bs, { id: nextId++, type: 'image', src, ratio, wide: false }]
      })
    },

    /** Deletes a section or image. */
    removeBlock: (id: number) => {
      return setBlocks(bs => bs.filter(b => b.id !== id))
    },

    /** Swaps a section or image with its neighbour above (-1) or below (1). */
    move: (id: number, dir: -1 | 1) => {
      return setBlocks(bs => {
        const i = bs.findIndex(b => b.id === id)

        return bs[i + dir] ? arrayMove(bs, i, i + dir) : bs
      })
    },

    /** Sets a section's title. */
    setTitle: (id: number, title: string) => {
      return setBlocks(bs => {
        return bs.map(b => {
          return b.id === id && b.type === 'section' ? { ...b, title } : b
        })
      })
    },

    /** Toggles an image between column and full width. */
    toggleWide: (id: number) => {
      return setBlocks(bs => {
        return bs.map(b => {
          return b.id === id && b.type === 'image' ? { ...b, wide: !b.wide } : b
        })
      })
    },

    /** Sets a line's label, value or note text. */
    setItem: (sid: number, iid: number, key: 'label' | 'value' | 'note', text: string) => {
      return mapItems(sid, items => {
        return items.map(it => {
          return it.id === iid ? { ...it, [key]: text } : it
        })
      })
    },

    /** Deletes a line. */
    removeItem: (sid: number, iid: number) => {
      return mapItems(sid, items => items.filter(it => it.id !== iid))
    },

    /** Inserts a line or note after afterId (at the top when null) and focuses it. */
    insertItem: (sid: number, afterId: number | null, note: boolean) => {
      const id = nextId++
      const item = note ? { id, note: 'Note' } : { id, label: 'ITEM', value: 'VALUE' }

      mapItems(sid, items => {
        const at = items.findIndex(it => it.id === afterId)

        return items.toSpliced(at + 1, 0, item)
      })

      return focus(`item-${id}`)
    },

    /** Moves a line to another line's position within its section; ignores drops on other sections. */
    sortItems: (from: number, to: number) => {
      const section = blocks.find(b => {
        return b.type === 'section' && b.items.some(it => it.id === from)
      }) as Section

      return mapItems(section.id, items => {
        const i = items.findIndex(it => it.id === from)
        const j = items.findIndex(it => it.id === to)

        return j < 0 ? items : arrayMove(items, i, j)
      })
    },

    /** Sets one of the three footer texts. */
    setFooterText: (i: number, text: string) => {
      return setFooter(f => f.with(i, text))
    },
  }
}

export type Store = ReturnType<typeof useChecklist>
export const StoreContext = createContext<Store>(null!)
export const useStore = () => useContext(StoreContext)
