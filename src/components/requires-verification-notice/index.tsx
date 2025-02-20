import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import WarningIcon from '@material-ui/icons/Warning'
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser'

import { trackAction } from '../../analytics'
import { Asset, DiscordServerData, Relation } from '../../modules/assets'
import Box from '../box'
import { Discord as DiscordIcon } from '../../icons'
import { discordPurple } from '../../config'
import Button from '../button'
import AssetResultsItem from '../asset-results-item'

const useStyles = makeStyles({
  title: {
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      marginRight: '0.25rem',
    },
  },
  desc: {
    padding: '0.25rem',
  },
  buttonWrapper: {
    marginTop: '0.25rem',
    '& > div:first-child': {
      marginBottom: '0.25rem',
      fontWeight: 'bold',
    },
  },
})

const RequiresVerificationNotice = ({
  relations,
  relationsData,
}: {
  relations: Relation[]
  relationsData: Asset[]
}) => {
  const classes = useStyles()
  const relationIdx = relations
    .filter((relation, idx) => relation.requiresVerification)
    .map((relation, idx) => idx)[0]

  return (
    <Box icon={<VerifiedUserIcon />}>
      <div className={classes.title}>
        <WarningIcon /> Verification Required
      </div>
      <div className={classes.desc}>
        The author has indicated there is additional verification steps required
        to get this asset:
        <br />
        <br />
        <AssetResultsItem
          asset={relationsData[relationIdx]}
          isTiny
          controls={null}
        />
        <br />
        {relations[relationIdx].comments}
      </div>
    </Box>
  )
}

export default RequiresVerificationNotice
