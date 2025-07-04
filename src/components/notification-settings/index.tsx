import React, { useState, useEffect } from 'react'
import { makeStyles } from '@mui/styles'
import SaveIcon from '@mui/icons-material/Save'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserId from '../../hooks/useUserId'

import { handleError } from '../../error-handling'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Heading from '../heading'
import Button from '../button'
import TextInput from '../text-input'
import FormControls from '../form-controls'

import {
  NotificationEvents,
  NotificationMethods,
  defaultNotificationPrefs,
} from '../../notifications'
import { callFunction } from '../../firebase'
import SuccessMessage from '../success-message'
import useUserPreferences from '../../hooks/useUserPreferences'
import {
  CollectionNames,
  NotificationPreferences,
  NotificationPreferencesEvents,
  UserPreferences,
} from '../../modules/user'
import CheckboxInput from '../checkbox-input'

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  output: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
})

const getLabelForEventName = (
  eventName: keyof typeof NotificationEvents
): string => {
  switch (eventName) {
    case NotificationEvents.ASSET_AMENDED:
      return 'My assets are amended with new tags'
    case NotificationEvents.ASSET_APPROVED:
      return 'My assets are approved'
    case NotificationEvents.ASSET_UNAPPROVED:
      return 'My assets are not approved'
    case NotificationEvents.ASSET_DELETED:
      return 'My assets are rejected or deleted'
    case NotificationEvents.COMMENT_ON_ASSET:
      return 'Someone comments on my assets'
    case NotificationEvents.COMMENT_ON_USER:
      return 'Someone comments on my user profile'
    case NotificationEvents.COMMENT_ON_ASSET_AMENDMENT:
      return 'Someone comments on my asset amendment'
    case NotificationEvents.COMMENT_ON_REPORT:
      return 'Someone comments on my report'
    case NotificationEvents.TAGGED_IN_COMMENT:
      return 'Someone mentions me in a comment or social post'
    case NotificationEvents.AWARD_GIVEN:
      return 'You are given an award'
    case NotificationEvents.ASSET_NEEDS_APPROVAL:
      return 'An asset needs approval (staff only)'
    case NotificationEvents.REPORT_CREATED:
      return 'A report has been created (staff only)'
    case NotificationEvents.ASSET_OWNERSHIP_CHANGED:
      return 'You are given ownership of an asset'
    case NotificationEvents.ASSET_AMENDMENT_APPROVED:
      return 'Your asset amendment is approved'
    case NotificationEvents.ASSET_AMENDMENT_REJECTED:
      return 'Your asset amendment is rejected'
    case NotificationEvents.PRIVATE_MESSAGE_RECEIVED:
      return 'Someone sent you a private message'
    case NotificationEvents.DIGEST:
      return 'Get the weekly digest! (email only)'
    case NotificationEvents.SUBSCRIPTION_ALERT:
      return 'Subscription alerts'
    default:
      return `Unknown event ${eventName}`
  }
}

const getLabelForMethodName = (
  methodName: keyof typeof NotificationMethods
): string => {
  switch (methodName) {
    case NotificationMethods.WEB:
      return 'Notification in the website (top right corner)'
    case NotificationMethods.EMAIL:
      return 'Email'
    default:
      return `Unknown method ${methodName}`
  }
}

const mergeInEvents = (
  newEvents: NotificationPreferencesEvents
): NotificationPreferencesEvents => {
  const finalEvents: NotificationPreferencesEvents = {}

  for (const eventName in defaultNotificationPrefs.events) {
    if (eventName in newEvents) {
      finalEvents[eventName] = newEvents[eventName]
    } else {
      finalEvents[eventName] = defaultNotificationPrefs.events[eventName]
    }
  }

  return finalEvents
}

const mergeInNotificationPrefs = (newPrefs: NotificationPreferences) => {
  return {
    // TODO: Merge in methods too? Only if we add a new one
    methods: newPrefs.methods,
    events: mergeInEvents(newPrefs.events),
  }
}

const newPrefsButDisabled = {
  ...defaultNotificationPrefs,
  events: Object.keys(defaultNotificationPrefs.events).reduce(
    (newVal, key) => ({
      ...newVal,
      [key]: false,
    }),
    {}
  ),
}

type AnonymousDetails = any

const useAnonymousSave = (
  anonymousDetails: AnonymousDetails
): [
  boolean,
  boolean,
  boolean,
  (
    newPrefs: NotificationPreferences,
    unsubscribeFromEverything?: boolean
  ) => void
] => {
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // TODO: Store last error code
  const [isError, setIsError] = useState(false)

  const save = async (
    newPrefs: NotificationPreferences,
    unsubscribeFromEverything = false
  ) => {
    try {
      setIsSaving(true)
      setIsSuccess(false)
      setIsError(false)

      const {
        data: { error },
      } = await callFunction<
        {
          anonymousDetails: AnonymousDetails
          newPrefs: NotificationPreferences
        },
        { error?: string }
      >('saveNotificationPrefs', {
        anonymousDetails,
        newPrefs: unsubscribeFromEverything ? newPrefsButDisabled : newPrefs,
      })

      if (error) {
        console.error('Error from saveNotificationPrefs', error)
        setIsSaving(false)
        setIsSuccess(false)
        setIsError(true)
      } else {
        setIsSaving(false)
        setIsSuccess(true)
        setIsError(false)
      }
    } catch (err) {
      console.error('Failed to anonymously save', err)
      handleError(err)

      setIsSaving(false)
      setIsSuccess(false)
      setIsError(true)
    }
  }

  return [isSaving, isSuccess, isError, save]
}

