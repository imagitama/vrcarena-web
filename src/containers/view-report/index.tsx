import React from 'react'
import { Helmet } from '@unhead/react/helmet'
import { useParams } from 'react-router'

import * as routes from '@/routes'
import { CollectionNames, FullReport, ViewNames } from '@/modules/reports'

import useDataStoreItem from '@/hooks/useDataStoreItem'
import useIsLoggedIn from '@/hooks/useIsLoggedIn'

import NoResultsMessage from '@/components/no-results-message'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import NoPermissionMessage from '@/components/no-permission-message'
import ResolvableItem from '@/components/resolvable-item'

const View = () => {
  const { reportId } = useParams<{ reportId: string }>()
  const isLoggedIn = useIsLoggedIn()

  const [isLoading, lastErrorCode, report, hydrate] =
    useDataStoreItem<FullReport>(
      ViewNames.GetFullReports,
      isLoggedIn ? reportId : false,
      { queryName: 'view-report' }
    )

  if (!isLoggedIn) {
    return <NoPermissionMessage />
  }

  if (isLoading) {
    return <LoadingIndicator message="Loading report..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load report (code {lastErrorCode})</ErrorMessage>
    )
  }

  if (!report) {
    return <NoResultsMessage>Report not found</NoResultsMessage>
  }

  return (
    <ResolvableItem
      collectionName={CollectionNames.Reports}
      metaCollectionName={CollectionNames.ReportsMeta}
      title="Report"
      item={{
        ...report,
        category: report.reason,
        relateddata: report.parentdata,
        relatedid: report.parent,
        relatedtable: report.parenttable,
      }}
      url={routes.viewReportWithVar.replace(':reportId', reportId)}
      hydrate={hydrate}
    />
  )
}

export default () => (
  <>
    <Helmet>
      <title>View a report</title>
      <meta
        name="description"
        content="Read more information about a report on the site."
      />
    </Helmet>
    <View />
  </>
)
