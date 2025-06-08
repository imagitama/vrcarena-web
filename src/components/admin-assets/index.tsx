import React, { useState, useCallback } from 'react'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import { makeStyles } from '@material-ui/styles'
import CheckIcon from '@material-ui/icons/Check'
import EditIcon from '@material-ui/icons/Edit'
import FilterListIcon from '@material-ui/icons/FilterList'

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
import defaultThumbnailUrl from '../../assets/images/default-thumbnail.webp'
import { colorPalette } from '../../config'

import Button from '../button'
import PaginatedView from '../paginated-view'
import EditorRecordManager from '../editor-record-manager'
import TextInput from '../text-input'
import FormattedDate from '../formatted-date'
import AssetOverview from '../asset-overview'
import useStorage from '../../hooks/useStorage'
import AssetEditorWithSync from '../asset-editor-with-sync'
import { GetQuery } from '../../data-store'

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

const AssetApprovalChecklistItem = ({
  label,
  isValid,
  isNotImportant,
  validLabel,
  url,
}: {
  label: string
  isValid: boolean
  isNotImportant?: boolean
  validLabel?: string
  url?: string
}) => {
  const classes = useStyles()
  return (
    <li>
      {label}:{' '}
      {isValid ? (
        <>
          <span className={classes.pass}>{validLabel || 'Pass'}</span>{' '}
          {url ? (
            <a href={url} target="_blank" rel="noopener noreferrer">
              Link
            </a>
          ) : null}
        </>
      ) : (
        <span
          className={`${classes.fail} ${
            isNotImportant ? classes.notImportant : ''
          }`}>
          Fail
        </span>
      )}
    </li>
  )
}

