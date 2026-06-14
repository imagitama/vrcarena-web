import { VRCHAT_GROUP_ID, VRCHAT_GROUP_URL } from '@/config'
import styled from '@emotion/styled'
import VrcGroupIcon from '@kurone-kito/launchpad-icons-react/dist/Group'

const Root = styled.a`
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgb(0, 0, 0);
  color: #fff;
  border-radius: 1em;
  padding: 0.5em 1em;
  display: inline-flex;
  align-items: center;
  transition: transform 200ms;
  &:hover {
    transform: scale(1.1);
  }
`

const Text = styled.div``

const GroupId = styled.span`
  font-size: 150%;
  display: block;
`

const Icon = styled(VrcGroupIcon)`
  font-size: 250%;
  width: 1em;
  height: 1em;
  margin-right: 0.5rem;
`

const VrchatGroupButton = () => (
  <Root href={VRCHAT_GROUP_URL} target="_blank" rel="noopener noreferrer">
    <Icon />
    <Text>
      Join Our Group:
      <GroupId> {VRCHAT_GROUP_ID}</GroupId>
    </Text>
  </Root>
)

export default VrchatGroupButton
