import React, { useContext, useState } from 'react'
import RssFeedIcon from '@mui/icons-material/RssFeed'
import EditIcon from '@mui/icons-material/Edit'

import * as routes from '../../../../routes'
import useUserRecord from '../../../../hooks/useUserRecord'

import Button from '../../../button'
import SubscriptionEditor from '../../../subscription-editor'
import ReportButton from '../../../report-button'
import FeatureButton from '../../../feature-button'
import TabContext from '../../context'
import Control from '../control'
import useIsPatron from '../../../../hooks/useIsPatron'
import { CollectionNames } from '../../../../modules/assets'

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
          color="secondary"
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
            color="secondary"
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
