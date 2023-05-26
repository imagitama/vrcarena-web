import React, { useContext, useState } from 'react'
import RssFeedIcon from '@material-ui/icons/RssFeed'
import EditIcon from '@material-ui/icons/Edit'

import * as routes from '../../../../routes'
import {
  CollectionNames,
  AssetMetaFieldNames
} from '../../../../hooks/useDatabaseQuery'
import useUserRecord from '../../../../hooks/useUserRecord'
import { canFeatureAssets } from '../../../../permissions'

import Button from '../../../button'
import SubscriptionEditor from '../../../subscription-editor'
import ReportButton from '../../../report-button'
import FeatureAssetButton from '../../../feature-asset-button'
import TabContext from '../../context'
import Control from '../control'

export default () => {
  const {
    assetId,
    asset,
    isLoading,
    analyticsCategoryName,
    trackAction
  } = useContext(TabContext)
  const [
    isSubscriptionsEditorEnabled,
    setIsSubscriptionsEditorEnabled
  ] = useState(false)
  const [, , user] = useUserRecord()

  if (isLoading) {
    return null
  }

  const isAbleToFeatureAssets = canFeatureAssets(user)

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
          color="default"
          icon={<EditIcon />}>
          Suggest Edit
        </Button>
      </Control>
      <Control>
        {isSubscriptionsEditorEnabled ? (
          <SubscriptionEditor
            parentTable={CollectionNames.Assets}
            parentId={assetId}
          />
        ) : (
          <Button
            onClick={() => setIsSubscriptionsEditorEnabled(true)}
            color="default"
            icon={<RssFeedIcon />}>
            Subscribe
          </Button>
        )}
      </Control>
      {isAbleToFeatureAssets && (
        <Control>
          <FeatureAssetButton
            assetId={assetId}
            featuredStatus={asset[AssetMetaFieldNames.featuredStatus]}
            onClick={() => trackAction('Click feature asset button', assetId)}
          />
        </Control>
      )}
    </>
  )
}
