import React, { useState, useCallback } from 'react'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { makeStyles } from '@material-ui/core/styles'

import {
  AssetFieldNames,
  AssetMetaFieldNames,
  PublishStatuses,
  ApprovalStatuses,
  AccessStatuses,
  CollectionNames
} from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import { FullAsset } from '../../modules/assets'
import AssetResultsItem from '../../components/asset-results-item'
import defaultThumbnailUrl from '../../assets/images/default-thumbnail.webp'

import Button from '../button'
import PaginatedView from '../paginated-view'
import EditorRecordManager from '../editor-record-manager'
import TextInput from '../text-input'
import FormattedDate from '../formatted-date'
import { colorPalette } from '../../config'
import Link from '../link'

const useStyles = makeStyles({
  pass: {
    color: colorPalette.positive
  },
  fail: {
    color: colorPalette.negative
  },
  notImportant: {
    color: 'rgba(255, 0, 0, 0.5)'
  }
})

const AssetApprovalChecklistItem = ({
  label,
  isValid,
  isNotImportant,
  validLabel,
  url
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
          {url ? <Link to={url}>Link</Link> : null}
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
  hydrate
}: {
  assets?: FullAsset[]
  hydrate?: () => void
}) {
  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Asset</TableCell>
            <TableCell />
            <TableCell>Controls</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assets ? (
            assets.map(asset => {
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
                sourceurl
              } = asset
              return (
                <TableRow key={id}>
                  <TableCell>
                    <AssetResultsItem asset={asset} isLandscape showCategory />
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
                          typeof category === 'string' && category !== ''
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
                    </ul>
                  </TableCell>
                  <TableCell>
                    <EditorRecordManager
                      id={id}
                      collectionName={CollectionNames.Assets}
                      metaCollectionName={CollectionNames.AssetMeta}
                      existingApprovalStatus={approvalstatus}
                      existingPublishStatus={publishstatus}
                      existingAccessStatus={accessstatus}
                      existingEditorNotes={editornotes}
                      // @ts-ignore
                      onDone={hydrate ? () => hydrate() : undefined}
                      callOnDoneOnEditorNotes={false}
                      allowDeclineOptions={true}
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

const Renderer = ({
  items,
  hydrate
}: {
  items?: FullAsset[]
  hydrate?: () => void
}) => <AssetsTable assets={items} hydrate={hydrate} />

const subViews = {
  PENDING: 0,
  DELETED: 1
}

const analyticsCategoryName = 'AdminAssets'

const UserIdFilter = ({ onChange }: { onChange: (userId: string) => void }) => {
  const [val, setVal] = useState('')
  return (
    <>
      <TextInput
        onChange={e => setVal(e.target.value)}
        value={val}
        placeholder="User ID"
        size="small"
      />
      <Button onClick={() => onChange(val)}>Apply</Button>
    </>
  )
}

export default () => {
  const [selectedSubView, setSelectedSubView] = useState(subViews.PENDING)
  const [userIdToFilter, setUserIdToFilter] = useState('')
  const getQuery = useCallback(
    query => {
      if (userIdToFilter) {
        query = query.eq(AssetFieldNames.createdBy, userIdToFilter)
      }

      switch (selectedSubView) {
        case subViews.PENDING:
          query = query
            .eq(AssetMetaFieldNames.publishStatus, PublishStatuses.Published)
            .eq(AssetMetaFieldNames.approvalStatus, ApprovalStatuses.Waiting)
            .eq(AssetMetaFieldNames.accessStatus, AccessStatuses.Public)
          break

        case subViews.DELETED:
          query = query.eq(
            AssetMetaFieldNames.accessStatus,
            AccessStatuses.Deleted
          )
          break

        case subViews.DELETED:
          query = query.eq(
            AssetMetaFieldNames.accessStatus,
            AccessStatuses.Deleted
          )
      }

      return query
    },
    [userIdToFilter, selectedSubView]
  )

  const toggleSubView = (subView: number) =>
    setSelectedSubView(currentVal => {
      if (currentVal === subView) {
        return subViews.PENDING
      }
      return subView
    })

  return (
    <PaginatedView
      viewName="getFullAssets"
      // @ts-ignore
      getQuery={getQuery}
      // cannot re-use other paginated views because "publishedat" field does not exist for them
      sortKey="view-admin-assets"
      sortOptions={[
        {
          label: 'Publish date',
          fieldName: AssetMetaFieldNames.publishedAt
        },
        {
          label: 'Submission date',
          fieldName: AssetFieldNames.createdAt
        },
        {
          label: 'Title',
          fieldName: AssetFieldNames.title
        }
      ]}
      defaultFieldName={AssetMetaFieldNames.publishedAt}
      urlWithPageNumberVar={routes.adminWithTabNameVarAndPageNumberVar.replace(
        ':tabName',
        'assets'
      )}
      extraControls={[
        <Button
          icon={
            selectedSubView === subViews.PENDING ? (
              <CheckBoxIcon />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )
          }
          onClick={() => {
            setSelectedSubView(subViews.PENDING)
            trackAction(analyticsCategoryName, 'Click on view pending assets')
          }}
          color="default">
          Pending
        </Button>,
        <Button
          icon={
            selectedSubView === subViews.DELETED ? (
              <CheckBoxIcon />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )
          }
          onClick={() => {
            toggleSubView(subViews.DELETED)
            trackAction(analyticsCategoryName, 'Click on view deleted assets')
          }}
          color="default">
          Deleted
        </Button>,
        <UserIdFilter onChange={newVal => setUserIdToFilter(newVal)} />
      ]}>
      <Renderer />
    </PaginatedView>
  )
}
