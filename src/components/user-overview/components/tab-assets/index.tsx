import React, { useCallback } from 'react'
import useIsAdultContentEnabled from '../../../../hooks/useIsAdultContentEnabled'
import useUserOverview from '../../useUserOverview'
import PaginatedView from '../../../paginated-view'
import AssetResults from '../../../asset-results'
import WarningMessage from '../../../warning-message'
import { PublicAsset, ViewNames } from '../../../../modules/assets'
import {
  AccessStatus,
  ApprovalStatus,
  PublishStatus,
} from '../../../../modules/common'

const Renderer = ({ items }: { items?: PublicAsset[] }) => (
  <AssetResults assets={items} />
)

const TabAssets = () => {
  const { userId, user } = useUserOverview()
  const isAdultContentEnabled = useIsAdultContentEnabled()

  // TODO: Refactor to useDatabaseQuery
  const getQuery = useCallback(
    (query) => {
      query = query
        .eq('createdby', userId)
        .eq('publishstatus', PublishStatus.Published)
        .eq('approvalstatus', ApprovalStatus.Approved)
        .eq('accessstatus', AccessStatus.Public)
      if (isAdultContentEnabled !== true) {
        query = query.eq('isadult', false)
      }
      return query
    },
    [userId, isAdultContentEnabled]
  )

  if (!userId || !user) {
    return null
  }

  return (
    <>
      <WarningMessage>
        These are assets this user has posted to the site and are not
        necessarily what they have created. Users are separate to authors.
      </WarningMessage>
      <PaginatedView<PublicAsset>
        viewName={ViewNames.GetFullAssets}
        getQuery={getQuery}
        name="view-user-assets"
        sortOptions={[
          {
            label: 'Submission date',
            fieldName: 'createdat',
          },
          {
            label: 'Title',
            fieldName: 'title',
          },
        ]}
        defaultFieldName="createdat">
        <Renderer />
      </PaginatedView>
    </>
  )
}

export default TabAssets
