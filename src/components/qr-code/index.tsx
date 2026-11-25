import styled from '@emotion/styled'
import { handleError } from '@/error-handling'
import { renderIntoCanvas } from '@/qr-code'

const QrCodeImg = styled.img`
  width: 200px;
  height: 200px;
  background-color: #fff;
  padding: 8px;
  border-radius: 8px;
`

const QrCode = ({
  url,
  svg,
  heightPx,
}: {
  url?: string
  svg?: string
  heightPx?: number
}) => {
  const onCanvas = async (canvas: HTMLCanvasElement) => {
    try {
      // on unmount this can be null
      if (!canvas) return

      // TODO: use returned PNG download URL?
      if (url)
        await renderIntoCanvas(url, canvas, {
          heightPx,
        })
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (svg) return <QrCodeImg src={svg} />

  return <canvas ref={onCanvas} />
}

export default QrCode
