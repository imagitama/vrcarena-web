import React, { useState, useCallback } from 'react'
// import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
// import CheckBoxIcon from '@material-ui/icons/CheckBox'

import {
  AssetFieldNames,
  AssetMetaFieldNames,
  // PublishStatuses,
  // ApprovalStatuses,
  AccessStatuses
} from '../../hooks/useDatabaseQuery'
// import useUserId from '../../hooks/useUserId'
import * as routes from '../../routes'
// import { trackAction } from '../../analytics'

// import Button from '../button'
import PaginatedView from '../paginated-view'
import AssetResults from '../asset-results'

const Renderer = ({ items }) => <AssetResults assets={items} />

// const subViews = {
//   PUBLIC: 0,
//   DRAFTS: 1,
//   DELETED: 2
// }

// const analyticsCategoryName = 'Admin'

export default () => {
  // const userId = useUserId()
  // const [selectedSubView, setSelectedSubView] = useState(subViews.PUBLIC)
  const getQuery = useCallback(query => {
    query = query.eq(AssetMetaFieldNames.accessStatus, AccessStatuses.Deleted)

    //       switch (selectedSubView) {
    //         case subViews.PUBLIC:
    //           query = query
    //             .eq(AssetMetaFieldNames.publishStatus, PublishStatuses.Published)
    //             .eq(AssetMetaFieldNames.approvalStatus, ApprovalStatuses.Approved)
    //             .eq(AssetMetaFieldNames.accessStatus, AccessStatuses.Public)
    //           break

    //         case subViews.DRAFTS:
    //           query = query.eq(
    //             AssetMetaFieldNames.accessStatus,
    //             AccessStatuses.Public
    //           ).or(`${AssetMetaFieldNames.publishStatus}.eq.${
    //             PublishStatuses.Draft
    //           },\
    // ${AssetMetaFieldNames.approvalStatus}.eq.${ApprovalStatuses.Waiting}\
    // ${AssetMetaFieldNames.approvalStatus}.eq.${ApprovalStatuses.Declined}`)
    //           break

    //         case subViews.DELETED:
    //           query = query.eq(
    //             AssetMetaFieldNames.accessStatus,
    //             AccessStatuses.Deleted
    //           )
    //       }

    return query
  }, [])

  // const toggleSubView = subView =>
  //   setSelectedSubView(currentVal => {
  //     if (currentVal === subView) {
  //       return subViews.PUBLIC
  //     }
  //     return subView
  //   })

  return (
    <PaginatedView
      viewName="getAssetsWithMeta"
      getQuery={getQuery}
      sortKey="view-category"
      sortOptions={[
        {
          label: 'Submission date',
          fieldName: AssetFieldNames.createdAt
        },
        {
          label: 'Title',
          fieldName: AssetFieldNames.title
        }
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
