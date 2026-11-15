/** A checklist line: a label/value pair, or a centered note. */
export type Item = {
  /** Unique id, also used as the drag-and-drop id. */
  id: number
  /** Text left of the dotted leader. */
  label?: string
  /** Text right of the dotted leader. */
  value?: string
  /** Centered italic text; when set, the item is a note instead of a label/value line. */
  note?: string
}

/** A titled group of checklist lines. */
export type Section = {
  /** Unique block id. */
  id: number
  /** Discriminates sections from images. */
  type: 'section'
  /** Header text. */
  title: string
  /** Lines in display order. */
  items: Item[]
}

/** An uploaded image. */
export type Img = {
  /** Unique block id. */
  id: number
  /** Discriminates images from sections. */
  type: 'image'
  /** Base64 data URL. */
  src: string
  /** Height divided by width. */
  ratio: number
  /** Spans both columns when true. */
  wide: boolean
}

/** A top-level entry in the checklist, in flow order. */
export type Block = Section | Img

/** The part of a section that fits in one column. */
export type Fragment = {
  /** The whole section this fragment belongs to. */
  s: Section
  /** The lines shown in this fragment. */
  items: Item[]
  /** True for every fragment after the first ("(cont.)"). */
  cont: boolean
  /** True for the fragment holding the section's last line. */
  last: boolean
}

/** An image placed on a page. */
export type Placed = {
  /** The image. */
  img: Img
  /** Rendered height in px. */
  h: number
}

/** A two-column region of a page. */
export type Band = {
  /** Left and right column contents, top to bottom. */
  cols: (Fragment | Placed)[][]
  /** Height in px used so far by each column. */
  h: number[]
}

/** A printed sheet: two-column bands and full-width images, top to bottom. */
export type Page = (Band | Placed)[]

/** A block as stored in checklist.json and the downloaded JSON. */
export type JsonBlock =
  | {
    /** Section header text. */
    title: string
    /** Lines in order: [label, value] pairs, or a string for a centered note. */
    items: (string | string[])[]
  }
  | {
    /** Base64 data URL. */
    image: string
    /** Height divided by width. */
    ratio: number
    /** Spans both columns when true. */
    wide: boolean
  }
