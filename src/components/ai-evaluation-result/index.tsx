import { makeStyles } from '@mui/styles'
import React, { useState } from 'react'
import { Chip } from '@mui/material'
import MessageIcon from '@mui/icons-material/Message'
import InfoIcon from '@mui/icons-material/Info'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

import useDataStoreItemSync from '@/hooks/useDataStoreItemSync'

import {
  AiEvaluateQueuedItemStatus,
  CollectionNames as AiEvaluationCollectionNames,
  GeminiAssetEvaluationFunctionResult,
  type AiEvaluateConvo,
  type AiEvaluateQueuedItem,
} from '@/modules/aievaluation'
import { AiConvoMessage, MessageType } from '@/ai'

import ErrorMessage from '@/components/error-message'
import LoadingIndicator from '@/components/loading-indicator'
import FormattedDate from '@/components/formatted-date'
import Tooltip from '@/components/tooltip'
import { Convo as ConvoExpanded, ConfidenceScore } from '@/components/ai-result'
import NoResultsMessage from '@/components/no-results-message'
import { ChatBubbleSource } from '../chat-message'
import QueueStatusLabel from '../queue-status-label'

const useStyles = makeStyles({
  root: {
    position: 'relative',
  },
  box: {
    borderRadius: '5px',
    cursor: 'default',
    '& a': {
      cursor: 'pointer',
    },
    '& dt': {
      fontWeight: 'bold',
    },
    transition: '100ms all',
    '& ul': {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
  },
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
  statusText: {
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  bad: {
    color: 'red',
  },
  good: {
    color: 'green',
  },
  noResultsMessage: {
    padding: '0.5rem',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  result: {
    fontSize: '125%',
    fontWeight: 'bold',
    marginLeft: 'auto',
    userSelect: 'none',
  },
  date: {},
  hydrateBtn: {
    cursor: 'pointer',
  },
  convos: {
    // marginTop: '0.5rem',
  },
  convo: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '75%',
  },
  convoMeta: { width: '20%' },
  convoDesc: { paddingBottom: '0.5rem' },
  controls: {},
  messages: {
    '&, & li': {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    fontSize: '75%',
    lineHeight: 1.5,
  },
  message: {
    '&:nth-child(even)': {
      // fontStyle: 'italic',
    },
  },
  button: {
    padding: '0.25rem',
    opacity: 0.5,
    '&:hover': {
      opacity: 1,
    },
  },
  modelName: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  tags: {},
  chip: {
    margin: '0 0.25rem 0.25rem 0',
    backgroundColor: 'rgba(255,255,255,0.1) !important',
    color: 'rgba(255,255,255,0.75) !important',
    opacity: 0.5,
    fontSize: '80% !important',
  },
  commonTag: {
    opacity: 1,
  },
  row: {
    display: 'flex',
    '& > *': {
      margin: '0.25rem',
      '&:first-child': {
        marginLeft: 0,
      },
      '&:last-child': {
        marginRight: 0,
      },
    },
  },
  cell: {
    '&:last-child': {
      textAlign: 'right',
    },
  },
  confidence: {
    fontSize: '75%',
    marginLeft: '0.25rem',
  },
  primaryCell: {},
  openInDialogIcon: {
    position: 'absolute',
    width: '20px',
    height: '20px',
    bottom: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.25rem',
    transition: '100ms all',
    '&:hover': {
      cursor: 'pointer',
      background: 'rgba(255,255,255,0.5)',
    },
  },
  clickableIcon: {
    cursor: 'pointer',
  },
})

const Tags = ({
  tags,
  queuedItemTags,
  isMain = false,
}: {
  tags: string[]
  queuedItemTags?: string[]
  isMain?: boolean
}) => {
  const classes = useStyles()
  return (
    <div className={classes.tags}>
      {tags.map((tag) => (
        <Chip
          color="secondary"
          size="small"
          label={tag}
          classes={{
            root: classes.chip,
          }}
          className={`${
            isMain || queuedItemTags?.includes(tag) ? classes.commonTag : ''
          }`}
        />
      ))}
    </div>
  )
}

const ConvoRenderer = ({
  message,
}: {
  message: AiConvoMessage<any, GeminiAssetEvaluationFunctionResult>
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

    case MessageType.FuncResult:
      const { score, score_reason, score_reason_tags } =
        message.contents.evaluation
      return (
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>Score</TableCell>
              <TableCell>{score}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Tags</TableCell>
              <TableCell>{score_reason_tags.join(',')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Reason</TableCell>
              <TableCell>{score_reason || '(no reason)'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )

    case MessageType.PromptFeedback:
      return (
        <ul>
          <li>Block reason: {message.contents.blockReason || 'none'}</li>
          <li>
            Safety ratings:{' '}
            {message.contents.safetyRatings
              ? message.contents.safetyRatings.join(',')
              : 'none'}
          </li>
        </ul>
      )

    default:
      return (
        <>
          <ErrorMessage>
            Unknown message type: {(message as any).type}
          </ErrorMessage>
          {JSON.stringify(message, null, '  ')}
        </>
      )
  }
}

const Convo = ({ convo, tags }: { convo: AiEvaluateConvo; tags: string[] }) => {
  const [showConvo, setShowConvo] = useState(false)
  const classes = useStyles()
  return (
    <div className={classes.convo}>
      <div className={classes.row}>
        <div className={classes.cell} style={{ width: '100%' }}>
          <span className={classes.modelName}>{convo.model}</span>{' '}
          <Tooltip title="Show AI conversation">
            <MessageIcon
              onClick={() => setShowConvo((val) => !val)}
              className={classes.clickableIcon}
            />
          </Tooltip>
        </div>
        <div className={classes.cell}>
          {convo.tags ? (
            <Tags tags={convo.tags} queuedItemTags={tags} />
          ) : (
            '(no tags)'
          )}
        </div>
        <div className={classes.cell}>
          <ConfidenceScore
            score={convo.score}
            title="This model was asked to give this score and reasons (if it is below 100%)."
            small
          />
        </div>
      </div>
      <div>
        {showConvo ? (
          <ConvoExpanded
            convo={{
              modelName: convo.model,
              messages: convo.messages,
            }}
            renderer={ConvoRenderer}
          />
        ) : null}
      </div>
    </div>
  )
}

const AiEvaluationResult = ({
  queuedItem: staleQueuedItem,
  onClick,
  isMain = false,
}: {
  queuedItem: AiEvaluateQueuedItem
  onClick?: () => void
  isMain?: boolean
}) => {
  const classes = useStyles()
  const [isSubscribing, isSubscribed, lastErrorCode, lastResult] =
    useDataStoreItemSync<AiEvaluateQueuedItem>(
      AiEvaluationCollectionNames.AiEvaluateQueue,
      staleQueuedItem.id
    )
  const isExpanded = !isMain

  const queuedItem = lastResult || staleQueuedItem

  // TODO: place this somewhere
  // const CopyIdIcon = () => (
  //   <CopyThing text={queuedItem.id} title="Click to copy ID">
  //     <InfoIcon />
  //   </CopyThing>
  // )

  const tagsToDisplay: string[] | null =
    Array.isArray(queuedItem.tags) && queuedItem.tags.length
      ? queuedItem.tags
      : queuedItem.convos !== null
      ? queuedItem.convos.reduce<string[]>(
          (newTags, convo) =>
            convo.tags !== null ? newTags.concat(convo.tags) : newTags,
          []
        )
      : null

  return (
    <div className={`${classes.item} ${onClick ? classes.clickable : ''}`}>
      {isSubscribing && <LoadingIndicator message="Subscribing..." />}
      {lastErrorCode !== null && (
        <ErrorMessage>Failed to subscribe: {lastErrorCode}</ErrorMessage>
      )}
      <div className={classes.cells}>
        <div className={classes.cell} style={{ width: '100%' }}>
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
              <div className={classes.date}>
                <FormattedDate
                  date={queuedItem.lastmodifiedat || queuedItem.createdat}
                />
              </div>
            </>
          )}
        </div>
        <div className={classes.cell}>
          {queuedItem.score !== null ? (
            <ConfidenceScore
              score={queuedItem.score}
              title={
                <>
                  These AI models were asked to evaluate this asset:{' '}
                  {queuedItem.convos
                    ? queuedItem.convos.map((convo, i) => (
                        <>
                          {i !== 0 && <br />}
                          {convo.model} ({convo.score})
                        </>
                      ))
                    : queuedItem.status === AiEvaluateQueuedItemStatus.Processed
                    ? 'No AI models asked yet'
                    : null}
                  <br />
                  0% scores and outliers are ignored
                  <br />
                  Click for more info
                </>
              }
            />
          ) : queuedItem.status === AiEvaluateQueuedItemStatus.Processed ? (
            <>No score found</>
          ) : null}
        </div>
      </div>
      <div>
        {tagsToDisplay && <Tags tags={tagsToDisplay} isMain={isMain} />}
      </div>
      {isExpanded ? (
        <div className={classes.convos}>
          {queuedItem.convos?.map((convo) => (
            <Convo convo={convo} tags={queuedItem.tags!} />
          )) || <NoResultsMessage>No AI models talked to yet</NoResultsMessage>}
        </div>
      ) : null}
    </div>
  )
}

export default AiEvaluationResult
