import React, { useState, useEffect } from 'react'
import { makeStyles } from '@mui/styles'
import SaveIcon from '@mui/icons-material/Save'

import useUserId from '../../hooks/useUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import useDataStoreItem from '../../hooks/useDataStoreItem'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Button from '../button'
import TextInput from '../text-input'
import { CollectionNames } from '../../modules/user'
import { SocialMediaUsernames, User } from '../../modules/users'
import FormControls from '../form-controls'
import SuccessMessage from '../success-message'

const useStyles = makeStyles({
  field: {
    width: '100%',
    display: 'flex',
    padding: '1rem 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  label: {
    marginTop: '1rem',
    fontWeight: 'bold',
    width: '25%',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    '& > div': {
      width: '100%',
    },
  },
  hint: {
    fontSize: '75%',
    marginTop: '0.5rem',
    opacity: '0.75',
  },
  controls: {
    marginTop: '2rem',
  },
})

const Label = ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles()
  return <div className={classes.label}>{children}</div>
}

const Input = ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles()
  return <div className={classes.input}>{children}</div>
}

const Hint = ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles()
  return <div className={classes.hint}>{children}</div>
}

const Field = ({ children }: { children: React.ReactNode }) => {
  const classes = useStyles()
  return <div className={classes.field}>{children}</div>
}

export default ({ onSaveClick }: { onSaveClick?: () => void }) => {
  const userId = useUserId()
  const [, , profile] = useDataStoreItem<User>(
    CollectionNames.Users,
    userId || false,
    'social-media-usernames-editor'
  )
  const [isSaving, isSaveSuccess, lastErrorCode, save] = useDatabaseSave(
    CollectionNames.Users,
    userId
  )

  const [formFieldValues, setFormFieldValues] = useState<SocialMediaUsernames>({
    vrchatuserid: '',
    vrchatusername: '',
    discordusername: '',
    twitterusername: '',
    telegramusername: '',
    youtubechannelid: '',
    twitchusername: '',
    patreonusername: '',
    neosvrusername: '',
    chilloutvrusername: '',
  })

  useEffect(() => {
    if (!profile) {
      return
    }

    console.debug(`Updating editor with fields...`, profile)

    setFormFieldValues({
      vrchatuserid: profile.vrchatuserid || '',
      vrchatusername: profile.vrchatusername || '',
      discordusername: profile.discordusername || '',
      twitterusername: profile.twitterusername || '',
      telegramusername: profile.telegramusername || '',
      youtubechannelid: profile.youtubechannelid || '',
      twitchusername: profile.twitchusername || '',
      patreonusername: profile.patreonusername || '',
      neosvrusername: profile.neosvrusername || '',
      chilloutvrusername: profile.chilloutvrusername || '',
    })
  }, [profile && profile.id])

  const onSaveBtnClick = async () => {
    try {
      if (onSaveClick) {
        onSaveClick()
      }

      await save({
        ...formFieldValues,
      })
    } catch (err) {
      console.error('Failed to save social media fields to database', err)
      handleError(err)
    }
  }

  const updateFormFieldValue = (
    name: keyof SocialMediaUsernames,
    newVal: string
  ) =>
    setFormFieldValues({
      ...formFieldValues,
      [name]: newVal,
    })

  return (
    <>
      <Field>
        <Label>VRChat User ID</Label>
        <Input>
          <TextInput
            value={formFieldValues.vrchatuserid}
            onChange={(e) =>
              updateFormFieldValue('vrchatuserid', e.target.value)
            }
            isDisabled={isSaving}
            fullWidth
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
          <TextInput
            value={formFieldValues.vrchatusername}
            onChange={(e) =>
              updateFormFieldValue('vrchatusername', e.target.value)
            }
            isDisabled={isSaving}
            fullWidth
          />
          <Hint>Displayed on your profile and for linking your account.</Hint>
        </Input>
      </Field>
      <Field>
        <Label>Discord username</Label>
        <Input>
          <TextInput
            value={formFieldValues.discordusername}
            onChange={(e) =>
              updateFormFieldValue('discordusername', e.target.value)
            }
            isDisabled={isSaving}
            fullWidth
          />
          <Hint>eg. MyName#1234</Hint>
        </Input>
      </Field>
      <Field>
        <Label>Twitter username</Label>
        <Input>
          <TextInput
            value={formFieldValues.twitterusername}
            onChange={(e) =>
              updateFormFieldValue('twitterusername', e.target.value)
            }
            isDisabled={isSaving}
            fullWidth
          />
          <Hint>Without the @ symbol eg. MyTwitterName</Hint>
        </Input>
      </Field>
      <Field>
        <Label>Telegram username</Label>
        <Input>
          <TextInput
            value={formFieldValues.telegramusername}
            onChange={(e) =>
              updateFormFieldValue('telegramusername', e.target.value)
            }
            isDisabled={isSaving}
            fullWidth
          />
          <Hint>Without @ symbol eg. MyTelegramUsername</Hint>
        </Input>
      </Field>
      <Field>
        <Label>YouTube channel ID</Label>
        <Input>
          <TextInput
            value={formFieldValues.youtubechannelid}
            onChange={(e) =>
              updateFormFieldValue('youtubechannelid', e.target.value)
            }
            isDisabled={isSaving}
            fullWidth
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
          <TextInput
            value={formFieldValues.twitchusername}
            onChange={(e) =>
              updateFormFieldValue('twitchusername', e.target.value)
            }
            isDisabled={isSaving}
            fullWidth
          />
        </Input>
      </Field>
      <Field>
        <Label>Patreon username</Label>
        <Input>
          <TextInput
            value={formFieldValues.patreonusername}
            onChange={(e) =>
              updateFormFieldValue('patreonusername', e.target.value)
            }
            isDisabled={isSaving}
            fullWidth
          />
          <Hint>The name in the URL like https://patreon.com/[username]</Hint>
        </Input>
      </Field>
      {isSaving && <LoadingIndicator message="Saving..." />}
      {isSaveSuccess ? (
        <SuccessMessage>
          Your social media accounts have been saved
        </SuccessMessage>
      ) : lastErrorCode ? (
        <ErrorMessage>Failed to save (code {lastErrorCode})</ErrorMessage>
      ) : null}
      <FormControls>
        <Button
          onClick={onSaveBtnClick}
          isDisabled={isSaving}
          icon={<SaveIcon />}
          size="large">
          Save
        </Button>
      </FormControls>
    </>
  )
}
