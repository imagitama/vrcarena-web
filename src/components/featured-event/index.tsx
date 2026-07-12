import styled from '@emotion/styled'
import CloseIcon from '@mui/icons-material/Close'

import { routes } from '@/routes'
import { getIsEventLive } from '@/utils/events'
import {
  mediaQueryForMobiles,
  mediaQueryForWideDesktops,
} from '@/media-queries'
import { colorBrand } from '@/themes'

import useGlobalState from '@/hooks/useGlobalState'
import useStorage from '@/hooks/useStorage'

import Link from '@/components/link'
import FormattedDate from '@/components/formatted-date'
import { useSelector } from 'react-redux'
import { RootState } from '@/modules'
import { Event } from '@/modules/events'
import { getRelativeTime } from '@/utils/dates'

const Root = styled.div`
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  line-height: 1rem;
  & a {
    display: flex;
    flex-wrap: wrap;
    color: inherit;
    height: 100%;
  }
`

const Block = styled.div`
  padding: 0.5rem;
  height: 2rem;
`

const TimeBlock = styled(Block)`
  background: ${({ isLive }: { isLive: boolean }) =>
    isLive ? `rgb(150, 0, 0)` : colorBrand};
  ${({ isLive }: { isLive: boolean }) => (isLive ? 'font-weight: bold;' : '')}
`

const NameBlock = styled(Block)`
  background: rgb(0, 0, 0);
  font-weight: bold;
  text-transform: uppercase;
  ${mediaQueryForMobiles} {
    width: 100%;
  }
`

const CloseBtn = styled.div`
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  transition: all 100ms;
  cursor: pointer;
  &:hover {
    background: rgba(0, 0, 0, 0.5);
  }
`

const BannerWrapper = styled.div`
  width: 100%;
  height: 7rem;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  z-index: -1;
  mask-image: linear-gradient(to top, transparent, #282828 100%);
  ${mediaQueryForWideDesktops} {
    mask-image: radial-gradient(ellipse at top, #282828 -200%, transparent 65%, transparent)'
  }
`

const Banner = styled.img`
  width: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: -1;
  transform: translate(-50%, -50%);
`

const STORAGE_KEY = 'hidden-events'

const FeaturedEvent = () => {
  const [, lastErrorCode, globalState] = useGlobalState()
  const [hiddenEventIds, setHiddenEventIds] = useStorage<string[]>(STORAGE_KEY)
  const previewFeaturedEvent = useSelector<RootState, Event | null>(
    (root) => root.app.previewFeaturedEvent
  )

  if (lastErrorCode !== null) {
    return <div>Failed to load featured event</div>
  }

  if (
    !globalState ||
    (!globalState.featuredevents.length && previewFeaturedEvent === null)
  ) {
    return null
  }

  // TODO: display multiple events
  const event = previewFeaturedEvent || globalState.featuredevents[0]

  if (hiddenEventIds?.includes(event.id)) {
    return null
  }

  const onClickHideEvent = () =>
    setHiddenEventIds(
      hiddenEventIds ? hiddenEventIds.concat(event.id) : [event.id]
    )

  const isLive = getIsEventLive(event)

  return (
    <>
      {event.bannerurl && (
        <BannerWrapper>
          <Banner src={event.bannerurl} />
        </BannerWrapper>
      )}
      <Root>
        <Link to={routes.viewEventWithVar.replace(':eventId', event.id)}>
          <NameBlock>{event.name}</NameBlock>
          <TimeBlock isLive={isLive}>
            {isLive ? 'LIVE' : getRelativeTime(event.startsat)}
          </TimeBlock>
          <Block>{event.description}</Block>
        </Link>
        <CloseBtn onClick={onClickHideEvent}>
          <CloseIcon />
        </CloseBtn>
      </Root>
    </>
  )
}

export default FeaturedEvent
