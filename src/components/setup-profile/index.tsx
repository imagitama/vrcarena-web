import React, { useState } from 'react'
import { useLocation } from 'react-router'
import { makeStyles } from '@material-ui/core/styles'
import FlagIcon from '@material-ui/icons/Flag'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

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
import {
  defaultNotificationPrefs,
  NotificationEvents,
} from '../../notifications'
import CheckboxInput from '../checkbox-input'
import FormControls from '../form-controls'
import UsernameEditor from '../username-editor'
import Tabs, { useTabs } from '../tabs'
import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import { UserPreferences, CollectionNames } from '../../modules/user'

const useStyles = makeStyles({
  root: {
    margin: '2rem auto',
    textAlign: 'center',
    [mediaQueryForMobiles]: {
      width: '100%',
    },
  },
  input: {
    width: '100%',
    maxWidth: '500px',
  },
  checkboxRow: {
    textAlign: 'center',
  },
  finalStep: {
    width: '50%',
    margin: '0 auto',
    [mediaQueryForMobiles]: {
      width: '100%',
    },
  },
  digestInfo: {
    margin: '1rem 0 2rem',
    fontStyle: 'italic',
    fontSize: '80%',
  },
  tabPanel: {
    display: 'flex',
    justifyContent: 'center',
    '& > *': {
      width: '100%',
      maxWidth: '700px',
    },
  },
  formControls: {
    marginTop: '2rem',
  },
})

const TabPanel = ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles()
  return (
    <div className={classes.tabPanel}>
      <div>{children}</div>
    </div>
  )
}

const TabControls = ({
  onFinish,
  isCreating,
}: {
  onFinish: () => void
  isCreating: boolean
}) => {
  const { count, activeTabIdx, back, next } = useTabs()
  const [, , user] = useUserRecord()
  const classes = useStyles()
  return (
    <FormControls className={classes.formControls}>
      <Button
        icon={<ChevronLeftIcon />}
        color="tertiary"
        size="large"
        isDisabled={activeTabIdx === 0}
        onClick={back}
        switchIconSide>
        Back
      </Button>{' '}
      {activeTabIdx === count - 1 ? (
        <Button
          onClick={onFinish}
          isDisabled={isCreating || (user && !user.username)}
          size="large"
          color="tertiary"
          icon={<FlagIcon />}>
          Finish
        </Button>
      ) : (
        <Button
          icon={<ChevronRightIcon />}
          color="tertiary"
          size="large"
          onClick={next}>
          Next
        </Button>
      )}
    </FormControls>
  )
}

export default ({
  analyticsCategory,
  onDone,
}: {
  analyticsCategory: string
  onDone: () => void
}) => {
  const userId = useUserId()
  const [isLoadingUser, , user, hydrate] = useUserRecord()
  const [isCreating, isCreateSuccess, lastCreateErrorCode, save] =
    useDataStoreEdit<UserPreferences>(
      CollectionNames.UserPreferences,
      userId || false
    )
  const [subscribeToDigest, setSubscribeToDigest] = useState(false)
  const location = useLocation()
  const classes = useStyles()

  if (location.pathname === routes.login) {
    return null
  }

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

  if (lastCreateErrorCode) {
    return (
      <ErrorMessage>
        Failed to create your profile (code {lastCreateErrorCode})
      </ErrorMessage>
    )
  }

  const onFinish = async () => {
    try {
      trackAction(analyticsCategory, 'Click finish button')

      const notificationPrefs = {
        ...defaultNotificationPrefs,
        events: {
          ...defaultNotificationPrefs.events,
          [NotificationEvents.DIGEST]: subscribeToDigest,
        },
      }

      await save({
        notificationprefs: notificationPrefs,
      })

      hydrate()

      onDone()
    } catch (err) {
      console.error('Failed to save preferences', err)
      handleError(err)
    }
  }

  return (
    <div className={classes.root}>
      <Heading variant="h1">Welcome to VRCArena</Heading>
      <Heading variant="h2">Set up your profile</Heading>

      <Tabs
        horizontal
        items={[
          {
            name: 'favorite-species',
            label: 'Species',
            contents: (
              <TabPanel>
                <FavoriteSpeciesEditor analyticsCategory={analyticsCategory} />
              </TabPanel>
            ),
          },
          {
            name: 'vr-platforms',
            label: 'VR',
            contents: (
              <TabPanel>
                {/* @ts-ignore */}
                <VrPlatformChooser analyticsCategory={analyticsCategory} />{' '}
              </TabPanel>
            ),
          },
          {
            name: 'newsletter',
            label: 'Settings',
            contents: (
              <TabPanel>
                <div>
                  <CheckboxInput
                    label="Subscribe to our weekly newsletter"
                    onChange={() =>
                      setSubscribeToDigest((currentVal) => !currentVal)
                    }
                    value={subscribeToDigest}
                  />
                  <div className={classes.digestInfo}>
                    Read a summary of new assets posted on the site. Sent every
                    Sunday. You can unsubscribe at any time.
                  </div>
                </div>
              </TabPanel>
            ),
          },
          {
            name: 'username',
            label: 'Username (required)',
            contents: (
              <TabPanel>
                <UsernameEditor />
              </TabPanel>
            ),
          },
        ]}>
        <TabControls onFinish={onFinish} isCreating={isCreating} />
      </Tabs>
    </div>
  )
}
