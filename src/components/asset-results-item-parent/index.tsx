import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LinkIcon from '@material-ui/icons/Link'
import Link from '../../components/link'
import { Asset } from '../../modules/assets'
import * as routes from '../../routes'

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    width: '100%',
    top: 0,
    left: 0,
    zIndex: 10,
    background: 'rgba(0, 0, 0, 0.5)',
    '& a': {
      width: '100%',
      padding: '0.5rem',
      color: '#FFF',
      display: 'flex',
      alignItems: 'center',
      fontWeight: 'bold'
    },
    '& svg': {
      fontSize: '150%',
      marginRight: '0.5rem'
    }
  }
})

const AssetResultsItemParent = ({ parent }: { parent: Asset }) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <Link
        to={routes.viewAssetWithVar.replace(
          ':assetId',
          parent.slug || parent.id
        )}>
        <LinkIcon /> <span>Parent</span>
      </Link>
    </div>
  )
}

export default AssetResultsItemParent
