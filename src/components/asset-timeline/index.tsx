import React, { useState } from 'react'
import Timeline from '@material-ui/lab/Timeline'
import TimelineItem from '@material-ui/lab/TimelineItem'
import TimelineSeparator from '@material-ui/lab/TimelineSeparator'
import TimelineConnector from '@material-ui/lab/TimelineConnector'
import TimelineContent from '@material-ui/lab/TimelineContent'
import TimelineDot from '@material-ui/lab/TimelineDot'
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'

import {
  CollectionNames as CommentsCollectionNames,
  CommentsMetaFieldNames,
} from '../../modules/comments'
import { createMessage, editMessage, HistoryEntry } from '../../modules/history'
import {
  Asset,
  CollectionNames as AssetsCollectionNames,
} from '../../modules/assets'
import {
  ApprovalStatuses,
  AssetMetaFieldNames,
  UserMetaFieldNames,
} from '../../hooks/useDatabaseQuery'
import {
  AmendmentsMetaFieldNames,
  CollectionNames as AmendmentsCollectionNames,
} from '../../modules/amendments'
import { CollectionNames as UsersCollectionNames } from '../../modules/users'
import {
  CollectionNames as ReportsCollectionNames,
  ReportMetaFieldNames,
  ResolutionStatus,
} from '../../modules/reports'
import { CollectionNames as AuthorsCollectionNames } from '../../modules/authors'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import LoadingIndicator from '../loading-indicator'
import FormattedDate from '../formatted-date'
import Avatar, { sizes } from '../avatar'
import UsernameLink from '../username-link'
import ErrorMessage from '../error-message'
import Button from '../button'
import {
  AccessStatus,
  ApprovalStatus,
  MetaRecord,
  PublishStatus,
} from '../../modules/common'
import { BanStatus } from '../../modules/users'
import assetEditableFields from '../../editable-fields/assets'
import { fieldTypes } from '../../generic-forms'
import TagChips from '../tag-chips'
import { EditableField } from '../../editable-fields'
import Markdown from '../markdown'

enum Positivity {
  Positive = 'positive',
  Negative = 'negative',
  Neutral = 'neutral',
}

enum TimelineEventType {
  History = 'HISTORY', // todo: all lowercase?
}

interface TimelineEvent<T> {
  id: string
  date: Date
  type: TimelineEventType
  message: string
  userid: string
  username: string
  avatarurl: string
  positivity: Positivity
  originalrecord: T
}

interface TimelineData extends Record<string, unknown> {
  id: string // asset id
  assethistory: TimelineEvent<HistoryEntry>[]
  assetmetahistory: TimelineEvent<HistoryEntry>[]
}

const useStyles = makeStyles({
  positive: {
    backgroundColor: 'green',
  },
  negative: {
    backgroundColor: 'red',
  },
  neutral: {},
  expander: {
    paddingLeft: '0.25rem',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    '& svg': {
      opacity: 0.5,
    },
  },
  // override material
  oppositeContent: {
    marginTop: '-5px',
  },
  content: {
    marginTop: '-5px',
  },
  // more
  cols: {
    display: 'flex',
    '& > *': {
      display: 'flex',
      alignItems: 'center',
    },
    '& > :first-child': {
      marginRight: '0.25rem',
      textAlign: 'center',
    },
    '& > :last-child > span': {
      display: 'flex',
      alignItems: 'center',
    },
  },
  expandedData: {
    marginTop: '0.5rem',
  },
})

const getLabelForApprovalStatus = (approvalStatus: ApprovalStatus): string => {
  switch (approvalStatus) {
    case ApprovalStatus.Approved:
      return 'approved'
    case ApprovalStatus.Declined:
      return 'declined'
    case ApprovalStatus.Waiting:
      return 'reverted back to waiting'
    default:
      throw new Error(`Unknown approval status: ${approvalStatus}`)
  }
}

