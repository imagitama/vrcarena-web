import React from 'react'
import { makeStyles } from '@mui/styles'
import InfoIcon from '@mui/icons-material/Info'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'

import {
  AiFieldSuggestions,
  AiSuggestConvo,
  AiSuggestQueuedItem,
  CollectionNames,
  FuncResult,
} from '@/modules/aisuggest'
import { QueueStatus } from '@/modules/common'
import {
  Asset,
  CollectionNames as AssetsCollectionNames,
} from '@/modules/assets'

import useDataStoreItemSync from '@/hooks/useDataStoreItemSync'

import NoResultsMessage from '../no-results-message'
import FormattedDate from '../formatted-date'
import StatusText from '../status-text'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import CopyThing from '../copy-thing'
import AiResult, {
  ConfidenceScore,
  ConvoGroup,
  RendererProps,
} from '../ai-result'
import Tooltip from '../tooltip'
import HintText from '../hint-text'
import { AiConvoMessage, MessageType } from '@/ai'
import FieldOutput from '../field-output'
import { ChatBubbleSource } from '../chat-message'
import QueueStatusLabel from '../queue-status-label'

const useStyles = makeStyles({
  score: {
    wordBreak: 'keep-all',
    lineBreak: 'strict',
  },
  clickable: {
    cursor: 'pointer',
    '&:hover': {
      background: 'rgba(255,255,255,0.1)',
    },
  },
  item: {
    width: '100%',
    padding: '0.5rem 0',
    borderTop: '1px solid rgba(255,255,255,0.25)',
    '&:first-child': {
      paddingTop: 0,
      borderTop: 'none',
    },
    '&:last-child': {
      paddingBottom: 0,
    },
  },
  cells: {
    display: 'flex',
    '& > *': {
      padding: '0 0.5rem',
      '&:first-child': {
        paddingLeft: 0,
      },
      '&:last-child': {
        paddingRight: 0,
      },
    },
  },
  cell: {
    width: '100%',
    '&:last-child': {
      textAlign: 'right',
    },
    '& > *': {
      display: 'block',
    },
  },
  date: {
    fontSize: '75%',
  },
})

export const ConvoRenderer = ({
  message,
}: {
  message: AiConvoMessage<AiFieldSuggestions, FuncResult>
}) => {
  switch (message.type) {
    case MessageType.String:
      return (
        <ChatBubbleSource
          dangerouslySetInnerHTML={{
            __html: message.contents.replace('\n', '<br />'),
          }}
        />
      )

    case MessageType.Candidates:
      const entries = Object.entries(message.contents)
      return (
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>Candidates</TableCell>
              <TableCell>
                {entries.length > 0
                  ? entries.map(([fieldName, suggestion]) => (
                      <div>
                        {fieldName} - {suggestion.suggestedValue}{' '}
                        {suggestion.confidence}
                        <br />
                        {suggestion.reason}
                      </div>
                    ))
                  : '(none)'}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )

    case MessageType.FuncResult:
      return (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Field</TableCell>
              <TableCell>Suggestion</TableCell>
              <TableCell>Confidence</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(message.contents.suggestions).map(
              ([fieldName, suggestion]) => (
                <TableRow key={fieldName}>
                  <TableCell>{fieldName}</TableCell>
                  <TableCell>
                    <FieldOutput>{suggestion.suggestedValue}</FieldOutput>
                    {suggestion.options !== undefined && (
                      <>
                        <br />
                        <br />
                        Options:{' '}
                        {suggestion.options.length
                          ? suggestion.options.join(',')
                          : '(none)'}
                      </>
                    )}
                    <br />
                    <br />
                    <HintText>{suggestion.reason}</HintText>
                  </TableCell>
                  <TableCell>
                    <ConfidenceScore
                      score={suggestion.confidence}
                      title={suggestion.reason}
                      small
                    />
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      )

    default:
      return (
        <ErrorMessage>
          Unknown message type: {(message as any).type}
        </ErrorMessage>
      )
  }
}

export const Renderer = ({
  queuedItem: staleQueuedItem,
  onClick,
  isMain = false,
}: {
  queuedItem: AiSuggestQueuedItem
  onClick?: () => void
  isMain?: boolean
}) => {
  const classes = useStyles()
  const [isSubscribing, isSubscribed, lastErrorCode, lastResult] =
    useDataStoreItemSync<AiSuggestQueuedItem>(
      CollectionNames.AiSuggestQueue,
      staleQueuedItem.id
    )
  const isExpanded = !isMain

  const queuedItem = lastResult || staleQueuedItem

  const InfoIconWithTooltip = () => (
    <Tooltip title="Click to copy ID">
      <CopyThing text={queuedItem.id}>
        <InfoIcon />
      </CopyThing>
    </Tooltip>
  )

  return (
    <div className={`${classes.item} ${onClick ? classes.clickable : ''}`}>
      {isSubscribing && <LoadingIndicator message="Subscribing..." />}
      {lastErrorCode !== null && (
        <ErrorMessage>Failed to subscribe: {lastErrorCode}</ErrorMessage>
      )}
      <div className={classes.cells}>
        <div className={classes.cell}>
          {isMain && isExpanded !== true ? (
            <div>AI Evaluation</div>
          ) : (
            <>
              {isMain === false || isExpanded ? (
                <QueueStatusLabel
                  id={queuedItem.id}
                  status={queuedItem.status}
                />
              ) : null}

              <FormattedDate
                date={queuedItem.lastmodifiedat || queuedItem.createdat}
                className={classes.date}
              />

              {queuedItem.status === QueueStatus.Failed
                ? `Notes: ${queuedItem.notes}`
                : null}
            </>
          )}
        </div>
        <div className={classes.cell}>
          {queuedItem.suggestions !== null ? (
            <>
              <Tooltip
                title={
                  <>
                    These AI models were asked to suggest fields for this asset:{' '}
                    {queuedItem.convogroups
                      ? queuedItem.convogroups.map((convoGroup, i) => (
                          <>
                            {convoGroup.map((convo) => (
                              <>
                                <br />
                                {convo.modelName}
                              </>
                            ))}
                          </>
                        ))
                      : queuedItem.status === QueueStatus.Processed
                      ? 'No AI models asked yet'
                      : null}
                    <br />
                    Click for more info
                  </>
                }>
                <span className={classes.score}>
                  {Object.keys(queuedItem.suggestions).length} suggestions
                </span>
              </Tooltip>
            </>
          ) : queuedItem.status === QueueStatus.Processed ? (
            <>
              No score found <InfoIconWithTooltip />
            </>
          ) : (
            <InfoIconWithTooltip />
          )}
        </div>
      </div>
      {isExpanded ? (
        <div>
          {queuedItem.convogroups !== null ? (
            queuedItem.convogroups.map((convoGroup) => (
              <ConvoGroup convoGroup={convoGroup} renderer={ConvoRenderer} />
            ))
          ) : (
            <NoResultsMessage>No AI models talked to yet</NoResultsMessage>
          )}
        </div>
      ) : null}
    </div>
  )
}

const AiSuggestResult = ({
  assetId,
  startExpanded,
}: {
  assetId: string
  startExpanded?: boolean
}) => {
  return (
    <AiResult
      noResultMessage="Click to view AI suggestions"
      title="AI Suggestion"
      parentCollectionName={AssetsCollectionNames.Assets}
      parentId={assetId}
      queueCollectionName={CollectionNames.AiSuggestQueue}
      renderer={
        Renderer as React.ComponentType<RendererProps<AiSuggestQueuedItem>>
      }
      startExpanded={startExpanded}
    />
  )
}

export default AiSuggestResult
