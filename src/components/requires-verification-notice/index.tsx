import React, { Fragment } from 'react'
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
  const relationsToRender = relations.filter(
    (relation) => relation.requiresVerification === true
  )

  return (
    <Box icon={<VerifiedUserIcon />}>
      <div className={classes.title}>
        <WarningIcon /> Verification Required
      </div>
      <div className={classes.desc}>
        The author has indicated there is additional verification steps required
        to get this asset:
        {relationsToRender.map((relation) => (
          <Fragment key={relation.asset}>
            <br />
            <br />
            <AssetResultsItem
              asset={relationsData.find(
                (asset) => asset.id === relation?.asset
              )}
              isTiny
              controls={null}
            />
            <br />
            {relation!.comments}
          </Fragment>
        ))}
      </div>
    </Box>
  )
}

export default RequiresVerificationNotice
