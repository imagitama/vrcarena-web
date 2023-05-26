import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField'
import { useLocation } from 'react-router'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames, UserFieldNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import useUserId from '../../hooks/useUserId'

import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import LoadingIndicator from '../loading-indicator'
import Button from '../button'
import Heading from '../heading'
import FavoriteSpeciesEditor from '../favorite-species-editor'
import VrPlatformChooser from '../vr-platform-chooser'

import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import * as routes from '../../routes'
import { mediaQueryForMobiles } from '../../media-queries'
import { inDevelopment } from '../../environment'
import {
  defaultNotificationPrefs,
  NotificationEvents
} from '../../notifications'
import CheckboxInput from '../checkbox-input'
import FormControls from '../form-controls'
import UsernameEditor from '../username-editor'
import WarningMessage from '../warning-message'

const useStyles = makeStyles({
  root: {
    margin: '2rem auto',
    textAlign: 'center',
    [mediaQueryForMobiles]: {
      width: '100%'
    }
  },
  input: {
    width: '100%',
    maxWidth: '500px'
  },
  checkboxRow: {
    textAlign: 'center'
  },
  finalStep: {
    width: '50%',
    margin: '0 auto',
    [mediaQueryForMobiles]: {
      width: '100%'
    }
  },
  digestInfo: {
    margin: '0.25rem 0 2rem',
    fontStyle: 'italic',
    fontSize: '80%'
  }
})

export default ({ analyticsCategory, onDone, initialStepIdx = 0 }) => {
  const userId = useUserId()
  const [isLoadingUser, , user, hydrate] = useUserRecord()
  const [isCreating, isCreateSuccess, isCreateError, save] = useDatabaseSave(
    CollectionNames.Users,
    userId
  )
  const [subscribeToDigest, setSubscribeToDigest] = useState(false)
  const location = useLocation()
  const classes = useStyles()
  const [stepIdx, setStepIdx] = useState(initialStepIdx)

  if (location.pathname === routes.login) {
    return null
  }

  if (!inDevelopment()) {
    if (!userId) {
      return <LoadingIndicator message="Waiting for user ID..." />
    }

    if (isLoadingUser || !user) {
      return <LoadingIndicator message="Loading your details..." />
    }

    if (isCreating) {
      return <LoadingIndicator message="Creating your profile..." />
    }

    if (isCreateSuccess) {
      return (
        <SuccessMessage>
          Profile has been setup successfully! Redirecting you...
        </SuccessMessage>
      )
    }

    if (isCreateError) {
      return (
        <ErrorMessage>
          Failed to create your profile. Please contact us via our Discord ASAP
          to fix this
        </ErrorMessage>
      )
    }
  }

  const onSaveBtnClick = async () => {
    try {
      trackAction(analyticsCategory, 'Click save button')

      const notificationPrefs = {
        ...defaultNotificationPrefs,
        events: {
          ...defaultNotificationPrefs.events,
          [NotificationEvents.DIGEST]: subscribeToDigest
        }
      }

      await save({
        [UserFieldNames.notificationPrefs]: notificationPrefs
      })

      await hydrate()

      onDone()
    } catch (err) {
      console.error('Failed to setup profile', err)
      handleError(err)
    }
  }

  const nextStep = () => {
    setStepIdx(currentVal => currentVal + 1)
  }

  return (
    <div className={classes.root}>
      <Heading variant="h1">Welcome to VRCArena</Heading>
      <Heading variant="h2">Set up your profile</Heading>

      {stepIdx === 0 ? (
        <FavoriteSpeciesEditor
          onDone={() => nextStep()}
          analyticsCategory={analyticsCategory}
        />
      ) : stepIdx === 1 ? (
        <VrPlatformChooser
          onDone={() => nextStep()}
          analyticsCategory={analyticsCategory}
        />
      ) : (
        <div className={classes.finalStep}>
          <p>Enter a username:</p>
          <UsernameEditor />
          <br />
          <br />
          <CheckboxInput
            label="Subscribe to our weekly newsletter"
            onChange={() => setSubscribeToDigest(currentVal => !currentVal)}
            value={subscribeToDigest}
          />
          <div className={classes.digestInfo}>
            It is a summary of the most recent assets posted to the site. Sent
            every Sunday. You can unsubscribe at any time.
          </div>
          <WarningMessage>
            Remember to enter in a username above and click{' '}
            <strong>Save</strong>
          </WarningMessage>
          <br />
          <FormControls>
            <Button onClick={onSaveBtnClick} isDisabled={isCreating}>
              Finish
            </Button>
          </FormControls>
        </div>
      )}
    </div>
  )
}
