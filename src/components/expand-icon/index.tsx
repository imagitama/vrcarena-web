import styled from '@emotion/styled'
import { ChevronDown as ChevronDownIcon } from '@/icons'

const Icon = styled(ChevronDownIcon)`
  transition: all 100ms;
  cursor: pointer;
  transform: ${({ isExpanded }: { isExpanded: boolean }) =>
    isExpanded ? `rotate(180deg)` : ''};
`

const ExpandIcon = ({
  isExpanded,
  onClick,
}: {
  isExpanded: boolean
  onClick: () => void
}) => {
  return <Icon onClick={onClick} isExpanded={isExpanded} />
}

export default ExpandIcon
