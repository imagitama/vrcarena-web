import React, { useContext } from 'react'
import EditIcon from '@mui/icons-material/Edit'

import * as routes from '@/routes'
import {
  CollectionNames,
  getIsAssetADraft,
  getIsAssetDeleted,
} from '@/modules/assets'
import useUserId from '@/hooks/useUserId'

import Button from '@/components/button'
import ReportButton from '@/components/report-button'
import DeleteDraftButton from '@/components/delete-draft-button'

import TabContext from '../../context'
import Control from '../control'

export default () => {
  const { assetId, asset, isLoading, analyticsCategoryName, hydrate } =
    useContext(TabContext)
  const myUserId = useUserId()

  if (isLoading || !asset) {
    return null
  }

  const isCreator = asset?.createdby === myUserId

  return (
    <>
      <Control>
        <ReportButton
          type={CollectionNames.Assets}
          id={assetId}
          analyticsCategoryName={analyticsCategoryName}
        />
      </Control>
      <Control>
        <Button
          url={routes.createAmendmentWithVar
            .replace(':parentTable', CollectionNames.Assets)
            .replace(':parentId', assetId)}
          color="secondary"
          icon={<EditIcon />}>
          Suggest Edit
        </Button>
      </Control>
      {isCreator && getIsAssetADraft(asset) && !getIsAssetDeleted(asset) ? (
        <Control>
          <DeleteDraftButton assetId={assetId} onDone={hydrate} />
        </Control>
      ) : null}
    </>
  )
}
