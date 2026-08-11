import React, { HTMLProps } from 'react'
import ExternalYouTubePlayer from 'react-player/youtube'
import styled from '@emotion/styled'

import { YouTube as YouTubeIcon } from '@/icons'
import useThirdPartyConsent from '@/hooks/useThirdPartyConsent'
import {
  OpenExternalLink as OpenExternalLinkIcon,
  Warning as WarningIcon,
} from '@/icons'
import FormControls from '../form-controls'
import Button from '../button'
import { VRCArenaTheme } from '@/themes'

const ThirdPartyConsentThing = styled.div`
  padding: 0.25rem;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }: { theme?: VRCArenaTheme }) =>
    theme!.shape.borderRadius}px;
`

const StyledYouTubePlaceholder = styled.div`
  width: 320px;
  height: 240px;
  position: relative;
  background: #000;
  border-radius: ${({ theme }: { theme?: VRCArenaTheme }) =>
    theme!.shape.borderRadius}px;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ onClick }) =>
    onClick &&
    `&:hover > *:first-child {
    transform: scale(1.1);
  }`}
`

const StyledYouTubeIcon = styled(YouTubeIcon)`
  font-size: 5rem;
  color: #ff0000;
  transition: 100ms all;
`

export const YouTubePlaceholder = (
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
) => (
  <StyledYouTubePlaceholder {...props}>
    <StyledYouTubeIcon />
    {props.children}
  </StyledYouTubePlaceholder>
)

const YouTubePlayer = ({
  url,
  onPlay = undefined,
  width = undefined,
  height = undefined,
}: {
  url: string
  onPlay?: () => void
  width?: string | number
  height?: string | number
}) => {
  const [hasConsented, setHasConsented] = useThirdPartyConsent()

  if (hasConsented !== true)
    return (
      <YouTubePlaceholder style={{ width, height }}>
        <ThirdPartyConsentThing>
          <WarningIcon /> By watching this YouTube video you consent to Google
          (and potentially other companies) collecting personally identifiable
          data (like your IP address).{' '}
          <a
            href="https://axbom.com/embed-youtube-videos-without-cookies/"
            target="_blank"
            rel="noopener noreferrer">
            Read More <OpenExternalLinkIcon />
          </a>
          <FormControls>
            <Button onClick={() => setHasConsented(true)} color="secondary">
              Allow YouTube Player
            </Button>
          </FormControls>
        </ThirdPartyConsentThing>
      </YouTubePlaceholder>
    )

  return (
    <ExternalYouTubePlayer
      url={url}
      onPlay={onPlay}
      width={width}
      height={height}
    />
  )
}

export default YouTubePlayer
