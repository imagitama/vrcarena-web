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
import EditIcon from '@mui/icons-material/Edit'

import {
  PublishStatus,
  ApprovalStatus,
  AccessStatus,
} from '../../modules/common'
import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import {
  FullAsset,
  CollectionNames as AssetsCollectionNames,
  AssetCategory,
  ViewNames,
} from '../../modules/assets'
import AssetResultsItem from '../../components/asset-results-item'
import { colorPalette } from '../../config'

import Button from '../button'
import PaginatedView, { GetQueryFn } from '../paginated-view'
import EditorRecordManager from '../editor-record-manager'
import AssetOverview from '../asset-overview'
import useStorage from '../../hooks/useStorage'
import AssetEditorWithSync from '../asset-editor-with-sync'
import { EqualActiveFilter, FilterSubType, FilterType } from '../../filters'
import QueuedAssetInfo from '../queued-asset-info'

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
  assets?: FullAsset[]
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
}: {
  items?: FullAsset[]
  hydrate?: () => void
  selectedView: View | null
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
  assets?: FullAsset[]
  hydrate: () => void
}) => {
  const [currentAssetId, setCurrentAssetId] = useState('')
  const [isEditing, setIsEditing] = useState(false)
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
          onClick={() => setIsEditing((currentVal) => !currentVal)}
          icon={<EditIcon />}>
          Toggle Edit
        </Button>
        <Button
          isDisabled={atEnd}
          onClick={onClickNext}
          icon={<ChevronRightIcon />}>
          Next Asset
        </Button>
      </div>
      {isEditing ? (
        <AssetEditorWithSync assetId={assetIdToDisplay} />
      ) : (
        <AssetOverview assetId={assetIdToDisplay} />
      )}
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
  const getQuery = useCallback<GetQueryFn<FullAsset, SubView, typeof filters>>(
    (query, selectedSubView, activeFilters) => {
      const userIdFilter = activeFilters.find(
        (filter) => filter.fieldName === 'createdby'
      ) as EqualActiveFilter<FullAsset>

      if (userIdFilter && userIdFilter.value) {
        query = query.eq('createdby', userIdFilter.value)
      }

      switch (selectedSubView) {
        case SubView.Approved:
          query = query.or(
            `approvalstatus.eq.${ApprovalStatus.Approved},approvalstatus.eq.${ApprovalStatus.AutoApproved}`
          )
          break

        case SubView.Pending:
          query = query
            .eq('publishstatus', PublishStatus.Published)
            .or(
              `approvalstatus.eq.${ApprovalStatus.Waiting},approvalstatus.eq.${ApprovalStatus.AutoApproved}`
            )
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
          query = query
            .eq('publishstatus', PublishStatus.Draft)
            .eq('approvalstatus', ApprovalStatus.Declined)
            .eq('accessstatus', AccessStatus.Public)
      }

      return query
    },
    [selectedView]
  )

  return (
    <PaginatedView<FullAsset>
      // cannot re-use other paginated views because "publishedat" field does not exist for them
      name="view-admin-assets"
      viewName={ViewNames.GetFullAssets}
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
  )
}

export default AdminAssets
