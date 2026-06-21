import React, { useState, useCallback } from 'react'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { makeStyles } from '@mui/styles'
import CheckIcon from '@mui/icons-material/Check'

import { PublishStatus, ApprovalStatus, AccessStatus } from '@/modules/common'
import * as routes from '@/routes'
import { trackAction } from '@/analytics'
import {
  CollectionNames as AssetsCollectionNames,
  ViewNames,
  AssetForList_Editor,
} from '@/modules/assets'
import { EqualActiveFilter, FilterSubType, FilterType } from '@/filters'
import { colorPalette } from '@/config'
import {
  CollectionNames as AiEvaluateCollectionNames,
  AiEvaluateQueuedItem,
} from '@/modules/aievaluation'

import Button from '@/components/button'
import PaginatedView, { GetQueryFn } from '@/components/paginated-view'
import EditorRecordManager from '@/components/editor-record-manager'
import AssetOverview from '@/components/asset-overview'
import useStorage from '@/hooks/useStorage'
import QueuedAssetInfo from '@/components/queued-asset-info'
import AiEvaluationResult from '@/components/ai-evaluation-result'
import AssetResultsItem from '@/components/asset-results-item'
import ErrorBoundary from '@/components/error-boundary'
import AiArea from '../ai-area'
import { Intent } from '@/modules/aievaluation'
import AiResult from '../ai-result'

const useStyles = makeStyles({
  pass: {
    color: colorPalette.positive,
  },
  fail: {
    color: colorPalette.negative,
  },
  notImportant: {
    color: 'rgba(255, 0, 0, 0.5)',
  },
  queue: {
    marginTop: '1rem',
  },
  queueControls: {
    padding: '1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    '& > *': {
      margin: '0 0.25rem',
    },
  },
  assetButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      margin: '0 0.15rem',
    },
  },
})

