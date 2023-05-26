import React, { useContext } from 'react'
import EditIcon from '@material-ui/icons/Edit'

import * as routes from '../../../../routes'

import Button from '../../../button'
import TabContext from '../../context'
import Control from '../control'

export default () => {
  const { assetId, isLoading } = useContext(TabContext)

  if (isLoading) {
    return null
  }

  return (
    <>
      <Control>
        <Button
          url={routes.editAssetWithVar.replace(':assetId', assetId)}
          color="default"
          icon={<EditIcon />}>
          Edit Asset
        </Button>
      </Control>
    </>
  )
}
