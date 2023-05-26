import React, { useState, useEffect } from 'react'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, {
  CollectionNames,
  UserFieldNames
} from '../../hooks/useDatabaseQuery'
import useUserId from '../../hooks/useUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Button from '../button'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import useDataStoreItem from '../../hooks/useDataStoreItem'

const useStyles = makeStyles({
  field: {
    width: '100%',
    display: 'flex',
    padding: '1rem 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    '&:last-child': {
      borderBottom: 'none'
    }
  },
  label: {
    marginTop: '1rem',
    fontWeight: 'bold',
    width: '25%',
    flexShrink: 0
  },
  input: {
    flex: 1,
    '& > div': {
      width: '100%'
    },
    '& input': {
      paddingTop: '12px'
    }
  },
  hint: {
    fontSize: '75%',
    marginTop: '0.5rem',
    opacity: '0.75'
  },
  controls: {
    marginTop: '2rem'
  }
})

const Label = ({ children }) => {
  const classes = useStyles()
  return <div className={classes.label}>{children}</div>
}

const Input = ({ children }) => {
  const classes = useStyles()
  return <div className={classes.input}>{children}</div>
}

const Hint = ({ children }) => {
  const classes = useStyles()
  return <div className={classes.hint}>{children}</div>
}

const Field = ({ children }) => {
  const classes = useStyles()
  return <div className={classes.field}>{children}</div>
}

export default ({ onSaveClick = null }) => {
  const classes = useStyles()
  const userId = useUserId()
  const [isLoadingProfile, isErroredLoadingProfile, profile] = useDataStoreItem(
    CollectionNames.Users,
    userId,
    'social-media-usernames-editor'
  )
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Users,
    userId
  )

  const [formFieldValues, setFormFieldValues] = useState({
    [UserFieldNames.vrchatUserId]: '',
    [UserFieldNames.vrchatUsername]: '',
    [UserFieldNames.discordUsername]: '',
    [UserFieldNames.twitterUsername]: '',
    [UserFieldNames.telegramUsername]: '',
    [UserFieldNames.youtubeChannelId]: '',
    [UserFieldNames.twitchUsername]: '',
    [UserFieldNames.patreonUsername]: ''
  })

  useEffect(() => {
    if (!profile) {
      return
    }
    console.debug(`Updating editor with fields...`, profile)
    setFormFieldValues({
      [UserFieldNames.vrchatUserId]: profile[UserFieldNames.vrchatUserId] || '',
      [UserFieldNames.vrchatUsername]:
        profile[UserFieldNames.vrchatUsername] || '',
      [UserFieldNames.discordUsername]:
        profile[UserFieldNames.discordUsername] || '',
      [UserFieldNames.twitterUsername]:
        profile[UserFieldNames.twitterUsername] || '',
      [UserFieldNames.telegramUsername]:
        profile[UserFieldNames.telegramUsername] || '',
      [UserFieldNames.youtubeChannelId]:
        profile[UserFieldNames.youtubeChannelId] || '',
      [UserFieldNames.twitchUsername]:
        profile[UserFieldNames.twitchUsername] || '',
      [UserFieldNames.patreonUsername]:
        profile[UserFieldNames.patreonUsername] || ''
    })
  }, [profile && profile.id])

  const onSaveBtnClick = async () => {
    try {
      if (onSaveClick) {
        onSaveClick()
      }

      await save({
        ...formFieldValues
      })
    } catch (err) {
      console.error('Failed to save social media fields to database', err)
      handleError(err)
    }
  }

  const updateFormFieldValue = (name, newVal) =>
    setFormFieldValues({
      ...formFieldValues,
      [name]: newVal
    })

  if (isLoadingProfile) {
    return <LoadingIndicator />
  }

  if (isErroredLoadingProfile) {
    return <ErrorMessage>Failed to lookup your user profile</ErrorMessage>
  }

  return (
    <>
      <Field>
        <Label>VRChat User ID</Label>
        <Input>
          <TextField
            variant="filled"
            value={formFieldValues[UserFieldNames.vrchatUserId]}
            onChange={e =>
              updateFormFieldValue(UserFieldNames.vrchatUserId, e.target.value)
            }
          />
          <Hint>
            To find your ID, log in to VRChat website, click your username and
            your ID is https://vrchat.com/home/user/[YOUR_ID]
            <br />
          </Hint>
        </Input>
      </Field>
      <Field>
        <Label>VRChat Username</Label>
        <Input>
          <TextField
            variant="filled"
            value={formFieldValues[UserFieldNames.vrchatUsername]}
            onChange={e =>
              updateFormFieldValue(
                UserFieldNames.vrchatUsername,
                e.target.value
              )
            }
          />
          <Hint>For display purposes only.</Hint>
        </Input>
      </Field>
      <Field>
        <Label>Discord username</Label>
        <Input>
          <TextField
            variant="filled"
            value={formFieldValues[UserFieldNames.discordUsername]}
            onChange={e =>
              updateFormFieldValue(
                UserFieldNames.discordUsername,
                e.target.value
              )
            }
          />
          <Hint>eg. MyName#1234</Hint>
        </Input>
      </Field>
      <Field>
        <Label>Twitter username</Label>
        <Input>
          <TextField
            variant="filled"
            value={formFieldValues[UserFieldNames.twitterUsername]}
            onChange={e =>
              updateFormFieldValue(
                UserFieldNames.twitterUsername,
                e.target.value
              )
            }
          />
          <Hint>Without the @ symbol eg. MyTwitterName</Hint>
        </Input>
      </Field>
      <Field>
        <Label>Telegram username</Label>
        <Input>
          <TextField
            variant="filled"
            value={formFieldValues[UserFieldNames.telegramUsername]}
            onChange={e =>
              updateFormFieldValue(
                UserFieldNames.telegramUsername,
                e.target.value
              )
            }
          />
          <Hint>Without @ symbol eg. MyTelegramUsername</Hint>
        </Input>
      </Field>
      <Field>
        <Label>YouTube channel ID</Label>
        <Input>
          <TextField
            variant="filled"
            value={formFieldValues[UserFieldNames.youtubeChannelId]}
            onChange={e =>
              updateFormFieldValue(
                UserFieldNames.youtubeChannelId,
                e.target.value
              )
            }
          />
          <Hint>
            Get your channel ID by visiting your channel and in the address bar
            it is https://www.youtube.com/channel/[YOUR_ID]
          </Hint>
        </Input>
      </Field>
      <Field>
        <Label>Twitch username</Label>
        <Input>
          <TextField
            variant="filled"
            value={formFieldValues[UserFieldNames.twitchUsername]}
            onChange={e =>
              updateFormFieldValue(
                UserFieldNames.twitchUsername,
                e.target.value
              )
            }
          />
        </Input>
      </Field>
      <Field>
        <Label>Patreon username</Label>
        <Input>
          <TextField
            variant="filled"
            value={formFieldValues[UserFieldNames.patreonUsername]}
            onChange={e =>
              updateFormFieldValue(
                UserFieldNames.patreonUsername,
                e.target.value
              )
            }
          />
          <Hint>The name in the URL like https://patreon.com/[username]</Hint>
        </Input>
      </Field>
      <div className={classes.controls}>
        {isSaving && 'Saving...'}
        {isSaveSuccess
          ? 'Success!'
          : isSaveError
          ? 'Failed to save. Maybe try again?'
          : null}
        <Button onClick={onSaveBtnClick} isDisabled={isSaving}>
          Save
        </Button>
      </div>
    </>
  )
}
