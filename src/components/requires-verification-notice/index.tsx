import React, { Fragment } from 'react'
import { makeStyles } from '@mui/styles'
import WarningIcon from '@mui/icons-material/Warning'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'

import { Asset, Relation } from '../../modules/assets'
import Box from '../box'
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
