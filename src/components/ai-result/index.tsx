import { makeStyles } from '@mui/styles'
import styled from '@emotion/styled'
import React, { useState } from 'react'
import { Tooltip } from '@mui/material'
import MessageIcon from '@mui/icons-material/Message'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import AspectRatioIcon from '@mui/icons-material/AspectRatio'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import PersonIcon from '@mui/icons-material/Person'
import AccountTreeIcon from '@mui/icons-material/AccountTree'

import useDatabaseQuery, {
  Operators,
  OrderDirections,
} from '@/hooks/useDatabaseQuery'
import useDataStoreCreate from '@/hooks/useDataStoreCreate'

import { CollectionNames as AssetsCollectionNames } from '@/modules/assets'

import ErrorMessage from '@/components/error-message'
import Button, { ButtonProps } from '@/components/button'
import LoadingIndicator from '@/components/loading-indicator'
import SuccessMessage from '@/components/success-message'
import Dialog from '@/components/dialog'
import { QueueStatus } from '@/modules/common'
import ChatMessage from '../chat-message'
import { AiConvo, AiConvoMessage } from '@/ai'
import { QueuedItem } from '@/queues'

const useStyles = makeStyles({
  root: {
    position: 'relative',
  },
  box: {
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
    color: 'red', // TODO: use config
  },
  good: {
    color: 'green', // TODO: use config
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
  convos: {},
  convo: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '75%',
  },
  convoMeta: { width: '20%' },
  convoDesc: { paddingBottom: '0.5rem' },
  controls: {
    marginTop: '0.2rem',
  },
  messages: {
    '&, & li': {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    lineHeight: 1.5,
  },
  message: {
    marginBottom: '0.2rem',
    '&:last-child': {
      marginBottom: 0,
    },
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
    marginBottom: '-0.25rem',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  tags: {},
  chip: {
    margin: '0 0.25rem 0.25rem 0',
    backgroundColor: 'rgba(255,255,255,0.1) !important',
    color: 'rgba(255,255,255,0.75) !important',
    // border: '1px solid rgba(255,255,255,0.75) !important',
    opacity: 0.5,
    fontSize: '80% !important',
  },
  commonTag: {
    opacity: 1,
  },
  row: {
    display: 'flex',
    '& > *': {
      margin: '0.1rem',
      '&:first-child': {
        marginLeft: 0,
      },
      '&:last-child': {
        marginRight: 0,
      },
    },
  },
  cell: {
    width: '100%',
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
  iconWrapper: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgb(100,100,100)',
    textAlign: 'center',
  },
  icon: {
    cursor: 'pointer',
    marginTop: '3px',
  },
  convoGroup: { display: 'flex', marginTop: '0.4rem' },
  convoGroupIcon: {
    marginRight: '0.3rem',
    opacity: '0.5',
  },
})

export const getPositivityForStatus = (status: QueueStatus): number => {
  switch (status) {
    case QueueStatus.Failed:
      return -1
    case QueueStatus.Processed:
      return 1
    case QueueStatus.Processing:
      return 0
    case QueueStatus.Queued:
      return 0
  }
}

export const getIconForStatus = (status: QueueStatus) => {
  switch (status) {
    case QueueStatus.Failed:
      return <CloseIcon />
    case QueueStatus.Processed:
      return <CheckIcon />
    case QueueStatus.Processing:
      return <HourglassEmptyIcon />
    case QueueStatus.Queued:
      return null
  }
}

export const getStatusPastTense = (status: QueueStatus): string => {
  switch (status) {
    case QueueStatus.Processed:
      return 'Completed'
    case QueueStatus.Failed:
      return 'Failed'
    case QueueStatus.Processing:
      return 'Processing'
    case QueueStatus.Queued:
      return 'Queued'
    default:
      return status
  }
}

const getColor = (value: number) => `hsl(${value * 120}, 100%, 40%)`

export const Score = styled.span`
  display: inline-flex;
  font-weight: bold;
  cursor: default;
  color: ${({ value }: { value: number }) => getColor(value)};
`

interface ConvoProps {
  message: AiConvoMessage<any, any>
}

export const Convo = ({
  convo,
  renderer: Renderer,
}: {
  convo: AiConvo
  renderer: React.ComponentType<ConvoProps>
}) => {
  const [showConvo, setShowConvo] = useState(false)
  const classes = useStyles()
  return (
    <div className={classes.convo}>
      <div className={classes.row}>
        <div className={classes.modelName}>{convo.modelName}</div>
        <Tooltip title="Toggle AI conversation">
          <MessageIcon
            onClick={() => setShowConvo((val) => !val)}
            className={classes.icon}
          />
        </Tooltip>
      </div>
      <div>
        {showConvo ? (
          <div className={classes.messages}>
            {convo.messages?.map((msg, i) => (
              <ChatMessage
                key={`${msg.from}_${i}`}
                message={{
                  senderusername: msg.from,
                  senderavatar: () => (
                    <div className={classes.iconWrapper}>
                      {msg.from === 'model' ? (
                        <AutoAwesomeIcon />
                      ) : (
                        <PersonIcon />
                      )}
                    </div>
                  ),
                }}
                className={classes.message}
                flip={msg.from === 'model'}>
                <Renderer message={msg} />
              </ChatMessage>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export const getScoreAsPercentage = (score: number) => Math.floor(100 * score)

export interface RendererProps {
  queuedItem: QueuedItem
}

export const RequeueButton = <TRecord,>({
  queueCollectionName,
  parentCollectionName,
  parentId,
  extraFields = {},
}: {
  queueCollectionName: string
  parentCollectionName: string
  parentId: string
  extraFields?: Partial<TRecord>
}) => {
  const [isLoading, isSuccess, lastErrorCode, create] =
    useDataStoreCreate<QueuedItem>(queueCollectionName)

  const onRequeue = async () => {
    await create({
      recordtable: parentCollectionName,
      recordid: parentId,
      ...extraFields,
    })
  }

  const isBusy = isLoading

  return (
    <>
      {isSuccess && <SuccessMessage>Added to queue</SuccessMessage>}
      {isLoading && <LoadingIndicator message="Adding to queue..." />}
      {lastErrorCode !== null && (
        <ErrorMessage>Failed: {lastErrorCode}</ErrorMessage>
      )}
      <Button
        onClick={onRequeue}
        isDisabled={isBusy}
        size="small"
        color="secondary"
        hollow>
        Re-Queue
      </Button>
    </>
  )
}

const QueuedItemsList = ({
  queueCollectionName,
  renderer: Renderer,
  parentCollectionName,
  parentId,
}: {
  queueCollectionName: string
  renderer: React.ComponentType<RendererProps>
  parentCollectionName: string
  parentId: string
}) => {
  const [isLoading, lastErrorCode, queuedItems, hydrate] =
    useDatabaseQuery<QueuedItem>(
      queueCollectionName,
      [
        ['recordtable', Operators.EQUALS, parentCollectionName],
        ['recordid', Operators.EQUALS, parentId],
      ],
      {
        orderBy: ['createdat', OrderDirections.DESC],
      }
    )
  const classes = useStyles()

  if (lastErrorCode !== null)
    return (
      <ErrorMessage>Failed to query the queue: {lastErrorCode}</ErrorMessage>
    )

  if (isLoading) {
    return (
      <>
        {/* {asset.aievaluation && <Renderer queuedItem={asset.aievaluation} />} */}
        <div>Loading...</div>
      </>
    )
  }

  return (
    <>
      {queuedItems && queuedItems.length > 0 ? (
        <div>
          {queuedItems?.map((queuedItem) => (
            <Renderer key={queuedItem.id} queuedItem={queuedItem} />
          ))}
        </div>
      ) : queuedItems && queuedItems.length == 0 ? (
        <NoResultsMessage message="No queued items" />
      ) : null}
      <div className={classes.controls}>
        <Button onClick={hydrate} size="small" color="secondary" hollow>
          Refresh
        </Button>{' '}
        <RequeueButton
          queueCollectionName={queueCollectionName}
          parentCollectionName={parentCollectionName}
          parentId={parentId}
        />
      </div>
    </>
  )
}

const NoResultsMessage = ({ message }: { message: string }) => {
  const classes = useStyles()
  return <div className={classes.noResultsMessage}>{message}</div>
}

export const ConvoGroup = ({
  convoGroup,
  renderer: ConvoRenderer,
}: {
  convoGroup: AiConvo[]
  renderer: React.ComponentType<ConvoProps>
}) => {
  const classes = useStyles()
  return (
    <div className={classes.convoGroup}>
      <div className={classes.convoGroupIcon}>
        <AccountTreeIcon />
      </div>
      <div>
        {convoGroup.map((convo) => (
          <Convo convo={convo} renderer={ConvoRenderer} />
        ))}
      </div>
    </div>
  )
}

const AiResult = <TQueuedItem extends QueuedItem>({
  title,
  assetId,
  queueCollectionName,
  renderer: Renderer,
  noResultMessage,
  initialValue,
  startExpanded = false,
}: {
  title: string
  assetId: string
  queueCollectionName: string
  renderer: React.ComponentType<RendererProps>
  noResultMessage: string
  initialValue?: TQueuedItem | null
  startExpanded?: boolean
}) => {
  const classes = useStyles()
  const [isShowingMore, setIsShowingMore] = useState(startExpanded)
  const [isDialog, setIsDialog] = useState(false)

  if (isDialog) {
    return (
      <Dialog title={title} onClose={() => setIsDialog(false)}>
        <div style={{ height: 15 }} />
        <QueuedItemsList
          queueCollectionName={queueCollectionName}
          renderer={Renderer}
          // TODO: move
          parentCollectionName={AssetsCollectionNames.Assets}
          parentId={assetId}
        />
      </Dialog>
    )
  }

  return (
    <div className={classes.root}>
      <div
        className={`${classes.box} ${isShowingMore ? '' : classes.clickable}`}
        onClick={() => setIsShowingMore(true)}>
        {isShowingMore ? (
          <QueuedItemsList
            queueCollectionName={queueCollectionName}
            renderer={Renderer}
            parentCollectionName={AssetsCollectionNames.Assets}
            parentId={assetId}
          />
        ) : (
          <>
            {initialValue ? (
              <Renderer queuedItem={initialValue} />
            ) : (
              <NoResultsMessage message={noResultMessage} />
            )}
          </>
        )}
      </div>
      <div
        className={classes.openInDialogIcon}
        onClick={(e) => {
          setIsDialog(true)
          e.stopPropagation()
          e.preventDefault()
          return false
        }}>
        <AspectRatioIcon />
      </div>
    </div>
  )
}

export default AiResult
