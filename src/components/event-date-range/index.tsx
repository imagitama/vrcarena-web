import { useState } from 'react'
import styled from '@emotion/styled'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { ChevronDown } from '@/icons'

import FormattedDate from '../formatted-date'
import { getTimezoneInfo, getDateInAllZones } from '@/utils/timezones'

const Root = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
  font-weight: 100;
  font-size: 1.1rem;
`

export const Separator = styled.div`
  font-size: 150%;
  margin: 0 2rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const TimezoneExpander = styled.div`
  margin-left: 2rem;
  cursor: pointer;
  user-select: none;
`

const TimezoneListRoot = styled.div`
  font-size: 0.75rem;
`

const TimezoneListEntry = styled.div`
  margin-top: 0.25rem;
`

const userTimezoneInfo = getTimezoneInfo()

const TimezoneList = ({ date }: { date: Date }) => {
  return (
    <TimezoneListRoot>
      {getDateInAllZones(date).map((timezoneInfo) => (
        <TimezoneListEntry key={timezoneInfo.zone}>
          <FormattedDate date={timezoneInfo.date} isRelative={false} />{' '}
          {timezoneInfo.offset} {timezoneInfo.zone} {timezoneInfo.label}
        </TimezoneListEntry>
      ))}
    </TimezoneListRoot>
  )
}

const EventDateRange = ({
  startsAt,
  endsAt,
  className,
}: {
  startsAt: Date
  endsAt: Date
  className?: string
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  return (
    <Root className={className}>
      <div>
        <FormattedDate date={startsAt} isRelative={false} />
        {isExpanded && <TimezoneList date={startsAt} />}
      </div>
      <Separator>
        <ArrowForwardIcon />
      </Separator>
      <div>
        <FormattedDate date={endsAt} isRelative={false} />
        {isExpanded && <TimezoneList date={endsAt} />}
      </div>
      <TimezoneExpander
        onClick={() => setIsExpanded((currentVal) => !currentVal)}>
        {userTimezoneInfo.offset}{' '}
        <ChevronDown
          style={{ transform: isExpanded ? `rotate(180deg)` : `` }}
        />
      </TimezoneExpander>
    </Root>
  )
}

export default EventDateRange
