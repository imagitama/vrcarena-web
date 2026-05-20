import EditIcon from '@mui/icons-material/Edit'
import CommentIcon from '@mui/icons-material/Comment'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

import useIsEditor from '@/hooks/useIsEditor'

import {
  CollectionNames as UsersCollectionNames,
  FullUser_Editor,
  UserRoles,
} from '@/modules/users'

import {
  AiEvaluateQueuedItem,
  CollectionNames as AiEvaluationCollectionNames,
  Intent,
} from '@/modules/aievaluation'

import Button from '@/components/button'
import ViewControls from '@/components/view-controls'
import EditorBox from '@/components/editor-box'
import FormattedDate from '@/components/formatted-date'
import AwardRepButton from '@/components/award-rep-button'
import { ConfidenceScore, RequeueButton } from '@/components/ai-result'
import Heading from '@/components/heading'
import useUserOverview from '../../useUserOverview'
import StatusText from '@/components/status-text'
import { routes } from '@/routes'
import useUserRecord from '@/hooks/useUserRecord'
import { useState } from 'react'
import AiEvaluationResult from '@/components/ai-evaluation-result'
import useDatabaseQuery, {
  Operators,
  OrderDirections,
} from '@/hooks/useDatabaseQuery'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'

const useIsAdmin = (): boolean => {
  const [, , user] = useUserRecord()
  return user ? user.role === UserRoles.Admin : false
}

const BotScoreInfo = ({ userId }: { userId: string }) => {
  const [isLoading, lastErrorCode, queuedItems, hydrate] =
    useDatabaseQuery<AiEvaluateQueuedItem>(
      AiEvaluationCollectionNames.AiEvaluateQueue,
      [
        ['recordtable', Operators.EQUALS, UsersCollectionNames.Users],
        ['recordid', Operators.EQUALS, userId],
      ],
      {
        orderBy: ['createdat', OrderDirections.DESC],
        limit: 1,
      }
    )

  if (isLoading) {
    return <LoadingIndicator message="Loading queued item..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to load queued item (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (queuedItems === null || queuedItems.length < 1) return null

  return (
    <>
      <AiEvaluationResult queuedItem={queuedItems[0]} />
      <Button size="small" color="secondary" hollow onClick={hydrate}>
        Refresh
      </Button>
    </>
  )
}

const UserEditorControls = () => {
  const isEditor = useIsEditor()
  const { user } = useUserOverview()
  const isAdmin = useIsAdmin()
  const [isBotScoreExpanded, setIsBotScoreExpanded] = useState(false)
  if (!isEditor || !user) return null
  return (
    <ViewControls>
      <EditorBox>
        <Heading variant="h3" noTopMargin>
          User Info
        </Heading>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Signed up</TableCell>
              <TableCell>
                <FormattedDate date={user.createdat} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Reputation</TableCell>
              <TableCell>
                <StatusText positivity={user.reputation > 0 ? 1 : -1}>
                  {user.reputation}
                </StatusText>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bot Score</TableCell>
              <TableCell>
                {(user as unknown as FullUser_Editor).botscore !== null ? (
                  isBotScoreExpanded ? (
                    <BotScoreInfo userId={user.id} />
                  ) : (
                    <ConfidenceScore
                      score={(user as unknown as FullUser_Editor).botscore!}
                      title={
                        <>
                          We use AI to try and determine if a new user is a bot
                          or not to combat spam.
                          <br />
                          <br />
                          The AI gives us a score of how confident it is they
                          are a real human and not a bot.
                          <br />
                          <br />
                          See our AI policy in the footer.
                        </>
                      }
                      onClick={() => setIsBotScoreExpanded(true)}
                    />
                  )
                ) : (
                  '(none yet)'
                )}
                <RequeueButton<AiEvaluateQueuedItem>
                  queueCollectionName={
                    AiEvaluationCollectionNames.AiEvaluateQueue
                  }
                  parentCollectionName={UsersCollectionNames.Users}
                  parentId={user.id}
                  extraFields={{ intent: Intent.BotScore }}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Patreon</TableCell>
              <TableCell>
                {user.patreonstatus || 'Not Patron'} (
                {user.patreonrewardids?.length
                  ? user.patreonrewardids.join(',')
                  : 'no rewards'}
                )
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>VRChat ID</TableCell>
              <TableCell>{user.linkedvrchatuserid || 'Not Linked'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Discord ID</TableCell>
              <TableCell>{user.discorduserid || 'No ID'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Button
          icon={<EditIcon />}
          color="secondary"
          url={routes.editUserWithVar.replace(':userId', user.id)}>
          Edit User
        </Button>{' '}
        <Button
          icon={<CommentIcon />}
          color="secondary"
          url={`${routes.adminWithTabNameVar.replace(
            ':tabName',
            'users'
          )}?userId=${user.id}`}>
          View Comments
        </Button>{' '}
        {isAdmin && <AwardRepButton userId={user.id} />}
      </EditorBox>
    </ViewControls>
  )
}

export default UserEditorControls
