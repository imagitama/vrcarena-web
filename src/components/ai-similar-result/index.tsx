import React from 'react'
import { makeStyles } from '@mui/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'

import {
  AiSimilarConvo,
  AiSimilarFuncResult,
  AiSimilarQueuedItem,
  AssetSimilarity,
  CollectionNames,
} from '@/modules/aisimilar'
import {
  FullAsset_Editor,
  CollectionNames as AssetsCollectionNames,
} from '@/modules/assets'
import { QueueStatus } from '@/modules/common'

import useDataStoreItemSync from '@/hooks/useDataStoreItemSync'

import NoResultsMessage from '../no-results-message'
import FormattedDate from '../formatted-date'
import StatusText from '../status-text'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import AiResult, {
  ConfidenceScore,
  ConvoGroup,
  RendererProps,
} from '../ai-result'
import Tooltip from '../tooltip'
import { AiConvoMessage, MessageType } from '@/ai'
import HintText from '../hint-text'
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
  date: {
    fontSize: '75%',
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
  noResult: {
    fontStyle: 'italic',
    fontSize: '75%',
  },
})

const ConvoRenderer = ({
  message,
}: {
  message: AiConvoMessage<AssetSimilarity[], AiSimilarFuncResult>
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
      return (
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>Candidates</TableCell>
              <TableCell>
                {message.contents.length
                  ? message.contents.join(',')
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
              <TableCell>Asset</TableCell>
              <TableCell>Confidence</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {message.contents.similarities.map((assetSim) => (
              <TableRow key={assetSim.id}>
                <TableCell>
                  {assetSim.id} - {assetSim.title}
                  <br />
                  <br />
                  <HintText>{assetSim.reason}</HintText>
                </TableCell>
                <TableCell>
                  <ConfidenceScore
                    score={assetSim.confidence}
                    title={assetSim.reason}
                    small
                  />
                </TableCell>
              </TableRow>
            ))}
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
  queuedItem: AiSimilarQueuedItem
  onClick?: () => void
  isMain?: boolean
}) => {
  const classes = useStyles()
  const [isSubscribing, isSubscribed, lastErrorCode, lastResult] =
    useDataStoreItemSync<AiSimilarQueuedItem>(
      CollectionNames.AiSimilarQueue,
      staleQueuedItem.id
    )
  const isExpanded = !isMain

  const queuedItem = lastResult || staleQueuedItem

  return (
    <div className={`${classes.item} ${onClick ? classes.clickable : ''}`}>
      {isSubscribing && <LoadingIndicator message="Subscribing..." />}
      {lastErrorCode !== null && (
        <ErrorMessage>Failed to subscribe: {lastErrorCode}</ErrorMessage>
      )}
      <div className={classes.cells}>
        <div className={classes.cell}>
          {isMain && isExpanded !== true ? (
            <div>AI Similarites</div>
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
          {queuedItem.similarities !== null ? (
            <>
              <Tooltip
                title={
                  <>
                    These AI models were asked to determine similar assets to
                    this one: <br />
                    <br />
                    {queuedItem.convogroups
                      ? queuedItem.convogroups.map(
                          (convoGroup, convoGroupIndex) => (
                            <div key={`${convoGroupIndex}`}>
                              {convoGroup.map((convo, convoIdx) => (
                                <span key={`${convo.modelName}_${convoIdx}`}>
                                  {convoGroupIndex !== 0 && <br />}
                                  {convo.modelName}
                                </span>
                              ))}
                            </div>
                          )
                        )
                      : queuedItem.status === QueueStatus.Processed
                      ? 'No AI models asked yet'
                      : null}
                    <br />
                    Click for more info
                  </>
                }>
                <span className={classes.score}>
                  {Object.keys(queuedItem.similarities).length} similar assets
                </span>
              </Tooltip>
            </>
          ) : queuedItem.status === QueueStatus.Processed ? (
            <Tooltip title="Even though it was completed, something stopped it from finding similar assets. See the convos for more.">
              <span className={classes.noResult}>
                Failed to get similarities
              </span>
            </Tooltip>
          ) : null}
        </div>
      </div>
      {isExpanded ? (
        <div>
          {queuedItem.convogroups !== null ? (
            queuedItem.convogroups.map((convoGroup, i) => (
              <ConvoGroup
                key={`${i}`}
                convoGroup={convoGroup}
                renderer={ConvoRenderer}
              />
            ))
          ) : (
            <NoResultsMessage>No AI models talked to yet</NoResultsMessage>
          )}
        </div>
      ) : null}
    </div>
  )
}

const AiSimilarResult = ({ asset }: { asset: FullAsset_Editor }) => {
  return (
    <AiResult
      noResultMessage="No similar assets yet"
      title="AI Similar Asset Detection"
      parentCollectionName={AssetsCollectionNames.Assets}
      parentId={asset.id}
      mostRecentQueuedItem={asset.aisimilarities}
      queueCollectionName={CollectionNames.AiSimilarQueue}
      renderer={
        Renderer as React.ComponentType<RendererProps<AiSimilarQueuedItem>>
      }
    />
  )
}

export default AiSimilarResult
