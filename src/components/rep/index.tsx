import InfoIcon from '@mui/icons-material/Info'
import styled from '@emotion/styled'

import StatusText from '../status-text'
import Tooltip from '../tooltip'

const Number = styled(StatusText)`
  font-size: 200%;
  font-weight: bold;
`

const Rep = ({ reputation }: { reputation: number }) => {
  return (
    <span>
      <Number positivity={reputation > 0 ? 1 : -1}>{reputation}</Number>{' '}
      <Tooltip
        title={
          <>
            Users gain rep by performing actions on the site and by having an
            older account
            <br />
            <br />
            Higher rep means you are more trustworthy so your assets, amendments
            and other actions may be approved faster
          </>
        }>
        <InfoIcon />
      </Tooltip>
    </span>
  )
}

export default Rep
