import styled from '@emotion/styled'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'

import Tooltip from '../tooltip'
import React from 'react'
import { FullUserRepChange } from '@/modules/users'
import * as icons from '@/icons'
import { capitalizeWords } from '@/utils/formatting'
import Icon from '../icon'

const StyledRepMilestones = styled.div`
  display: flex;
  position: relative;
  & > * {
    margin-right: 0.5rem;
  }
`

const StyledRepMilestone = styled.div`
  width: 3rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const Icons = styled.div`
  width: 2rem;
  height: 2rem;
  position: relative;
`

const StyledEmojiEventsIcon = styled(EmojiEventsIcon)`
  font-size: 400%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.2;
`

const Label = styled.div`
  font-size: 75%;
  text-align: center;
  margin-top: 0.5rem;
`

const IconWrapper = styled.span`
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 100%;
  & svg {
    width: 1em;
    height: 1em;
    color: currentColor;
    fill: currentColor;
  }
`

const getLabelForReasonName = (name: string): string =>
  capitalizeWords(name.replaceAll('_', ''))

const RepMilestone = ({ repChange }: { repChange: FullUserRepChange }) => (
  <Tooltip title={`+${repChange.delta} - ${repChange.reasondata.description}`}>
    <StyledRepMilestone>
      <Icons>
        <StyledEmojiEventsIcon />
        <IconWrapper>
          {repChange.reasondata.icon ? (
            <Icon name={repChange.reasondata.icon} />
          ) : null}
        </IconWrapper>
      </Icons>
      <Label>
        {repChange.reasondata.milestonelabel ||
          getLabelForReasonName(repChange.reasondata.name)}
      </Label>
    </StyledRepMilestone>
  </Tooltip>
)

const RepMilestones = ({ repChanges }: { repChanges: FullUserRepChange[] }) => (
  <StyledRepMilestones>
    {repChanges
      .filter((repChange) => repChange.reasondata.milestonelabel !== null)
      .map((repChange) => (
        <RepMilestone key={repChange.reason} repChange={repChange} />
      ))}
  </StyledRepMilestones>
)

export default RepMilestones