function AssetsTable({
  assets,
  hydrate,
}: {
  assets?: FullAsset[]
  hydrate?: () => void
}) {
  return (
    <Paper>
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
                title,
                author,
                authorname,
                description,
                category,
                tags,
                thumbnailurl,
                editornotes,
                approvalstatus,
                publishstatus,
                accessstatus,
                species,
                speciesnames,
                publishedat,
                sourceurl,
              } = asset
              return (
                <TableRow key={id}>
                  <TableCell>
                    <AssetResultsItem asset={asset} />
                    {publishedat ? (
                      <>
                        Published <FormattedDate date={publishedat} />
                      </>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <ul>
                      <AssetApprovalChecklistItem
                        label="Source"
                        isValid={
                          typeof sourceurl === 'string' && sourceurl !== ''
                        }
                        validLabel={'Set'}
                        url={
                          typeof sourceurl === 'string' && sourceurl !== ''
                            ? sourceurl
                            : ''
                        }
                      />
                      <AssetApprovalChecklistItem
                        label="Thumbnail"
                        isValid={
                          typeof thumbnailurl === 'string' &&
                          thumbnailurl !== '' &&
                          thumbnailurl !== defaultThumbnailUrl
                        }
                        validLabel={'Set'}
                      />
                      <AssetApprovalChecklistItem
                        label="Title"
                        isValid={
                          typeof title === 'string' &&
                          title !== 'My draft asset'
                        }
                        validLabel="Set"
                      />
                      <AssetApprovalChecklistItem
                        label="Author"
                        isValid={typeof author === 'string' && author !== ''}
                        validLabel={`Set: ${authorname}`}
                      />
                      <AssetApprovalChecklistItem
                        label="Category"
                        isValid={
                          typeof category === 'string' &&
                          (category as string) !== ''
                        }
                        validLabel={category}
                      />
                      <AssetApprovalChecklistItem
                        label="Description"
                        isValid={
                          typeof description === 'string' && description !== ''
                        }
                        validLabel={
                          description ? `Length: ${description.length}` : ''
                        }
                      />
                      <AssetApprovalChecklistItem
                        label="Tags"
                        isValid={Array.isArray(tags) && tags.length > 0}
                        validLabel={tags ? `${tags.length} tags` : ''}
                      />
                      {category === AssetCategory.Avatar && (
                        <AssetApprovalChecklistItem
                          label="Species"
                          isValid={Array.isArray(species) && species.length > 0}
                          isNotImportant
                          validLabel={
                            speciesnames && speciesnames.length
                              ? speciesnames.join(', ')
                              : ''
                          }
                        />
                      )}
                    </ul>
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
    </Paper>
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

  return (
    <>
      <AssetsTable assets={items} hydrate={hydrate} />
    </>
  )
}

enum SubView {
  Pending = 'pending',
  Deleted = 'deleted',
  Declined = 'declined',
  Approved = 'approved',
  Archived = 'archived',
}

enum StorageKeys {
  View = 'admin-assets-view',
  SubView = 'admin-assets-subview',
}

const analyticsCategoryName = 'AdminAssets'

const UserIdFilter = ({ onChange }: { onChange: (userId: string) => void }) => {
  const [val, setVal] = useState('')
  return (
    <>
      <TextInput
        onChange={(e) => setVal(e.target.value)}
        value={val}
        placeholder="Filter by user ID"
        size="small"
      />
      <Button
        onClick={() => onChange(val)}
        icon={<FilterListIcon />}
        color="default"
        size="small"
      />
    </>
  )
}

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
              color={'default'}
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

const AdminAssets = () => {
  const [selectedView, setSelectedView] = useStorage(
    StorageKeys.View,
    View.List
  )
  const [selectedSubView, setSelectedSubView] = useStorage(
    StorageKeys.SubView,
    SubView.Pending
  )
  const [userIdToFilter, setUserIdToFilter] = useState('')
  const getQuery = useCallback(
    (query: GetQuery<FullAsset>): GetQuery<FullAsset> => {
      if (userIdToFilter) {
        query = query.eq('createdby', userIdToFilter)
      }

      switch (selectedSubView) {
        case SubView.Pending:
          query = query
            .eq('publishstatus', PublishStatus.Published)
            .eq('approvalstatus', ApprovalStatus.Waiting)
            .eq('accessstatus', AccessStatus.Public)
          break

        case SubView.Deleted:
          query = query.eq('accessstatus', AccessStatus.Deleted)
          break

        case SubView.Archived:
          query = query.eq('accessstatus', AccessStatus.Archived)
          break

        case SubView.Approved:
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
    [userIdToFilter, selectedSubView, selectedView] // subscribe to selectedView as queue does not hydrate anything
  )

  const toggleSubView = (subView: SubView) =>
    setSelectedSubView(selectedSubView === subView ? SubView.Pending : subView)

  return (
    <PaginatedView<FullAsset>
      viewName={ViewNames.GetFullAssets}
      getQuery={getQuery}
      // cannot re-use other paginated views because "publishedat" field does not exist for them
      sortKey="view-admin-assets"
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
          color="default"
          size="small">
          Queue Mode
        </Button>,
      ]}
      extraControls={[
        <Button
          icon={
            selectedSubView === SubView.Pending ? (
              <CheckBoxIcon />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )
          }
          onClick={() => {
            setSelectedSubView(SubView.Pending)
            trackAction(analyticsCategoryName, 'Click on view pending assets')
          }}
          color="default"
          size="small">
          Pending
        </Button>,
        <Button
          icon={
            selectedSubView === SubView.Approved ? (
              <CheckBoxIcon />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )
          }
          onClick={() => {
            setSelectedSubView(SubView.Approved)
            trackAction(analyticsCategoryName, 'Click on view approved assets')
          }}
          color="default"
          size="small">
          Approved
        </Button>,
        <Button
          icon={
            selectedSubView === SubView.Declined ? (
              <CheckBoxIcon />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )
          }
          onClick={() => {
            setSelectedSubView(SubView.Declined)
            trackAction(analyticsCategoryName, 'Click on view declined assets')
          }}
          color="default"
          size="small">
          Declined
        </Button>,
        <Button
          icon={
            selectedSubView === SubView.Deleted ? (
              <CheckBoxIcon />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )
          }
          onClick={() => {
            toggleSubView(SubView.Deleted)
            trackAction(analyticsCategoryName, 'Click on view deleted assets')
          }}
          color="default"
          size="small">
          Deleted
        </Button>,
        <Button
          icon={
            selectedSubView === SubView.Archived ? (
              <CheckBoxIcon />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )
          }
          onClick={() => {
            toggleSubView(SubView.Archived)
            trackAction(analyticsCategoryName, 'Click on view archived assets')
          }}
          color="default"
          size="small">
          Archived
        </Button>,
        <UserIdFilter onChange={(newVal) => setUserIdToFilter(newVal)} />,
      ]}>
      <Renderer selectedView={selectedView} />
    </PaginatedView>
  )
}

export default AdminAssets
