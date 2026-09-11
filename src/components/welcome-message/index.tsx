import CloseIcon from '@mui/icons-material/Close'
import styled from '@emotion/styled'

import useNotice from '@/hooks/useNotice'
import { routes } from '@/routes'

import Button, { GoToButton } from '@/components/button'
import Link from '@/components/link'
import Tooltip from '@/components/tooltip'
import { CONTENT_MAX_WIDTH_PX } from '@/config'
import { useState } from 'react'
import ExpandIcon from '../expand-icon'
import { colorGrey } from '@/themes'

const WELCOME_MESSAGE_HIDE_ID = 'welcome_may2026'

const Controls = styled.div`
  text-align: right;
`

const StyledWelcomeMessage = styled.div`
  max-width: ${CONTENT_MAX_WIDTH_PX}px;
  margin: 0 auto 1rem;
  border-radius: 0.5rem;
  border: 1px solid ${colorGrey};
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
  const [isExpanded, setIsExpanded] = useState(false)
  if (isHidden) return null
  return (
    <StyledWelcomeMessage>
      <CloseButton onClick={hideNotice}>
        <CloseIcon />
      </CloseButton>
      <p>
        An open-source, not-for-profit community project to document, tag and
        categorize every asset for VR social games such as VRChat, ChilloutVR
        and Resonite since 2020
        {isExpanded ? (
          '.'
        ) : (
          <>
            ...{' '}
            <ExpandIcon
              isExpanded={isExpanded}
              onClick={() => setIsExpanded(true)}
            />
          </>
        )}
      </p>
      {isExpanded && (
        <>
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
            The site was created in 2020 by{' '}
            <Link
              to={routes.viewUserWithVar.replace(
                ':userId',
                '04D3yeAUxTMWo8MxscQImHJwtLV2'
              )}>
              PeanutBuddha
            </Link>{' '}
            and is moderated by our awesome{' '}
            <Link to={routes.staffUsers}>volunteer team</Link> and funded
            entirely by our <Link to={routes.patreon}>Patreon supporters</Link>.
          </p>
        </>
      )}
      <Controls>
        {!isExpanded && (
          <Button
            onClick={() => setIsExpanded(true)}
            size="small"
            color="secondary">
            Expand
          </Button>
        )}{' '}
        <Button onClick={hideNotice} size="small" color="secondary">
          Hide
        </Button>{' '}
        <GoToButton url={routes.about} size="small">
          Read More
        </GoToButton>
      </Controls>
    </StyledWelcomeMessage>
  )
}

export default WelcomeMessage