const getLabelForAccessStatus = (accessStatus: AccessStatus): string => {
  switch (accessStatus) {
    case AccessStatus.Deleted:
      return 'moved to trash'
    case AccessStatus.Public:
      return 'moved out of trash'
    default:
      throw new Error(`Unknown access status: ${accessStatus}`)
  }
}

const getLabelForPublishStatus = (publishStatus: PublishStatus): string => {
  switch (publishStatus) {
    case PublishStatus.Draft:
      return 'moved back to draft'
    case PublishStatus.Published:
      return 'published for approval'
    default:
      throw new Error(`Unknown publish status: ${publishStatus}`)
  }
}

const getLabelForBanStatus = (banStatus: BanStatus): string => {
  switch (banStatus) {
    case BanStatus.Banned:
      return 'banned'
    case BanStatus.Unbanned:
      return 'unbanned'
    default:
      throw new Error(`Unknown publish status: ${banStatus}`)
  }
}

const getLabelForResolutionStatus = (
  resolutionStatus: ResolutionStatus
): string => {
  switch (resolutionStatus) {
    case ResolutionStatus.Pending:
      return 'unresolved'
    case ResolutionStatus.Resolved:
      return 'resolved'
    default:
      throw new Error(`Unknown publish status: ${resolutionStatus}`)
  }
}

const getLabelForAssetField = (
  fieldName: Extract<keyof Asset, string>
): string => {
  const editableField = assetEditableFields.find(
    (editableField) => editableField.name === fieldName
  )

  if (editableField) {
    return editableField.label!
  }

  return fieldName
}

const LabelForEntry = ({
  entry: { message, data, parent, parenttable, createdby },
}: {
  entry: HistoryEntry
}) => {
  const changesWithoutMetafields: Partial<Asset> = data.changes
    ? Object.entries(data.changes).reduce(
        (newChanges, [fieldName, newValue]) =>
          fieldName !== 'lastmodifiedat' &&
          fieldName !== 'lastmodifiedby' &&
          fieldName !== 'ts'
            ? {
                ...newChanges,
                [fieldName]: newValue,
              }
            : newChanges,
        {}
      )
    : {}

  switch (message) {
    case createMessage:
      switch (parenttable) {
        case CommentsCollectionNames.Comments:
          return <>commented on</>
        case AssetsCollectionNames.Assets:
          return <>created the asset</>
        default:
          return (
            <>
              Unsupported create - parent "{parenttable} - {parent}"
            </>
          )
      }
    case editMessage:
      switch (parenttable) {
        case AssetsCollectionNames.Assets:
          return (
            <>
              changed{' '}
              {Object.keys(changesWithoutMetafields)
                .map((fieldName) =>
                  getLabelForAssetField(
                    fieldName as Extract<keyof Asset, string>
                  )
                )
                .join(', ')}
            </>
          )
        case AssetsCollectionNames.AssetsMeta:
          if (data.changes[AssetMetaFieldNames.approvalStatus]) {
            return (
              <>
                {getLabelForApprovalStatus(
                  data.changes[AssetMetaFieldNames.approvalStatus]
                )}
              </>
            )
          } else if (data.changes[AssetMetaFieldNames.accessStatus]) {
            return (
              <>
                {getLabelForAccessStatus(
                  data.changes[AssetMetaFieldNames.accessStatus]
                )}
              </>
            )
          } else if (data.changes[AssetMetaFieldNames.publishStatus]) {
            return (
              <>
                {getLabelForPublishStatus(
                  data.changes[AssetMetaFieldNames.publishStatus]
                )}
              </>
            )
          } else if (data.changes[AssetMetaFieldNames.editorNotes]) {
            return <>changed editor notes for asset</>
          } else {
            return null
          }
        case AmendmentsCollectionNames.AmendmentsMeta:
          if (data.changes[AmendmentsMetaFieldNames.approvalstatus]) {
            return (
              <>
                {AmendmentsMetaFieldNames.approvalstatus ===
                ApprovalStatuses.Approved
                  ? 'applied'
                  : getLabelForApprovalStatus(
                      data.changes[AmendmentsMetaFieldNames.approvalstatus]
                    )}
              </>
            )
          } else if (data.changes[AmendmentsMetaFieldNames.editornotes]) {
            return <>changed editor notes for amendment</>
          }
        case UsersCollectionNames.Users:
          if (parent !== createdby) {
            return (
              <>changed {Object.keys(changesWithoutMetafields).length} fields</>
            )
          }
        case UsersCollectionNames.UsersMeta:
          if (data.changes[UserMetaFieldNames.banStatus]) {
            return (
              <>
                {getLabelForBanStatus(
                  data.changes[UserMetaFieldNames.banStatus]
                )}{' '}
                user
              </>
            )
          }
        case AuthorsCollectionNames.Authors:
          return <>edited author</>
        case ReportsCollectionNames.ReportsMeta:
          if (data.changes[ReportMetaFieldNames.resolutionstatus]) {
            return (
              <>
                {getLabelForResolutionStatus(
                  data.changes[ReportMetaFieldNames.resolutionstatus]
                )}{' '}
                report
              </>
            )
          } else if (data.changes[ReportMetaFieldNames.resolutionnotes]) {
            return <>changed the resolution notes</>
          } else if (data.changes[ReportMetaFieldNames.editornotes]) {
            return <>changed editor notes for report</>
          } else {
            return (
              <>changed {Object.keys(changesWithoutMetafields).join(', ')}</>
            )
          }
        case CommentsCollectionNames.CommentsMeta:
          if (data.changes[CommentsMetaFieldNames.accessStatus]) {
            return (
              <>
                {getLabelForAccessStatus(
                  data.changes[CommentsMetaFieldNames.accessStatus]
                )}{' '}
                comment
              </>
            )
          } else {
            return (
              <>changed {Object.keys(changesWithoutMetafields).join(', ')}</>
            )
          }
      }
  }

  return (
    <>
      Unknown message "{parenttable}/{parent}" - "{message}"<br />
      <textarea>{JSON.stringify(data, null, '  ')}</textarea>
    </>
  )
}

