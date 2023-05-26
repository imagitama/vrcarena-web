import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import GetAppIcon from '@material-ui/icons/GetApp'

import { createRef, fixAccessingImagesUsingToken } from '../../utils'
import { handleError } from '../../error-handling'

import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserId from '../../hooks/useUserId'

import Button from '../button'

const useStyles = makeStyles({
  // TODO: Re-use between view-source-btn
  large: {
    width: '100%'
  }
})

export default ({ assetId, url, isLarge = false, onClick = null }) => {
  const classes = useStyles()
  const userId = useUserId()
  const [, , , saveToDatabase] = useDatabaseSave(CollectionNames.Downloads)

  const onDownloadBtnClick = async () => {
    if (onClick) {
      onClick({
        assetId,
        url
      })
    }

    try {
      await saveToDatabase({
        asset: createRef(CollectionNames.Assets, assetId)
      })
    } catch (err) {
      console.error('Failed to save download to db', err)
      handleError(err)
    }
  }

  return (
    <Button
      className={`${classes.root} ${isLarge ? classes.large : ''}`}
      url={fixAccessingImagesUsingToken(url)}
      icon={<GetAppIcon />}
      onClick={onDownloadBtnClick}
      size={isLarge ? 'large' : undefined}>
      Download
    </Button>
  )
}
