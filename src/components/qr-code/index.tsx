import { handleError } from '@/error-handling'
import { renderIntoCanvas } from '@/qr-code'

const QrCode = ({ url, heightPx }: { url: string; heightPx?: number }) => {
  const onCanvas = async (canvas: HTMLCanvasElement) => {
    try {
      // on unmount this can be null
      if (!canvas) return

      // TODO: use returned PNG download URL?
      await renderIntoCanvas(url, canvas, {
        heightPx,
      })
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return <canvas ref={onCanvas} />
}

export default QrCode
