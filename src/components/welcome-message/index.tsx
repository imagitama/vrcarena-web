import CloseIcon from '@mui/icons-material/Close'
import styled from '@emotion/styled'

import peanutbuddhaAvatarUrl from '@/assets/images/peanutbuddha_june2026.webp'
import useNotice from '@/hooks/useNotice'
import { routes } from '@/routes'

import Button, { GoToButton } from '@/components/button'
import Link from '@/components/link'
import Tooltip from '@/components/tooltip'
import { mediaQueryForTabletsOrBelow } from '@/media-queries'
import { CONTENT_MAX_WIDTH_PX } from '@/config'

const WELCOME_MESSAGE_HIDE_ID = 'welcome_may2026'

const Controls = styled.div`
  text-align: right;
`

const WelcomeMessageRoot = styled.div`
  display: flex;
  max-width: ${CONTENT_MAX_WIDTH_PX}px;
  margin: 0 auto 1rem;
  ${mediaQueryForTabletsOrBelow} {
    padding: 0 0.5rem;
  }
`

const SpeechBubble = styled.div`
  border-radius: 0.5rem;
  border: 1px solid rgb(255, 255, 255, 0.1);
  padding: 0.5rem;
  position: relative;
  & > p {
    padding-right: 0.5rem;
  }
  & > p:first-of-type {
    margin-top: 0;
  }
  & > p:last-of-type {
    margin-bottom: 0;
  }
`

const SpeechBubbleTriangleOuter = styled.div`
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0.6rem 1.1rem 0.6rem 0;
  border-color: transparent rgba(255, 255, 255, 0.1) transparent transparent;
  position: absolute;
  top: 0.9rem;
  left: -1.1rem;
`
const SpeechBubbleTriangle = styled.div`
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0.5rem 1rem 0.5rem 0;
  border-color: transparent rgb(40, 40, 40) transparent transparent;
  position: absolute;
  top: 1rem;
  left: -1rem;
`

const Avatar = styled.div`
  margin-right: 1rem;
  text-align: center;
  & img {
    width: 3rem;
    height: 3rem;
    border-radius: 100%;
    animation-delay: 5s;
  }
`

const Username = styled.span`
  display: block;
  width: 100%;
  font-weight: 300;
  font-size: 75%;
`

const CloseButton = styled.div`
  padding: 0.25rem;
  position: absolute;
  top: 0;
  right: 0;
  cursor: pointer;
  transition: all 100ms;
  &:hover {
    transform: scale(1.1);
  }
`

const WelcomeMessage = () => {
  const [isHidden, hideNotice] = useNotice(WELCOME_MESSAGE_HIDE_ID)
  if (isHidden) return null
  return (
    <WelcomeMessageRoot>
      <Avatar>
        <img src={peanutbuddhaAvatarUrl} alt="PeanutBuddha Avatar" />
        <Username>PeanutBuddha</Username>
      </Avatar>
      <SpeechBubble>
        <CloseButton onClick={hideNotice}>
          <CloseIcon />
        </CloseButton>
        <SpeechBubbleTriangleOuter />
        <SpeechBubbleTriangle />
        <p>
          An open-source, not-for-profit community project to document, tag and
          categorize every asset for VR social games such as VRChat, ChilloutVR
          and Resonite.
        </p>
        <p>
          Anyone can submit and amend any asset on the site. No automated
          scraping of products
          <Tooltip
            title={
              <>
                We use scraping to help humans add their assets to the site.
                <br />
                <br />
                We use AI to help humans add their assets to the site, and for
                some basic tasks. See our{' '}
                <Link to={routes.aiPolicy}>AI policy</Link>.
              </>
            }>
            <span>*</span>
          </Tooltip>
          .
        </p>
        <p>
          The site was created in 2020 and is moderated by our awesome{' '}
          <Link to={routes.staffUsers}>volunteer team</Link> and funded entirely
          by our <Link to={routes.patreon}>Patreon supporters</Link>.
        </p>
        <Controls>
          <Button onClick={hideNotice} size="small" color="secondary" hollow>
            Hide
          </Button>{' '}
          <GoToButton url={routes.about} size="small">
            Read More
          </GoToButton>
        </Controls>
      </SpeechBubble>
    </WelcomeMessageRoot>
  )
}

export default WelcomeMessage
