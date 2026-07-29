import React, { useState, useEffect } from 'react'
import { makeStyles } from '@mui/styles'
import SaveIcon from '@mui/icons-material/Save'

import { callFunction } from '@/firebase'
import { handleError } from '@/error-handling'
import {
  NotificationEvent,
  NotificationMethod,
  defaultNotificationPrefs,
} from '@/notifications'
import {
  CollectionNames,
  NotificationPreferences,
  NotificationPreferencesEvents,
  UserPreferences,
} from '@/modules/users'

import useDataStoreEdit from '@/hooks/useDataStoreEdit'
import useUserId from '@/hooks/useUserId'
import useUserPreferences from '@/hooks/useUserPreferences'

import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import Heading from '@/components/heading'
import Button from '@/components/button'
import TextInput from '@/components/text-input'
import FormControls from '@/components/form-controls'
import SuccessMessage from '@/components/success-message'
import CheckboxInput from '@/components/checkbox-input'

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  output: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
})

const getLabelForEventName = (eventName: NotificationEvent): string => {
  switch (eventName) {
    case NotificationEvent.ASSET_AMENDED:
      return 'My assets are amended by someone'
    case NotificationEvent.ASSET_APPROVED:
      return 'My assets are approved'
    case NotificationEvent.ASSET_UNAPPROVED:
      return 'My assets are declined'
    case NotificationEvent.ASSET_DELETED:
      return 'My assets are rejected or deleted'
    case NotificationEvent.COMMENT_ON_ASSET:
      return 'Someone comments on my assets'
    case NotificationEvent.COMMENT_ON_USER:
      return 'Someone comments on my user profile'
    case NotificationEvent.COMMENT_ON_ASSET_AMENDMENT:
      return 'Someone comments on my amendment'
    case NotificationEvent.COMMENT_ON_REPORT:
      return 'Someone comments on my report'
    case NotificationEvent.TAGGED_IN_COMMENT:
      return 'Someone mentions me in a comment or social post'
    case NotificationEvent.AWARD_GIVEN:
      return 'You are given an award'
    case NotificationEvent.ASSET_NEEDS_APPROVAL:
      return 'An asset needs approval (staff only)'
    case NotificationEvent.REPORT_CREATED:
      return 'A report has been created (staff only)'
    case NotificationEvent.ASSET_OWNERSHIP_CHANGED:
      return 'You are given ownership of an asset'
    case NotificationEvent.ASSET_AMENDMENT_APPROVED:
      return 'Your amendment is approved'
    case NotificationEvent.ASSET_AMENDMENT_REJECTED:
      return 'Your amendment is rejected'
    case NotificationEvent.PRIVATE_MESSAGE_RECEIVED:
      return 'Someone sent you a private message'
    case NotificationEvent.DIGEST:
      return 'Get the weekly digest! (email only)'
    case NotificationEvent.SUBSCRIPTION_ALERT:
      return 'Subscription alerts'
    case NotificationEvent.REPORT_RESOLUTION_CHANGED:
      return 'Report or support ticket resolution changed'
    case NotificationEvent.REP_AWARDED:
      return 'Reputation awarded'
    case NotificationEvent.USER_CHANGED:
      return 'Your account has been changed (banned, etc.)'
    case NotificationEvent.EVENT_APPROVED:
      return 'Your event has been approved'
    case NotificationEvent.EVENT_FEATURED:
      return 'Your event has been featured'
    default:
      return `Unknown event ${eventName}`
  }
}

const getLabelForMethodName = (methodName: NotificationMethod): string => {
  switch (methodName) {
    case NotificationMethod.Web:
      return 'Notification in the website (top right corner)'
    case NotificationMethod.Email:
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
      finalEvents[eventName] =
        defaultNotificationPrefs.events[eventName as NotificationEvent]
    }
  }

  return finalEvents
}

