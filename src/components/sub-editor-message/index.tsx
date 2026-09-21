import styled from '@emotion/styled'

import useUserRecord from '@/hooks/useUserRecord'
import { hideNoticeById } from '@/hooks/useNotices'
import { SubEditorStatus } from '@/modules/users'

import Message from '../message'
import Button from '../button'
import DialogButton from '../dialog-button'
import Heading from '../heading'
import FormControls from '../form-controls'
import useDataStoreFunction from '@/hooks/useDataStoreFunction'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import { routes } from '@/routes'
import Link from '../link'

enum FunctionNames {
  AcceptSubEditor = 'acceptsubeditor',
  DeclineSubEditor = 'declinesubeditor',
}

enum AcceptSubEditorErrorCode {
  REP_TOO_LOW = 'REP_TOO_LOW',
  ALREADY_ACCEPTED = 'ALREADY_ACCEPTED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_NOT_VERIFIED = 'USER_NOT_VERIFIED',
  USER_BANNED = 'USER_BANNED',
}
interface AcceptSubEditorPayload {}
interface AcceptSubEditorResult {
  success: boolean
}

enum DeclineSubEditorErrorCode {}
interface DeclineSubEditorPayload {}
interface DeclineSubEditorResult {
  success: boolean
}

const AcceptButton = ({ onDone }: { onDone: () => void }) => {
  const [isLoading, lastErrorCode, lastResult, callFunc] = useDataStoreFunction<
    AcceptSubEditorPayload,
    AcceptSubEditorResult
  >(FunctionNames.AcceptSubEditor, Object.values(AcceptSubEditorErrorCode))
  const [, , , hydrateUser] = useUserRecord()

  const onClickAccept = async () => {
    const result = await callFunc()
    if (result?.success) {
      hydrateUser()
    }
  }

  if (lastErrorCode !== null)
    return (
      <ErrorMessage errorCode={lastErrorCode as string}>
        Failed to accept
      </ErrorMessage>
    )

  if (lastResult?.success)
    return (
      <SuccessMessage
        controls={[
          <Button
            url={routes.queue}
            onClick={() => {
              close()
            }}
            size="small"
            color="secondary">
            View The Queue
          </Button>,
          <Button onClick={onDone} size="small" color="secondary">
            Hide Dialog
          </Button>,
        ]}>
        You are now a community editor. You should now be able to review new
        assets.
      </SuccessMessage>
    )

  return (
    <Button onClick={onClickAccept} isDisabled={isLoading}>
      I accept - let's go!
    </Button>
  )
}

const DeclineButton = ({ onDone }: { onDone: () => void }) => {
  const [isLoading, lastErrorCode, lastResult, callFunc] = useDataStoreFunction<
    DeclineSubEditorPayload,
    DeclineSubEditorResult
  >(FunctionNames.DeclineSubEditor, Object.values(DeclineSubEditorErrorCode))

  const onClickDecline = async () => {
    await callFunc()
  }

  if (lastErrorCode !== null)
    return (
      <ErrorMessage errorCode={lastErrorCode as string}>
        Failed to decline
      </ErrorMessage>
    )

  if (lastResult?.success)
    return (
      <SuccessMessage
        controls={[
          <Button onClick={onDone} size="small" color="secondary">
            Hide Dialog
          </Button>,
        ]}>
        You are now no longer or never will be a community editor.
      </SuccessMessage>
    )

  return (
    <Button
      onClick={onClickDecline}
      isDisabled={isLoading}
      color="secondary"
      hollow={false}>
      I decline - never ask me again
    </Button>
  )
}

const MessageText = styled.div`
  font-size: 125%;
  text-align: center;
`

const SUB_EDITOR_REP_THRESHOLD = 200 // 35 rows as of sep 2026
const hideId = 'sub-editor-question'

const SubEditorMessage = () => {
  const [, , user] = useUserRecord()

  if (
    !user ||
    user.reputation < SUB_EDITOR_REP_THRESHOLD ||
    user.subeditorstatus !== SubEditorStatus.Unknown
  )
    return null

  return (
    <Message
      hideId={hideId}
      controls={[
        <DialogButton
          dialog={({ close }) => (
            <>
              <Heading variant="h1" noTopMargin>
                What is a community editor?
              </Heading>
              <p>
                You can help our editorial team by becoming a community editor -
                someone who reviews new assets and amendments to help our staff
                out.
              </p>
              <Heading variant="h2">What do I have to do?</Heading>
              <ol>
                <li>
                  Monitor the{' '}
                  <Link
                    to={routes.queue}
                    onClick={() => {
                      close()
                    }}>
                    queue
                  </Link>{' '}
                  when you feel like it
                </li>
                <li>Approve or decline assets as you feel like it</li>
                <li>That's it!</li>
              </ol>
              <p>
                How much work you put into this is entirely up to you. When
                actually approving or declining, our staff will take into
                consideration your submission.
              </p>
              <FormControls>
                <AcceptButton
                  onDone={() => {
                    close()
                    hideNoticeById(hideId)
                  }}
                />
                <DeclineButton
                  onDone={() => {
                    close()
                    hideNoticeById(hideId)
                  }}
                />
              </FormControls>
              {/* TODO <Heading variant="h2">Can I quit?</Heading>
            <p>
                Go to <Link to={routes.myAccountWithTabNameVar}>My Account</Link> and opt-out.
            </p> */}
            </>
          )}>
          Find Out More
        </DialogButton>,
        <Button color="secondary" onClick={() => hideNoticeById(hideId)}>
          No Thanks
        </Button>,
      ]}>
      <MessageText>
        Hi {user.username}! You have enough reputation to become a{' '}
        <strong>community editor</strong> to help our staff with approving new
        assets and amendments.
      </MessageText>
    </Message>
  )
}

export default SubEditorMessage
