/**
 * Returns a CSS-usable URL for an image source: data URLs as-is, SVG markup as an encoded data URL.
 */
export const imageUrl = (src: string) => {
  return src.startsWith('<') ? `data:image/svg+xml,${encodeURIComponent(src)}` : src
}

/**
 * Returns an image file's source (SVG markup as-is, other types as a base64 data URL) and its height/width ratio.
 */
export const readImage = (file: File) => {
  return new Promise<{ src: string; ratio: number }>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const src = reader.result as string, im = new Image()

      im.onload = () => resolve({ src, ratio: im.height / im.width })
      im.onerror = () => reject(new Error(`${file.name}: not a readable image`))
      im.src = imageUrl(src)
    }
    reader.onerror = () => reject(reader.error)

    if (file.type === 'image/svg+xml') reader.readAsText(file)
    else reader.readAsDataURL(file)
  })
}
