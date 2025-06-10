import React, { useEffect } from 'react'
import CheckIcon from '@mui/icons-material/Check'
import useFirebaseFunction from '../../hooks/useFirebaseFunction'
import useUserRecord from '../../hooks/useUserRecord'
import Button from '../button'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import Paper from '../paper'
import Heading from '../heading'

interface GenerateCodePayload {}

interface GenerateCodeResult {
  success: boolean
  code?: string
}

// shared with backend
enum LinkWithVrchatAccountErrorCode {
  NeedLinkCode = 'NeedLinkCode',
  NeedVrchatUsername = 'NeedVrchatUsername',
  VrchatUserDoesNotExist = 'VrchatUserDoesNotExist',
  VrchatStatusDoesNotHaveCode = 'VrchatStatusDoesNotHaveCode',
  Unknown = 'Unknown',
}

interface LinkPayload {}

interface LinkResult {
  success: boolean
  vrchatUserId?: string
  errorCode?: LinkWithVrchatAccountErrorCode
}

const getMessageForErrorCode = (
  code: LinkWithVrchatAccountErrorCode
): string => {
  switch (code) {
    case LinkWithVrchatAccountErrorCode.NeedLinkCode:
      return 'you have not generated a code yet'
    case LinkWithVrchatAccountErrorCode.NeedVrchatUsername:
      return 'you do not have a VRChat username set on your user profile'
    case LinkWithVrchatAccountErrorCode.VrchatUserDoesNotExist:
      return 'the VRChat username you have set does not appear to exist'
    case LinkWithVrchatAccountErrorCode.VrchatStatusDoesNotHaveCode:
      return 'the VRChat account was found but the status does not include the code'
    default:
      throw new Error(`Unknown code ${code}`)
  }
}

const Form = () => {
  const [isLinking, isErrorLinking, linkResult, performLink, clearLinkResult] =
    useFirebaseFunction<LinkPayload, LinkResult>('linkWithVrchatAccount')
  const [isGeneratingCode, isErrorGeneratingCode, codeResult, generateCode] =
    useFirebaseFunction<GenerateCodePayload, GenerateCodeResult>(
      'generateVrchatLinkCode'
    )
  const [, , user, hydrateUser] = useUserRecord()

  useEffect(() => {
    if (!linkResult || !linkResult.success) {
      return
    }
    hydrateUser()
  }, [linkResult && linkResult.success])

  useEffect(() => {
    if (!codeResult || !codeResult.success) {
      return
    }
    hydrateUser()
  }, [codeResult && codeResult.success])

  if (!user) {
    return null
  }

  if (isLinking) {
    return <LoadingIndicator message="Linking..." />
  }

  if (isErrorLinking || (linkResult && linkResult.errorCode)) {
    return (
      <ErrorMessage onOkay={clearLinkResult}>
        Failed to link:{' '}
        {linkResult && linkResult.errorCode
          ? getMessageForErrorCode(linkResult.errorCode)
          : 'Unknown'}
      </ErrorMessage>
    )
  }

  if (isGeneratingCode) {
    return <LoadingIndicator message="Generating link code..." />
  }

  if (isErrorGeneratingCode) {
    return <ErrorMessage>Failed to generate link code</ErrorMessage>
  }

  const onClickPerformLink = () => {
    performLink({})
  }

  if (user.vrchatlinkcode) {
    return (
      <>
        <Heading variant="h3">
          Your link code is <strong>{user.vrchatlinkcode}</strong>
        </Heading>
        <Button onClick={onClickPerformLink} size="large" icon={<CheckIcon />}>
          Complete Link
        </Button>
      </>
    )
  }

  const onClickGenerateCode = () => {
    generateCode({})
  }

  return (
    <>
      <Button onClick={onClickGenerateCode}>Generate Code</Button>
    </>
  )
}

const LinkAccountWithVrchatForm = () => {
  const [, , user] = useUserRecord()

  if (!user) {
    return null
  }

  const existingVrchatUserId = user.linkedvrchatuserid

  if (existingVrchatUserId) {
    return (
      <>
        <SuccessMessage>
          You have linked your account with VRChat ❤️
        </SuccessMessage>
        <br />
        <br />
        (you can safely remove the code from your status)
      </>
    )
  }

  return (
    <Paper>
      <div>
        To link your VRChat account with your VRCArena account you must:
      </div>
      <ol>
        <li>Add your VRChat username to your account (go to Social tab)</li>
        <li>Generate a unique 4 digit code</li>
        <li>
          Add the code somewhere in your VRChat in-game status (not your bio)
        </li>
        <li>Click the link button here</li>
      </ol>
      <Form />
    </Paper>
  )
}

export default LinkAccountWithVrchatForm
