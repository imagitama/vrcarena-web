import React, { useState } from 'react'
import Timeline from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'
import Typography from '@mui/material/Typography'
import { makeStyles } from '@mui/styles'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

import {
  AccessStatus,
  ApprovalStatus,
  MetaRecord,
  PublishStatus,
  StatusChange,
  StatusChanges,
} from '@/modules/common'
import assetEditableFields from '@/editable-fields/assets'
import { fieldTypes } from '@/generic-forms'
import { EditableFieldBase } from '@/editable-fields'
import { Message, HistoryEntry, HistoryEntryChanges } from '@/modules/history'
import { ViewNames } from '@/modules/assets'

import useDataStoreItem from '@/hooks/useDataStoreItem'

import LoadingIndicator from '@/components/loading-indicator'
import FormattedDate from '@/components/formatted-date'
import Avatar, { AvatarSize } from '@/components/avatar'
import UsernameLink from '@/components/username-link'
import ErrorMessage from '@/components/error-message'
import Button from '@/components/button'
import Markdown from '@/components/markdown'
import TagChips from '@/components/tag-chips'
import HistoryEntryLabel from '@/components/history-entry-label'
import { colorPalette } from '@/config'
import { StatusChangeLabel } from '../status-changes'

enum Positivity {
  Positive = 'positive',
  Negative = 'negative',
  Neutral = 'neutral',
}

enum TimelineEventType {
  History = 'HISTORY', // todo: all lowercase?
  StatusChange = 'STATUS_CHANGE',
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
    '&&': {
      backgroundColor: 'rgb(0, 255, 0)',
    },
  },
  negative: {
    '&&': {
      backgroundColor: 'rgb(255, 0, 0)',
    },
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

interface PrettyField extends EditableFieldBase<any> {
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

const DEFAULT_USERNAME = 'System'

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
                size={AvatarSize.ExtraTiny}
              />
            </UsernameLink>
          </div>
          <div>
            <span
              onClick={() => setIsExpanded((currentVal) => !currentVal)}
              className={classes.expander}>
              {event.username || DEFAULT_USERNAME}{' '}
              {event.type === TimelineEventType.History ? (
                <HistoryEntryLabel entry={event.originalrecord} />
              ) : (
                <StatusChangeLabel
                  fieldName={event.originalrecord.fieldName}
                  statusChange={event.originalrecord.statusChange}
                />
              )}{' '}
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
    const changes =
      'changes' in historyEntry.data
        ? (historyEntry.data.changes as MetaRecord)
        : null

    if (historyEntry.message === Message.Create) {
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

interface StatusChangeWithFieldName {
  fieldName: string
  statusChange: StatusChange
}

const getPositivityForStatusChange = (
  fieldName: string,
  statusChange: StatusChange
): Positivity => {
  switch (fieldName) {
    case 'approvalstatus':
      switch (statusChange.value) {
        case ApprovalStatus.Approved:
        case ApprovalStatus.AutoApproved:
          return Positivity.Positive
        case ApprovalStatus.Declined:
        case ApprovalStatus.Quarantined:
          return Positivity.Negative
      }
  }

  return Positivity.Neutral
}

const mapStatusChangesToTimelineEvents = (
  statusChanges: StatusChanges
): TimelineEvent<StatusChangeWithFieldName>[] => {
  return Object.entries(statusChanges)
    .filter(([, change]) => change.createdat)
    .map(([fieldName, change]) => ({
      id: `${fieldName}-${change.createdat}`,
      date: new Date(change.createdat as string),
      type: TimelineEventType.StatusChange,
      message: `${change.username ?? 'Someone'} changed ${fieldName} to "${
        change.value
      }"`,
      userid: change.userid ?? '',
      username: change.username ?? '',
      avatarurl: change.avatarurl ?? '',
      positivity: getPositivityForStatusChange(fieldName, change),
      originalrecord: {
        fieldName,
        statusChange: change,
      },
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

const assignPositivity = (event: TimelineEvent<any>): TimelineEvent<any> => ({
  ...event,
  positivity: getPositivity(event),
})

type AnyTimelineEvent = TimelineEvent<
  HistoryEntry<any> | StatusChangeWithFieldName
>

const filterOldApprovedAtCols = (
  event: TimelineEvent<HistoryEntry<any>>
): boolean => {
  if (!(event.originalrecord.data as HistoryEntryChanges).changes) return true

  if (
    'accessstatus' in (event.originalrecord.data as HistoryEntryChanges).changes
  )
    return false
  if (
    'publishstatus' in
    (event.originalrecord.data as HistoryEntryChanges).changes
  )
    return false
  if (
    'approvalstatus' in
    (event.originalrecord.data as HistoryEntryChanges).changes
  )
    return false
  if (
    'approvedat' in (event.originalrecord.data as HistoryEntryChanges).changes
  )
    return false

  return true
}

const AssetTimeline = ({
  assetId,
  statusChanges,
}: {
  assetId: string
  statusChanges: StatusChanges | null
}) => {
  const [isLoading, lastErrorCode, timelineData] =
    useDataStoreItem<TimelineData>(ViewNames.GetAssetTimeline, assetId)
  const [isForceExpanded, setIsForceExpanded] = useState(false)

  if (isLoading || !timelineData) {
    return <LoadingIndicator message="Loading timeline..." />
  }

  if (lastErrorCode) {
    return (
      <ErrorMessage errorCode={lastErrorCode}>
        Failed to load timeline
      </ErrorMessage>
    )
  }

  const events: AnyTimelineEvent[] = ([] as AnyTimelineEvent[])
    .concat(timelineData.assethistory)
    // .concat(timelineData.assetmetahistory)
    .map((event) => ({
      ...event,
      date: new Date(event.date),
    }))
    .map(assignPositivity)
    .filter(filterOldApprovedAtCols)
    .concat(
      statusChanges ? mapStatusChangesToTimelineEvents(statusChanges) : []
    )
    .sort((eventA, eventB) => eventB.date.getTime() - eventA.date.getTime())

  return (
    <>
      <Button
        onClick={() => setIsForceExpanded((currentVal) => !currentVal)}
        color="secondary">
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
