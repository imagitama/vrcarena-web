import React, { useContext, useState } from 'react'
import RssFeedIcon from '@material-ui/icons/RssFeed'
import EditIcon from '@material-ui/icons/Edit'

import * as routes from '../../../../routes'
import { CollectionNames } from '../../../../hooks/useDatabaseQuery'
import useUserRecord from '../../../../hooks/useUserRecord'
import { canFeatureAssets } from '../../../../permissions'

import Button from '../../../button'
import SubscriptionEditor from '../../../subscription-editor'
import ReportButton from '../../../report-button'
import FeatureButton from '../../../feature-button'
import TabContext from '../../context'
import Control from '../control'
import useIsPatron from '../../../../hooks/useIsPatron'

export default () => {
  const {
    assetId,
    asset,
    isLoading,
    analyticsCategoryName,
    trackAction,
    hydrate,
  } = useContext(TabContext)
  const [isSubscriptionsEditorEnabled, setIsSubscriptionsEditorEnabled] =
    useState(false)
  const [, , user] = useUserRecord()
  const isPatron = useIsPatron()

  if (isLoading) {
    return null
  }

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
      {isPatron && (
        <Control>
          <FeatureButton
            id={assetId}
            existingFeaturedStatus={asset?.featuredstatus}
            onClick={() => trackAction('Click feature asset button', assetId)}
            onDone={hydrate}
          />
        </Control>
      )}
    </>
  )
}
