import styled from '@emotion/styled'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'

// milestones
import StarIcon from '@mui/icons-material/Star'
import GavelIcon from '@mui/icons-material/Gavel'
import HowToVoteIcon from '@mui/icons-material/HowToVote'

import Tooltip from '../tooltip'
import React from 'react'
import { FullUserRepChange } from '@/modules/users'
import * as icons from '@/icons'
import { capitalizeWords } from '@/utils/formatting'

interface MilestoneInfo {
  name: string
  label: string
  icon: React.ComponentType
}

// TODO: move to database `ismilestone` & `icon`
const milestones: MilestoneInfo[] = [
  {
    name: 'become_staff',
    label: 'Staff',
    icon: GavelIcon,
  },
  {
    name: 'become_patron',
    label: 'Patron',
    icon: icons.Patreon,
  },
  {
    name: 'assets_approved_tier1',
    label: 'Submitter',
    icon: StarIcon,
  },
  {
    name: 'submit_survey_response',
    label: 'Survey',
    icon: HowToVoteIcon,
  },
]

const getIsRepChangeMilestone = (repChange: FullUserRepChange): boolean =>
  repChange.reasondata.ismilestone === true ||
  milestones.find((info) => info.name === repChange.reason) !== undefined

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

const RepMilestone = ({
  repChange,
  milestone,
}: {
  repChange: FullUserRepChange
  milestone?: MilestoneInfo
}) => (
  <Tooltip title={`+${repChange.delta} - ${repChange.reasondata.description}`}>
    <StyledRepMilestone>
      <Icons>
        <StyledEmojiEventsIcon />
        <IconWrapper>
          {milestone?.icon
            ? React.createElement(milestone?.icon)
            : repChange.reasondata.icon
            ? // @ts-ignore
              React.createElement(icons[repChange.reasondata.icon])
            : null}
        </IconWrapper>
      </Icons>
      <Label>
        {milestone?.label ||
          repChange.reasondata.shortlabel ||
          getLabelForReasonName(repChange.reasondata.name)}
      </Label>
    </StyledRepMilestone>
  </Tooltip>
)

const RepMilestones = ({ repChanges }: { repChanges: FullUserRepChange[] }) => (
  <StyledRepMilestones>
    {repChanges.filter(getIsRepChangeMilestone).map((repChange) => (
      <RepMilestone
        key={repChange.reason}
        repChange={repChange}
        milestone={milestones.find((info) => info.name === repChange.reason)}
      />
    ))}
  </StyledRepMilestones>
)

export default RepMilestones
