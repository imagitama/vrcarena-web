import { useState } from 'react'
import EditIcon from '@mui/icons-material/Edit'
import CommentIcon from '@mui/icons-material/Comment'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

import useIsEditor from '@/hooks/useIsEditor'
import useUserRecord from '@/hooks/useUserRecord'

import {
  CollectionNames as UsersCollectionNames,
  FullUser_Editor,
  UserRoles,
  User,
} from '@/modules/users'
import {
  AiEvaluateQueuedItem,
  CollectionNames as AiEvaluationCollectionNames,
  Intent,
} from '@/modules/aievaluation'
import { routes } from '@/routes'

import Button from '@/components/button'
import ViewControls from '@/components/view-controls'
import EditorBox from '@/components/editor-box'
import FormattedDate from '@/components/formatted-date'
import AwardRepButton from '@/components/award-rep-button'
import AiResult, { ConfidenceScore } from '@/components/ai-result'
import Heading from '@/components/heading'
import StatusText from '@/components/status-text'
import AiEvaluationResult from '@/components/ai-evaluation-result'
import ErrorBoundary from '@/components/error-boundary'
import AiArea from '@/components/ai-area'

import useUserOverview from '../../useUserOverview'
import NoValueLabel from '@/components/no-value-label'

const useIsAdmin = (): boolean => {
  const [, , user] = useUserRecord()
  return user ? user.role === UserRoles.Admin : false
}

const BotScoreInfo = ({ user }: { user: FullUser_Editor }) => {
  return (
    <ErrorBoundary>
      <AiArea
        title="Evaluation"
        tooltip="The site has asked AI to evaluate the user to determine if they are a bot or not.">
        <AiResult<AiEvaluateQueuedItem, User>
          title="AI Evaluation"
          queueCollectionName={AiEvaluationCollectionNames.AiEvaluateQueue}
          parentCollectionName={UsersCollectionNames.Users}
          parentId={user.id}
          mostRecentQueuedItem={(user as FullUser_Editor).aievaluation}
          renderer={AiEvaluationResult}
          extraFields={{
            intent: Intent.BotScore,
          }}
        />
      </AiArea>
    </ErrorBoundary>
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
                {(user as unknown as FullUser_Editor).botscore !== null && (
                  <ConfidenceScore
                    score={(user as unknown as FullUser_Editor).botscore!}
                    title={
                      <>
                        We use AI to try and determine if a new user is a bot or
                        not to combat spam.
                        <br />
                        <br />
                        The AI gives us a score of how confident it is they are
                        a real human and not a bot.
                        <br />
                        <br />
                        See our AI policy in the footer.
                      </>
                    }
                    onClick={() => setIsBotScoreExpanded(true)}
                  />
                )}
                {isBotScoreExpanded ? (
                  <BotScoreInfo user={user as FullUser_Editor} />
                ) : (
                  <Button
                    size="small"
                    color="secondary"
                    hollow
                    onClick={() => setIsBotScoreExpanded(true)}>
                    Expand
                  </Button>
                )}
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