function AssetsTable({
  assets,
  hydrate,
}: {
  assets?: AssetForList_Editor[]
  hydrate?: () => void
}) {
  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Asset ({assets ? assets.length : '-'})</TableCell>
            <TableCell />
            <TableCell>Controls</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assets ? (
            assets.map((asset) => {
              const {
                id,
                editornotes,
                approvalstatus,
                publishstatus,
                accessstatus,
              } = asset
              return (
                <TableRow key={id}>
                  <TableCell>
                    <AssetResultsItem asset={asset} showState />
                  </TableCell>
                  <TableCell>
                    <QueuedAssetInfo
                      asset={asset}
                      hydrate={hydrate}
                      showEditorControls={false}
                    />
                  </TableCell>
                  <TableCell>
                    <EditorRecordManager
                      id={id}
                      showStatuses
                      collectionName={AssetsCollectionNames.Assets}
                      metaCollectionName={AssetsCollectionNames.AssetsMeta}
                      existingApprovalStatus={approvalstatus}
                      existingPublishStatus={publishstatus}
                      existingAccessStatus={accessstatus}
                      existingEditorNotes={editornotes}
                      // @ts-ignore
                      onDone={hydrate ? () => hydrate() : undefined}
                      callOnDoneOnEditorNotes={false}
                    />
                    <ErrorBoundary>
                      <AiArea
                        title="Evaluation"
                        tooltip="The site has asked AI to evaluate the asset to determine if it can be auto-approved.">
                        <AiResult<AiEvaluateQueuedItem, AssetForList_Editor>
                          title="AI Evaluation"
                          renderer={AiEvaluationResult}
                          queueCollectionName={
                            AiEvaluateCollectionNames.AiEvaluateQueue
                          }
                          parentCollectionName={AssetsCollectionNames.Assets}
                          parentId={asset.id}
                          extraFields={{
                            intent: Intent.AutoApprove,
                          }}
                          mostRecentQueuedItem={
                            (asset as AssetForList_Editor).aievaluation
                          }
                        />
                      </AiArea>
                    </ErrorBoundary>
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell>Loading...</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  )
}

enum View {
  List = 'list',
  Queue = 'queue',
}

const Renderer = ({
  items,
  hydrate,
  selectedView,
  selectedSubView,
}: {
  items?: AssetForList_Editor[]
  hydrate?: () => void
  selectedView: View | null
  selectedSubView?: SubView | null
}) => {
  if (selectedView === View.Queue) {
    return <Queue assets={items} hydrate={hydrate!} />
  }

  return <AssetsTable assets={items} hydrate={hydrate} />
}

enum SubView {
  Approved = 'approved', // and auto
  Pending = 'pending',
  Deleted = 'deleted',
  Declined = 'declined',
  Visible = 'visible',
  Archived = 'archived',
}

enum StorageKeys {
  View = 'admin-assets-view',
  SubView = 'admin-assets-subview',
}

const analyticsCategoryName = 'AdminAssets'

const Queue = ({
  assets,
  hydrate,
}: {
  assets?: AssetForList_Editor[]
  hydrate: () => void
}) => {
  const [currentAssetId, setCurrentAssetId] = useState('')
  const classes = useStyles()

  if (!assets) {
    return null
  }

  const assetIds = assets.map((asset) => asset.id)
  const atStart = assetIds.indexOf(currentAssetId) === 0
  const atEnd = assetIds.indexOf(currentAssetId) === assetIds.length - 1

  const assetIdToDisplay = currentAssetId || assetIds[0]

  const onClickPrev = () =>
    setCurrentAssetId(assetIds[assetIds.indexOf(assetIdToDisplay) - 1])
  const onClickNext = () =>
    setCurrentAssetId(assetIds[assetIds.indexOf(assetIdToDisplay) + 1])

  return (
    <div className={classes.queue}>
      <div className={classes.queueControls}>
        <Button
          isDisabled={atStart}
          onClick={onClickPrev}
          icon={<ChevronLeftIcon />}
          switchIconSide>
          Previous Asset
        </Button>
        <div className={classes.assetButtons}>
          {assetIds.map((assetId, index) => (
            <Button
              key={assetId}
              color="secondary"
              onClick={() => setCurrentAssetId(assetId)}
              icon={assetIdToDisplay === assetId ? <CheckIcon /> : undefined}
              size="small">
              #{index + 1}
            </Button>
          ))}
        </div>
        <Button
          isDisabled={atEnd}
          onClick={onClickNext}
          icon={<ChevronRightIcon />}>
          Next Asset
        </Button>
      </div>
      <AssetOverview assetId={assetIdToDisplay} />
    </div>
  )
}

const filters = [
  {
    fieldName: 'createdby',
    type: FilterType.Equal,
    subType: FilterSubType.UserId,
    label: 'User',
  },
]

const AdminAssets = () => {
  const [selectedView, setSelectedView] = useStorage(
    StorageKeys.View,
    View.List
  )
  const getQuery = useCallback<
    GetQueryFn<AssetForList_Editor, SubView, typeof filters>
  >(
    (query, selectedSubView, activeFilters) => {
      const userIdFilter = activeFilters.find(
        (filter) => filter.fieldName === 'createdby'
      ) as EqualActiveFilter<AssetForList_Editor>

      if (userIdFilter && userIdFilter.value) {
        query = query.eq('createdby', userIdFilter.value)
      }

      switch (selectedSubView) {
        case SubView.Approved:
          query = query
            .or(
              `approvalstatus.eq.${ApprovalStatus.Approved},approvalstatus.eq.${ApprovalStatus.AutoApproved}`
            )
            .not('publishedat', 'is', null) // TODO: repair assets that don't have this
          break

        case SubView.Pending:
          query = query
            .eq('publishstatus', PublishStatus.Published)
            .eq('approvalstatus', ApprovalStatus.Waiting) // do not include autoapproved
            .eq('accessstatus', AccessStatus.Public)
          break

        case SubView.Deleted:
          query = query.eq('accessstatus', AccessStatus.Deleted)
          break

        case SubView.Archived:
          query = query.eq('accessstatus', AccessStatus.Archived)
          break

        case SubView.Visible:
          query = query
            .eq('publishstatus', PublishStatus.Published)
            .eq('approvalstatus', ApprovalStatus.Approved)
            .eq('accessstatus', AccessStatus.Public)
          break

        case SubView.Declined:
          query = query.eq('approvalstatus', ApprovalStatus.Declined)
          break

        default:
          query = query.neq('publishstatus', PublishStatus.Draft)
      }

      return query
    },
    [selectedView]
  )

  return (
    <>
      <PaginatedView<AssetForList_Editor>
        // cannot re-use other paginated views because "publishedat" field does not exist for them
        name="view-admin-assets"
        viewName={ViewNames.GetAssetsForList_Editor}
        getQuery={getQuery}
        sortOptions={[
          {
            label: 'Publish date',
            fieldName: 'publishedat',
          },
          {
            label: 'Submission date',
            fieldName: 'createdat',
          },
          {
            label: 'Title',
            fieldName: 'title',
          },
        ]}
        defaultFieldName={'publishedat'}
        urlWithPageNumberVar={routes.adminWithTabNameVarAndPageNumberVar.replace(
          ':tabName',
          'assets'
        )}
        subViews={[
          {
            id: SubView.Pending,
            label: 'Pending',
            defaultActive: true,
          },
          {
            id: SubView.Approved,
            label: 'Auto/Approved',
          },
          {
            id: SubView.Deleted,
            label: 'Deleted',
          },
          {
            id: SubView.Declined,
            label: 'Declined',
          },
          {
            id: SubView.Visible,
            label: 'Visible',
          },
          {
            id: SubView.Archived,
            label: 'Archived',
          },
        ]}
        filters={filters}
        extraControlsLeft={[
          <Button
            icon={
              selectedView === View.Queue ? (
                <CheckBoxIcon />
              ) : (
                <CheckBoxOutlineBlankIcon />
              )
            }
            onClick={() => {
              setSelectedView(
                selectedView === View.Queue ? View.List : View.Queue
              )
              trackAction(analyticsCategoryName, 'Click toggle view')
            }}
            color="secondary"
            size="small">
            Queue Mode
          </Button>,
        ]}>
        <Renderer selectedView={selectedView} />
      </PaginatedView>
    </>
  )
}

export default AdminAssets