const getExpandedDataForJson = (event: TimelineEvent<any>): any => {
  if (event.type === TimelineEventType.History) {
    return pruneInternalFields(event.originalrecord.data)
  }

  return null
}

const pruneInternalFields = (record: any): any =>
  Object.entries(record).reduce(
    (newChanges, [fieldName, newValue]) =>
      fieldName !== 'lastmodifiedat' &&
      fieldName !== 'lastmodifiedby' &&
      fieldName !== 'ts'
        ? {
            ...newChanges,
            [fieldName]: newValue,
          }
        : newChanges,
    {}
  )

const getExpandedDataForPretty = (event: TimelineEvent<any>): PrettyField[] => {
  if (event.type === TimelineEventType.History) {
    const data = event.originalrecord.data

    if (data.changes) {
      return Object.entries(pruneInternalFields(data.changes)).map(
        ([fieldName, newValue]) => {
          const editableField = assetEditableFields.find(
            (editableField) => editableField.name === fieldName
          )

          if (!editableField) {
            console.warn(
              `Could not find editable field for field "${fieldName}"`
            )
            return {
              name: fieldName,
              label: fieldName,
              type: fieldTypes.text,
              value: newValue,
            }
          }

          return {
            ...editableField,
            value: newValue,
          }
        }
      )
    }
  }

  return []
}

interface PrettyField extends EditableField<any> {
  value: any
}

const PrettyExpandedData = ({ data }: { data: PrettyField[] }) => {
  return (
    <>
      {data.map((prettyField) => {
        switch (prettyField.type) {
          case fieldTypes.imageUpload:
            return <img src={prettyField.value} height="200" />
          case fieldTypes.text:
            return prettyField.value
          case fieldTypes.tags:
            return <TagChips tags={prettyField.value} />
          case fieldTypes.textMarkdown:
            return <Markdown source={prettyField.value} />
          default:
            return JSON.stringify(prettyField.value, null, '  ')
        }
      })}
    </>
  )
}

