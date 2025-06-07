import React, { useState, useEffect } from 'react'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'

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
  const [isLoadingPreferences, isErrorLoadingPreferences, userPreferences] =
    useUserPreferences()
  const [isSaving, isSaveSuccess, isSaveError, save] =
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

  if (isErrorLoadingPreferences) {
    return <ErrorMessage>Failed to load your profile</ErrorMessage>
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save your changes</ErrorMessage>
  }

  const onChangeEvent = (
    e: React.SyntheticEvent<HTMLInputElement>,
    eventName: keyof typeof NotificationEvents
  ) => {
    setNewPrefs((currentVal) => ({
      ...currentVal,
      events: {
        ...currentVal.events,
        [eventName]: (e.target as HTMLInputElement).checked,
      },
    }))
  }

  const onChangeMethod = (
    e: React.SyntheticEvent<HTMLInputElement>,
    methodName: keyof typeof NotificationMethods
  ) => {
    setNewPrefs((currentVal) => ({
      ...currentVal,
      methods: {
        ...currentVal.methods,
        [methodName]: (e.target as HTMLInputElement).checked,
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
          <Button onClick={() => saveAnonymously(newPrefs, true)}>
            Unsubscribe From Everything
          </Button>
          <br />
        </>
      ) : null}
      <Heading variant="h4">Events</Heading>
      <p>Choose what kind of events you want to subscribe to.</p>
      {Object.keys(NotificationEvents).map((eventName) => (
        <div key={eventName}>
          <FormControlLabel
            key={eventName}
            control={
              <Checkbox
                checked={newPrefs.events[eventName] !== false}
                onChange={(e) =>
                  onChangeEvent(e, eventName as keyof typeof NotificationEvents)
                }
              />
            }
            label={getLabelForEventName(
              eventName as keyof typeof NotificationEvents
            )}
          />
        </div>
      ))}
      <Heading variant="h4">Methods</Heading>
      <p>Choose how you want to receive your notifications.</p>
      {Object.keys(NotificationMethods)
        .filter((methodName) => methodName !== NotificationMethods.DISCORD)
        .map((methodName) => (
          <div key={methodName}>
            <FormControlLabel
              key={methodName}
              control={
                <Checkbox
                  checked={newPrefs.methods[methodName] !== false}
                  onChange={(e) =>
                    onChangeMethod(
                      e,
                      methodName as keyof typeof NotificationMethods
                    )
                  }
                />
              }
              label={getLabelForMethodName(
                methodName as keyof typeof NotificationMethods
              )}
            />
          </div>
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
      <br />
      <br />
      <FormControls>
        <Button onClick={onSaveClick} isDisabled={isSaving} icon={<SaveIcon />}>
          Save
        </Button>
      </FormControls>
      {isSaveError ? (
        <ErrorMessage>Failed to save. Please try again</ErrorMessage>
      ) : isSaveSuccess ? (
        <SuccessMessage>Saved successfully</SuccessMessage>
      ) : null}
    </div>
  )
}

export default NotificationSettings
