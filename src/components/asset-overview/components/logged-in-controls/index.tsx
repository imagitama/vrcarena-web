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
import PublishAssetButton from '@/components/publish-asset-button'
import useIsEditor from '@/hooks/useIsEditor'

export default () => {
  const { assetId, asset, isLoading, analyticsCategoryName, hydrate } =
    useContext(TabContext)
  const myUserId = useUserId()
  const isEditor = useIsEditor()

  if (isLoading || !asset) {
    return null
  }

  const isCreator = asset?.createdby === myUserId

  return (
    <>
      <ReportButton
        type={CollectionNames.Assets}
        id={assetId}
        analyticsCategoryName={analyticsCategoryName}
        margin
      />
      <Button
        url={routes.createAmendmentWithVar
          .replace(':parentTable', CollectionNames.Assets)
          .replace(':parentId', assetId)}
        color="secondary"
        hollow={false}
        icon={<EditIcon />}
        margin>
        Suggest Edit
      </Button>
      {isCreator && getIsAssetADraft(asset) && !getIsAssetDeleted(asset) ? (
        <DeleteDraftButton assetId={assetId} onDone={hydrate} margin />
      ) : null}
      {isCreator && (
        <PublishAssetButton assetId={assetId} asset={asset} onDone={hydrate} />
      )}
    </>
  )
}
