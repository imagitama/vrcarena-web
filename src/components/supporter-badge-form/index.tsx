import { useEffect, useRef, useState } from 'react'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload'

import useIsPatron from '@/hooks/useIsPatron'
import { WEBSITE_FULL_URL } from '@/config'
import { routes } from '@/routes'

import Button from '@/components/button'
import CheckboxInput from '@/components/checkbox-input'
import ErrorMessage from '@/components/error-message'
import InfoMessage from '@/components/info-message'
import TextInput from '@/components/text-input'
import WarningMessage from '@/components/warning-message'

import { create as createBadgeDownloadUrl } from './badge'

const BADGE_WIDTH = 280
const BADGE_HEIGHT = 125

const SupporterBadgeForm = ({
  url,
  route,
}: {
  url?: string
  route?: string
}) => {
  const isPatron = useIsPatron()
  const [isGenerating, setIsGenerating] = useState(true)
  //   const [isGenerating, setIsGenerating] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<null | string>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [overrideUrl, setOverrideUrl] = useState<null | string>(null)
  const [overrideUrlText, setOverrideUrlText] = useState<string>('')
  const [qrCodeEnabled, setQrCodeEnabled] = useState(true)
  const [isUsingPatreonStyle, setIsUsingPatreonStyle] = useState(
    isPatron === true
  )
  const [isPreviewingPatreonStyle, setIsPreviewingPatreonStyle] =
    useState(false)
  const [lastError, setLastError] = useState<null | Error>(null)
  const [usingAlternateText, setUsingAlternateText] = useState(false)

  const onClickApplyOverrideUrl = () => setOverrideUrl(overrideUrlText.trim())

  const qrCodeUrl = overrideUrl
    ? overrideUrl
    : url
    ? url
    : route
    ? `${WEBSITE_FULL_URL}${route}`
    : null

  const onCanvas = async (canvas: HTMLCanvasElement) => {
    try {
      setLastError(null)

      if (!qrCodeUrl) throw new Error('Need a URL or route')

      const createdUrl = await createBadgeDownloadUrl(qrCodeUrl, canvas, {
        usingAlternateText,
        width: BADGE_WIDTH,
        height: BADGE_HEIGHT,
        patreon: isUsingPatreonStyle || isPreviewingPatreonStyle,
        qrCode: qrCodeEnabled,
      })

      console.debug(`onCanvas.createdUrl`, createdUrl)

      setDownloadUrl(createdUrl)
    } catch (err) {
      console.error('Failed to create badge', err)
      setLastError(err as Error)
    }
  }

  useEffect(() => {
    if (!isGenerating || !canvasRef.current) {
      return
    }

    onCanvas(canvasRef.current)
  }, [
    isGenerating,
    isUsingPatreonStyle,
    isPreviewingPatreonStyle,
    overrideUrl,
    usingAlternateText,
  ])

  const reset = () => {
    setLastError(null)
    setIsGenerating(false)
  }

  return (
    <>
      <InfoMessage>
        Show your support by including this badge in your product descriptions
        or social media or anywhere. We appreciate it!
      </InfoMessage>
      <InfoMessage>
        Want to link to your VRCArena author or asset? Paste the URL here:{' '}
        <TextInput
          type="url"
          value={overrideUrlText}
          fullWidth
          onChange={(e) => setOverrideUrlText(e.target.value)}
          placeholder={`eg. ${WEBSITE_FULL_URL}${routes.viewAuthorWithVar.replace(
            ':authorId',
            'abcd'
          )}`}
          button={
            <Button
              onClick={onClickApplyOverrideUrl}
              color="secondary"
              hollow={false}>
              Apply
            </Button>
          }
        />
        {overrideUrlText && !overrideUrlText.includes(WEBSITE_FULL_URL) && (
          <WarningMessage>
            The URL doesn't seem to contain our website at all :{'('}
          </WarningMessage>
        )}
      </InfoMessage>
      {lastError !== null && (
        <ErrorMessage onOkay={reset}>
          Failed to generate badge ({lastError.name})
        </ErrorMessage>
      )}
      {isGenerating ? (
        <div>
          QR code URL: {qrCodeUrl}
          <br />
          <canvas ref={canvasRef}></canvas>
          <br />
          {downloadUrl ? (
            <Button
              url={downloadUrl}
              downloadFilename="vrcarena_badge.png"
              color="secondary"
              hollow={true}
              icon={<CloudDownloadIcon />}>
              Download PNG
            </Button>
          ) : (
            <>Waiting for URL...</>
          )}
        </div>
      ) : null}
      {/* <CheckboxInput
        value={qrCodeEnabled}
        onChange={(newVal) => setQrCodeEnabled(newVal)}
        label="QR Code"
      /> */}
      <CheckboxInput
        value={usingAlternateText}
        onChange={(newVal) => setUsingAlternateText(newVal)}
        label="Use alternate text"
      />
      <CheckboxInput
        value={isUsingPatreonStyle}
        onChange={(newVal) => setIsUsingPatreonStyle(newVal)}
        label="Patreon style"
        isDisabled={!isPatron}
      />
      {!isPatron && (
        <CheckboxInput
          value={isPreviewingPatreonStyle}
          onChange={(newVal) => setIsPreviewingPatreonStyle(newVal)}
          label="Preview Patreon style"
        />
      )}
    </>
  )
}

export default SupporterBadgeForm
