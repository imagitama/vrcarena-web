import React, { useEffect, useState } from 'react'
import { makeStyles } from '@mui/styles'
import WarningIcon from '@mui/icons-material/Warning'

import Heading from '../heading'
import Button from '../button'
import TextInput from '../text-input'
import useUserRecord from '../../hooks/useUserRecord'
import useFirebaseFunction from '../../hooks/useFirebaseFunction'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import { logout } from '../../firebase'
import useUserId from '../../hooks/useUserId'
import FormControls from '../form-controls'
import SuccessMessage from '../success-message'
import useTimer from '../../hooks/useTimer'
import useHistory from '../../hooks/useHistory'

const useStyles = makeStyles({
  root: {
    border: '1px dashed #FF0000',
    padding: '0.5rem',
    '& > h2': {
      color: '#ff5e5e',
    },
  },
  dangerButton: {
    backgroundColor: '#910000 !important',
    '&:hover': {
      backgroundColor: '#590000 !important',
    },
  },
})

const DeleteAccountForm = () => {
  const [wantsToDelete, setWantsToDelete] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const classes = useStyles()
  const userId = useUserId()
  const [, , user] = useUserRecord()
  const [isDeleting, lastErrorCode, deleteResult, callFunction] =
    useFirebaseFunction<
      { username: string; userId: string },
      { success: boolean }
    >('deleteAccount')
  const { push } = useHistory()
  const logoutAfterDelay = useTimer(() => {
    logout()
    push('/')
  }, 3000)

  useEffect(() => {
    if (deleteResult && deleteResult.success) {
      logoutAfterDelay()
    }
  }, [deleteResult && deleteResult.success])

  if (deleteResult && deleteResult.success) {
    return (
      <SuccessMessage>
        Your account has been deleted. Logging you out and redirecting you to
        the homepage in 3 seconds...
      </SuccessMessage>
    )
  }

  if (!user) {
    return null
  }

  const actualUsername = user.username

  if (!actualUsername) {
    return null
  }

  const onClickContinue = () => setWantsToDelete(true)

  const onClickDeleteForever = () => {
    callFunction({ username: usernameInput, userId: userId! })
  }

  return (
    <div className={classes.root}>
      <Heading variant="h2" noTopMargin>
        Danger Zone
      </Heading>
      <p>
        You can delete your account using this form. When you delete your
        account the following happens:
      </p>
      <ul>
        <li>
          your login details (email address, password, Discord user ID, Twitter
          user ID or whatever you used to login) will be deleted forever
        </li>
        <li>you will never be able to login again</li>
        <li>
          personally identifiable data will be deleted forever including:
          <ul>
            <li>your username</li>
            <li>
              any email addresses and 3rd party user info linked to you (eg.
              VRChat linked account info) on record
            </li>
            <li>your bio and other profile info</li>
            <li>avatar</li>
          </ul>
        </li>
      </ul>
      <p>
        Some data will remain for the site to function (we are not required to
        delete this). This includes:
      </p>
      <ul>
        <li>your actual user profile itself (it will be empty)</li>
        <li>
          assets, comments, amendments, reports, wishlists, collections, events,
          reviews, social posts etc. you have created
        </li>
        <li>
          authors that may have the same personal information as your user
          account (you must amend them yourself to remove the info or contact us
          to delete for you)
        </li>
      </ul>
      {lastErrorCode !== null ? (
        <ErrorMessage>
          Failed to delete your account - please contact us directly to have
          this fixed and/or manually delete your account (code {lastErrorCode})
        </ErrorMessage>
      ) : isDeleting ? (
        <LoadingIndicator message="Deleting your account..." />
      ) : !wantsToDelete ? (
        <FormControls>
          <Button onClick={onClickContinue} color="secondary">
            I understand and I want to delete my account
          </Button>
        </FormControls>
      ) : (
        <>
          <>
            <strong>Please type your username to continue:</strong>
            <br />
            <br />
            <TextInput
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              fullWidth
            />
            <FormControls>
              <Button
                isDisabled={usernameInput !== actualUsername}
                onClick={onClickDeleteForever}
                className={classes.dangerButton}
                icon={<WarningIcon />}
                switchIconSide>
                Delete My Account Forever
              </Button>
            </FormControls>
          </>
        </>
      )}
    </div>
  )
}

export default DeleteAccountForm