const AssetTimelineItem = ({
  event,
  isForceExpanded,
  isLast,
}: {
  event: TimelineEvent<any>
  isForceExpanded: boolean
  isLast: boolean
}) => {
  const classes = useStyles()
  const [isExpanded, setIsExpanded] = useState(false)

  const isActuallyExpanded = isForceExpanded || isExpanded

  return (
    <TimelineItem>
      <TimelineOppositeContent className={classes.oppositeContent}>
        <Typography color="textSecondary">
          <FormattedDate date={event.date} />
        </Typography>
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot
          className={
            event.positivity === Positivity.Positive
              ? classes.positive
              : event.positivity === Positivity.Negative
              ? classes.negative
              : classes.neutral
          }
        />
        {isLast ? null : <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent className={classes.content}>
        <div className={classes.cols}>
          <div>
            <UsernameLink id={event.userid}>
              <Avatar
                url={event.avatarurl}
                username={event.username}
                size={sizes.EXTRATINY}
              />
            </UsernameLink>
          </div>
          <div>
            <span
              onClick={() => setIsExpanded((currentVal) => !currentVal)}
              className={classes.expander}>
              {event.username || '(no name)'}{' '}
              <LabelForEntry entry={event.originalrecord} />{' '}
              {isActuallyExpanded ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )}
            </span>
          </div>
        </div>
        <div>
          {isActuallyExpanded ? (
            <div className={classes.expandedData}>
              <PrettyExpandedData data={getExpandedDataForPretty(event)} />
              {/* <pre>
                {JSON.stringify(getExpandedDataForJson(event), null, '  ')}
              </pre> */}
            </div>
          ) : null}
        </div>
      </TimelineContent>
    </TimelineItem>
  )
}

const getPositivity = (event: TimelineEvent<any>): Positivity => {
  if (event.type === TimelineEventType.History) {
    const historyEntry = event.originalrecord as HistoryEntry
    const changes = historyEntry.data.changes as MetaRecord

    if (historyEntry.message === createMessage) {
      return Positivity.Positive
    }

    if (changes) {
      switch (changes.publishstatus) {
        case PublishStatus.Published:
          return Positivity.Positive
        case PublishStatus.Draft:
          return Positivity.Neutral
        default:
      }

      switch (changes.accessstatus) {
        case AccessStatus.Archived:
        case AccessStatus.Deleted:
          return Positivity.Negative
        case AccessStatus.Public:
          return Positivity.Positive
        default:
      }

      switch (changes.approvalstatus) {
        case ApprovalStatus.Declined:
          return Positivity.Negative
        case ApprovalStatus.Approved:
          return Positivity.Positive
        default:
      }
    }
  }

  return Positivity.Neutral
}

const assignPositivity = (event: TimelineEvent<any>): TimelineEvent<any> => ({
  ...event,
  positivity: getPositivity(event),
})

const AssetTimeline = ({ assetId }: { assetId: string }) => {
  const [isLoading, lastErrorCode, timelineData] =
    useDataStoreItem<TimelineData>('getassettimeline', assetId)
  const [isForceExpanded, setIsForceExpanded] = useState(false)

  if (isLoading || !timelineData) {
    return <LoadingIndicator message="Loading timeline..." />
  }

  if (lastErrorCode) {
    return <ErrorMessage>Failed to load timeline</ErrorMessage>
  }

  const events = timelineData.assethistory
    .concat(timelineData.assetmetahistory)
    .map((timelineEvent) => ({
      ...timelineEvent,
      date: new Date(timelineEvent.date),
    }))
    .map(assignPositivity)
    .sort((eventA, eventB) => eventB.date.getTime() - eventA.date.getTime())

  return (
    <>
      <Button onClick={() => setIsForceExpanded((currentVal) => !currentVal)}>
        Expand All
      </Button>
      <Timeline>
        {events.map((event, idx) => (
          <AssetTimelineItem
            key={event.id}
            event={event}
            isForceExpanded={isForceExpanded}
            isLast={idx === events.length - 1}
          />
        ))}
      </Timeline>
    </>
  )
}

export default AssetTimeline