const mergeInNotificationPrefs = (
  newPrefs: NotificationPreferences
): NotificationPreferences => {
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

type AnonymousDetails = {
  userId: string
  email: string
}

enum ErrorCode {
  UserNotFound,
  Unknown,
}

const mapErrorToErrorCode = (err: Error): ErrorCode => {
  if (err.message.includes('There is no user')) {
    return ErrorCode.UserNotFound
  }
  // TODO: Pass around error codes
  if (err.message.includes('Those details are incorrect')) {
    return ErrorCode.UserNotFound
  }
  return ErrorCode.Unknown
}

const useAnonymousSave = (
  anonymousDetails?: AnonymousDetails
): [
  boolean,
  boolean,
  null | ErrorCode,
  (
    newPrefs: NotificationPreferences,
    unsubscribeFromEverything?: boolean
  ) => void
] => {
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<null | ErrorCode>(null)

  const save = async (
    newPrefs: NotificationPreferences,
    unsubscribeFromEverything = false
  ) => {
    if (!anonymousDetails) {
      return
    }

    try {
      setIsSaving(true)
      setIsSuccess(false)
      setLastErrorCode(null)

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
        throw new Error(`Failed: ${error}`)
      } else {
        setIsSaving(false)
        setIsSuccess(true)
        setLastErrorCode(null)
      }
    } catch (err) {
      console.error('Failed to anonymously save', err)
      handleError(err)

      setIsSaving(false)
      setIsSuccess(false)
      setLastErrorCode(mapErrorToErrorCode(err as Error))
    }
  }

  return [isSaving, isSuccess, lastErrorCode, save]
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
    useDataStoreEdit<UserPreferences>(
      CollectionNames.UserPreferences,
      myUserId || false
    )
  const [newPrefs, setNewPrefs] = useState<NotificationPreferences>(
    defaultNotificationPrefs
  )
  const [notificationEmail, setNotificationEmail] = useState('')
  const classes = useStyles()
  const [
    isAnonymouslySaving,
    isAnonymouslySaveSuccess,
    lastAnonymouslySaveErrorCode,
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

  const isBusy = isSaving || isAnonymouslySaving

  if ((isLoadingPreferences || !userPreferences) && !anonymousDetails) {
    return <LoadingIndicator message={`Loading preferences...`} />
  }

  if (lastErrorCodeLoadingPreferences !== null) {
    return (
      <ErrorMessage>
        Failed to load your profile (code {lastErrorCodeLoadingPreferences})
      </ErrorMessage>
    )
  }

  const onChangeEvent = (eventName: NotificationEvent, newVal: boolean) => {
    setNewPrefs((currentVal) => ({
      ...currentVal,
      events: {
        ...currentVal.events,
        [eventName]: newVal,
      },
    }))
  }

  const onChangeMethod = (methodName: NotificationMethod, newVal: boolean) => {
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

  return (
    <div className={classes.root}>
      {anonymousDetails ? (
        <>
          <Button
            onClick={() => saveAnonymously(newPrefs, true)}
            isDisabled={isBusy}>
            Unsubscribe From Everything
          </Button>
          <br />
        </>
      ) : null}
      <Heading variant="h4">Events</Heading>
      <p>Choose what kind of events you want to subscribe to.</p>
      {Object.values(NotificationEvent).map((eventName) => (
        <CheckboxInput
          key={eventName}
          value={newPrefs.events[eventName] !== false}
          onChange={(newVal) =>
            onChangeEvent(eventName as NotificationEvent, newVal)
          }
          label={getLabelForEventName(eventName as NotificationEvent)}
          fullWidth
          isDisabled={isBusy}
        />
      ))}
      <Heading variant="h4">Methods</Heading>
      <p>Choose how you want to receive your notifications.</p>
      {Object.values(NotificationMethod)
        .filter((methodName) => methodName !== NotificationMethod.Discord)
        .map((methodName) => (
          <CheckboxInput
            key={methodName}
            value={newPrefs.methods[methodName] !== false}
            onChange={(newVal) =>
              onChangeMethod(methodName as NotificationMethod, newVal)
            }
            label={getLabelForMethodName(methodName as NotificationMethod)}
            fullWidth
            isDisabled={isBusy}
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
            isDisabled={isBusy}
          />
        </>
      ) : null}
      {isAnonymouslySaving || isBusy ? (
        <LoadingIndicator message="Saving..." />
      ) : null}
      {lastAnonymouslySaveErrorCode !== null ? (
        <ErrorMessage>
          Failed to save your preferences
          {lastAnonymouslySaveErrorCode === ErrorCode.UserNotFound
            ? `: your account could not be found with the link you clicked on (${anonymousDetails?.userId}, ${anonymousDetails?.email})`
            : ` (code ${lastAnonymouslySaveErrorCode})`}
        </ErrorMessage>
      ) : lastErrorCodeSaving !== null ? (
        <ErrorMessage>
          Failed to save your preferences (code {lastErrorCodeSaving})
        </ErrorMessage>
      ) : null}
      {isSaveSuccess || isAnonymouslySaveSuccess ? (
        <SuccessMessage>Preferences saved successfully</SuccessMessage>
      ) : null}
      <FormControls>
        <Button onClick={onSaveClick} isDisabled={isBusy} icon={<SaveIcon />}>
          Save
        </Button>
      </FormControls>
    </div>
  )
}

export default NotificationSettings
