import { WhiteboardDot } from '@/modules/whiteboard'
import { Color } from '../color-picker-button'

export const CANVAS_WIDTH = 256
export const CANVAS_HEIGHT = 256

export const render = (
  canvas: HTMLCanvasElement,
  dots: WhiteboardDot[]
): void => {
  console.debug(`render`, { canvas, dots })

  const ctx = canvas.getContext('2d')
  ctx!.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  const imageData = ctx!.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT)

  const data = imageData.data

  for (const { x, y, r, g, b, a } of dots) {
    if (x < 0 || x >= CANVAS_WIDTH || y < 0 || y >= CANVAS_HEIGHT) continue
    const idx = (y * CANVAS_WIDTH + x) * 4
    data[idx] = r
    data[idx + 1] = g
    data[idx + 2] = b
    data[idx + 3] = Math.round(a * 255)
  }

  ctx!.putImageData(imageData, 0, 0)
}
export const renderNewDot = (
  canvas: HTMLCanvasElement,
  { x, y, r, g, b, a }: WhiteboardDot
) => {
  console.debug(`renderNewDot`, { canvas, dot: { x, y, r, g, b, a } })

  const ctx = canvas.getContext('2d')
  const imageData = ctx!.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  const data = imageData.data

  const idx = (y * CANVAS_WIDTH + x) * 4
  data[idx] = r
  data[idx + 1] = g
  data[idx + 2] = b
  data[idx + 3] = Math.round(a * 255)

  ctx!.putImageData(imageData, 0, 0)
}

export const renderNewDots = (
  canvas: HTMLCanvasElement,
  dots: WhiteboardDot[]
) => {
  console.debug(`renderNewDots`, { canvas, dots })

  const ctx = canvas.getContext('2d')
  const imageData = ctx!.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  const data = imageData.data

  for (const { x, y, r, g, b, a } of dots) {
    if (x < 0 || x >= CANVAS_WIDTH || y < 0 || y >= CANVAS_HEIGHT) continue
    const idx = (y * CANVAS_WIDTH + x) * 4
    data[idx] = r
    data[idx + 1] = g
    data[idx + 2] = b
    data[idx + 3] = Math.round(a * 255)
  }

  ctx!.putImageData(imageData, 0, 0)
}

export const bresenham = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  cb: (x: number, y: number) => void
) => {
  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx - dy

  while (true) {
    cb(x0, y0)
    if (x0 === x1 && y0 === y1) break
    const e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x0 += sx
    }
    if (e2 < dx) {
      err += dx
      y0 += sy
    }
  }
}

export const getCanvasCoords = (canvas: HTMLCanvasElement, e: MouseEvent) => {
  const scaleX = canvas.width / canvas.offsetWidth
  const scaleY = canvas.height / canvas.offsetHeight
  return {
    x: Math.floor(e.offsetX * scaleX),
    y: Math.floor(e.offsetY * scaleY),
  }
}

export const getColorFromStr = (str: string): Color => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }

  const r = 150 + (Math.abs(hash >> 16) % 106)
  const g = 150 + (Math.abs(hash >> 8) % 106)
  const b = 150 + (Math.abs(hash) % 106)

  return {
    r,
    g,
    b,
    a: 1,
  }
}
