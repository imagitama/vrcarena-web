import React, { useCallback } from 'react'

import {
  AssetFieldNames,
  AssetMetaFieldNames,
  AccessStatuses,
} from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'
import PaginatedView from '../paginated-view'
import AssetResults from '../asset-results'

const Renderer = ({ items }) => <AssetResults assets={items} />

const DeletedAssets = () => {
  const getQuery = useCallback((query) => {
    query = query.eq(AssetMetaFieldNames.accessStatus, AccessStatuses.Deleted)

    return query
  }, [])

  return (
    <PaginatedView
      viewName="getAssetsWithMeta"
      getQuery={getQuery}
      sortKey="view-category"
      sortOptions={[
        {
          label: 'Submission date',
          fieldName: AssetFieldNames.createdAt,
        },
        {
          label: 'Title',
          fieldName: AssetFieldNames.title,
        },
      ]}
      defaultFieldName={AssetFieldNames.createdAt}
      urlWithPageNumberVar={routes.adminWithTabNameVarAndPageNumberVar.replace(
        ':tabName',
        'discarded-assets'
      )}>
      <Renderer />
    </PaginatedView>
  )
}

export default DeletedAssets
