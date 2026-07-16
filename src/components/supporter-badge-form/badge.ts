// import { default as logoUrl } from '@/assets/images/logo.svg?raw'

import { patreonGold, patreonGoldDark } from '@/themes'

interface Options {
  usingAlternateText?: boolean
  width?: number
  height?: number
  qrCode?: boolean
  patreon?: boolean
}

export const create = async (
  url: string,
  canvasElem: HTMLCanvasElement,
  opts?: Options
): Promise<string> => {
  const canvasWidth = opts?.width || canvasElem.width
  const canvasHeight = opts?.height || canvasElem.height

  const borderWidth = 2
  const borderRadius = 10

  const qrCodePadding = 10
  const qrCodeMargin = 5
  const qrCodeBorderRadius = 6
  const qrCodeWidth = canvasHeight - qrCodePadding * 2 - borderWidth * 2
  const qrCodeHeight = qrCodeWidth
  const qrCodeTotalWidth = qrCodeWidth + qrCodePadding

  const textAreaWidth = canvasWidth - qrCodeTotalWidth - qrCodeMargin

  const ctx = canvasElem.getContext('2d')!

  // fix blurriness
  const dpr = window.devicePixelRatio || 1
  canvasElem.width = canvasWidth * dpr
  canvasElem.height = canvasHeight * dpr
  canvasElem.style.width = `${canvasWidth}px`
  canvasElem.style.height = `${canvasHeight}px`
  ctx.scale(dpr, dpr)

  console.debug(`creating badge...`, { url, opts, dpr })

  // TODO: use theme
  const purple = '#6E4A9E'

  if (opts?.patreon === true) {
    ctx.beginPath()
    ctx.roundRect(0, 0, canvasWidth, canvasHeight, borderRadius)
    ctx.fillStyle = patreonGoldDark
    ctx.fill()

    ctx.beginPath()
    ctx.roundRect(
      borderWidth,
      borderWidth,
      canvasWidth - borderWidth * 2,
      canvasHeight - borderWidth * 2,
      borderRadius - 2
    )
    ctx.fillStyle = purple
    ctx.fill()
  } else {
    ctx.beginPath()
    ctx.roundRect(0, 0, canvasWidth, canvasHeight, borderRadius)
    ctx.fillStyle = purple
    ctx.fill()
  }

  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#FFF'
  ctx.font = 'bold 24px "Roboto", sans-serif'
  const textPosX = textAreaWidth / 2

  const textLines = opts?.usingAlternateText
    ? ['View on', 'VRCArena']
    : opts?.patreon
    ? ['Patreon', 'Supporter']
    : ['VRCArena', 'Supporter']

  if (opts?.patreon) {
    const lineDistance = 30
    ctx.fillText(`VRCArena`, textPosX, canvasHeight / 2 - lineDistance)
    const shadowDistance = 2
    ctx.fillStyle = '#8b7f00'
    ctx.fillText(
      textLines[0],
      textPosX + shadowDistance,
      canvasHeight / 2 + shadowDistance
    )
    ctx.fillText(
      textLines[1],
      textPosX + shadowDistance,
      canvasHeight / 2 + lineDistance + shadowDistance
    )
    ctx.fillStyle = patreonGold
    ctx.fillText(textLines[0], textPosX, canvasHeight / 2)
    ctx.fillText(textLines[1], textPosX, canvasHeight / 2 + lineDistance)
  } else {
    const lineDistance = 15
    ctx.fillText(textLines[0], textPosX, canvasHeight / 2 - lineDistance)
    ctx.fillText(textLines[1], textPosX, canvasHeight / 2 + lineDistance)
  }

  const qrCodePosX =
    canvasWidth - qrCodeWidth - borderWidth - qrCodePadding - qrCodeMargin
  const qrCodePosY = borderWidth + qrCodeMargin

  if (opts?.qrCode !== false) {
    console.debug(`adding QR code...`)

    ctx.beginPath()
    ctx.roundRect(
      qrCodePosX,
      qrCodePosY,
      qrCodeWidth + qrCodePadding,
      qrCodeWidth + qrCodePadding,
      qrCodeBorderRadius
    )
    ctx.fillStyle = '#FFF'
    ctx.fill()

    const QRCode = (await import('qrcode')).default

    const dataUrl = await QRCode.toDataURL(url, {
      width: qrCodeWidth * dpr,
      margin: 0,
      errorCorrectionLevel: 'H',
    })

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = dataUrl
    })

    ctx.drawImage(
      img,
      canvasWidth - qrCodeWidth - borderWidth - qrCodePadding,
      borderWidth + qrCodePadding,
      qrCodeWidth,
      qrCodeWidth
    )

    const logoWidth = 25
    const logoHeight = 25
    const logoPadding = 2
    const logoBorderRadius = 3

    ctx.beginPath()
    ctx.fillStyle = purple
    ctx.roundRect(
      qrCodePosX + qrCodeWidth / 2 - logoWidth / 2 + logoPadding,
      qrCodePosY + qrCodeHeight / 2 - logoHeight / 2 + logoPadding,
      logoWidth + logoPadding * 2,
      logoHeight + logoPadding * 2,
      logoBorderRadius
    )
    ctx.fill()

    console.debug(`adding logo...`)

    const svg = await fetch(
      new URL('/assets/images/logo.svg', import.meta.url)
    ).then((r) => r.text())

    const svgWithColor = svg.replace('<path', `<path fill="#FFF"`)

    console.debug(`svg:`, svg, svgWithColor)

    const blob = new Blob([svgWithColor], { type: 'image/svg+xml' })
    const logoUrl = URL.createObjectURL(blob)

    console.debug(`downloaded logo:`, logoUrl)

    const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = logoUrl
    })

    console.debug(`drawing logo...`)

    ctx.drawImage(
      logoImg,
      qrCodePosX + qrCodeWidth / 2 - logoWidth / 2 + logoPadding * 2,
      qrCodePosY + qrCodeHeight / 2 - logoHeight / 2 + logoPadding * 2,
      logoWidth,
      logoHeight
    )
  }

  const downloadUrl = canvasElem.toDataURL('image/png')

  console.debug(`finished:`, downloadUrl)

  return downloadUrl
}