const NotificationSettings = ({
  anonymousDetails,
}: {
  anonymousDetails?: AnonymousDetails
}) => {
  const myUserId = useUserId()
  const [
    isLoadingPreferences,
    lastErrorCodeLoadingPreferences,
    userPreferences,
  ] = useUserPreferences()
  const [isSaving, isSaveSuccess, lastErrorCodeSaving, save] =
    useDatabaseSave<UserPreferences>(CollectionNames.UserPreferences, myUserId)
  const [newPrefs, setNewPrefs] = useState(defaultNotificationPrefs)
  const [notificationEmail, setNotificationEmail] = useState('')
  const classes = useStyles()
  const [
    isAnonymouslySaving,
    isAnonymouslySaveSuccess,
    isAnonymouslySaveError,
    saveAnonymously,
  ] = useAnonymousSave(anonymousDetails)

  useEffect(() => {
    if (!userPreferences) {
      return
    }
    if (userPreferences.notificationprefs) {
      setNewPrefs(mergeInNotificationPrefs(userPreferences.notificationprefs))
    }
    if (userPreferences.notificationemail) {
      setNotificationEmail(userPreferences.notificationemail)
    }
  }, [userPreferences !== null])

  if (isLoadingPreferences || !userPreferences || isSaving) {
    return (
      <LoadingIndicator
        message={`${isSaving ? 'Saving' : 'Loading'} preferences...`}
      />
    )
  }

  if (lastErrorCodeLoadingPreferences !== null) {
    return (
      <ErrorMessage>
        Failed to load your profile (code {lastErrorCodeLoadingPreferences})
      </ErrorMessage>
    )
  }

  const onChangeEvent = (
    newVal: boolean,
    eventName: keyof typeof NotificationEvents
  ) => {
    setNewPrefs((currentVal) => ({
      ...currentVal,
      events: {
        ...currentVal.events,
        [eventName]: newVal,
      },
    }))
  }

  const onChangeMethod = (
    newVal: boolean,
    methodName: keyof typeof NotificationMethods
  ) => {
    setNewPrefs((currentVal) => ({
      ...currentVal,
      methods: {
        ...currentVal.methods,
        [methodName]: newVal,
      },
    }))
  }

  const onSaveClick = async () => {
    try {
      if (anonymousDetails) {
        console.debug(`Saving anonymously...`)

        saveAnonymously(newPrefs)
        return
      }

      console.debug(`Saving preferences...`)

      await save({
        notificationprefs: newPrefs,
        notificationemail: notificationEmail,
      })
    } catch (err) {
      console.error('Failed to save user preferences', err)
      handleError(err)
    }
  }

  if (anonymousDetails) {
    if (isAnonymouslySaveSuccess) {
      return (
        <SuccessMessage>
          Your preferences have been saved successfully
        </SuccessMessage>
      )
    }

    if (isAnonymouslySaveError) {
      return (
        <ErrorMessage>
          Failed to save your notification preferences
        </ErrorMessage>
      )
    }

    if (isAnonymouslySaving) {
      return (
        <LoadingIndicator message="Saving your notification preferences..." />
      )
    }
  }

  return (
    <div className={classes.root}>
      {anonymousDetails ? (
        <>
          <Button
            onClick={() => saveAnonymously(newPrefs, true)}
            isDisabled={isSaving}>
            Unsubscribe From Everything
          </Button>
          <br />
        </>
      ) : null}
      <Heading variant="h4">Events</Heading>
      <p>Choose what kind of events you want to subscribe to.</p>
      {Object.keys(NotificationEvents).map((eventName) => (
        <CheckboxInput
          key={eventName}
          value={newPrefs.events[eventName] !== false}
          onChange={(newVal) =>
            onChangeEvent(newVal, eventName as keyof typeof NotificationEvents)
          }
          label={getLabelForEventName(
            eventName as keyof typeof NotificationEvents
          )}
          fullWidth
          isDisabled={isSaving}
        />
      ))}
      <Heading variant="h4">Methods</Heading>
      <p>Choose how you want to receive your notifications.</p>
      {Object.keys(NotificationMethods)
        .filter((methodName) => methodName !== NotificationMethods.DISCORD)
        .map((methodName) => (
          <CheckboxInput
            key={methodName}
            value={newPrefs.events[methodName] !== false}
            onChange={(newVal) =>
              onChangeMethod(
                newVal,
                methodName as keyof typeof NotificationMethods
              )
            }
            label={getLabelForMethodName(
              methodName as keyof typeof NotificationMethods
            )}
            fullWidth
            isDisabled={isSaving}
          />
        ))}
      {!anonymousDetails ? (
        <>
          <Heading variant="h4">Preferred Email</Heading>
          <p>
            If you want to receive your notifications at a different email you
            can enter it here (or leave it blank to use your sign up one).
          </p>
          <TextInput
            onChange={(e) => setNotificationEmail(e.target.value)}
            value={notificationEmail}
            placeholder="eg. notifyme@hotmail.com"
            fullWidth
          />
        </>
      ) : null}
      {lastErrorCodeSaving !== null ? (
        <ErrorMessage>Failed to save. Please try again</ErrorMessage>
      ) : isSaveSuccess ? (
        <SuccessMessage>Saved successfully</SuccessMessage>
      ) : null}
      <FormControls>
        <Button onClick={onSaveClick} isDisabled={isSaving} icon={<SaveIcon />}>
          Save
        </Button>
      </FormControls>
    </div>
  )
}

export default NotificationSettings
