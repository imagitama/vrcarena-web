import React, { useCallback } from 'react'
import {
  AccessStatuses,
  ApprovalStatuses,
  AssetFieldNames,
  PublishStatuses,
} from '../../../../hooks/useDatabaseQuery'
import useIsAdultContentEnabled from '../../../../hooks/useIsAdultContentEnabled'
import useUserOverview from '../../useUserOverview'
import PaginatedView from '../../../paginated-view'
import AssetResults from '../../../asset-results'
import WarningMessage from '../../../warning-message'
import {
  CollectionNames,
  PublicAsset,
  ViewNames,
} from '../../../../modules/assets'

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
        .eq(AssetFieldNames.createdBy, userId)
        .eq('publishstatus', PublishStatuses.Published)
        .eq('approvalstatus', ApprovalStatuses.Approved)
        .eq('accessstatus', AccessStatuses.Public)
      if (isAdultContentEnabled !== true) {
        query = query.eq(AssetFieldNames.isAdult, false)
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
        sortKey="view-user-assets"
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
