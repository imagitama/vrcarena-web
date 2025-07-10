import React, { useState, useEffect } from 'react'
import { makeStyles } from '@mui/styles'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import TextField from '@mui/material/TextField'
import SaveIcon from '@mui/icons-material/Save'

import useUserId from '../../hooks/useUserId'
import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import useUserRecord from '../../hooks/useUserRecord'

import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { mediaQueryForMobiles } from '../../media-queries'

import Button from '../button'
import FormControls from '../form-controls'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'

import resoniteImageUrl from './assets/images/resonite.webp'
import chilloutVrImageUrl from './assets/images/chilloutvr.webp'
import vrchatImageUrl from './assets/images/vrchat.webp'
import { CollectionNames } from '../../modules/user'
import { User } from '../../modules/users'
import SuccessMessage from '../success-message'
import CheckboxInput from '../checkbox-input'

const useStyles = makeStyles({
  intro: {
    fontSize: '150%',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  cards: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  card: {
    width: '33.3%',
    maxWidth: '400px',
    flexDirection: 'column',
    '&:nth-child(2)': {
      margin: '0 1rem',
    },
    [mediaQueryForMobiles]: {
      width: '100%',
      margin: 0,
    },
    position: 'relative',
  },
  actionArea: {
    flex: 1,
  },
  image: {
    width: '100%',
    '& img': {
      width: '100%',
    },
  },
  checkbox: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '0.5rem',
  },
  controls: {
    justifyContent: 'flex-end',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  usernameInputItem: {
    padding: '0.5rem',
    opacity: 0.5,
    transition: 'all 100ms',
  },
  selected: {
    opacity: 1,
  },
  usernameInput: {
    width: '100%',
  },
  cardContent: {
    marginBottom: '2rem',
  },
})

enum VrPlatformName {
  VRCHAT = 'VRCHAT',
  CHILLOUTVR = 'CHILLOUTVR',
  NEOSVR = 'NEOSVR',
}

interface VrPlatformInfo {
  name: VrPlatformName
  title: string
  websiteUrl: string
  description: string
  imageUrl: string
  field: keyof User
}

const vrPlatforms: VrPlatformInfo[] = [
  {
    name: VrPlatformName.VRCHAT,
    title: 'VRChat',
    websiteUrl: 'https://hello.vrchat.com/',
    description:
      'A free-to-play massively multiplayer online virtual reality social platform created by Graham Gaylor and Jesse Joudrey.',
    imageUrl: vrchatImageUrl,
    field: 'vrchatusername',
  },
  {
    name: VrPlatformName.CHILLOUTVR,
    title: 'ChilloutVR',
    websiteUrl: 'https://store.steampowered.com/app/661130/ChilloutVR',
    description:
      'A free-to-play massively multiplayer online virtual reality platform created by Alpha Blend Interactive.',
    imageUrl: chilloutVrImageUrl,
    field: 'chilloutvrusername',
  },
  {
    name: VrPlatformName.NEOSVR,
    title: 'Resonite/Neos',
    websiteUrl: 'https://store.steampowered.com/app/2519830/Resonite',
    description:
      'A free-to-play massively multiplayer online virtual reality metaverse created by Yellow Dog Man Studios.',
    imageUrl: resoniteImageUrl,
    field: 'neosvrusername',
  },
]

export default ({
  analyticsCategory = undefined,
  onDone = undefined,
}: {
  analyticsCategory?: string
  onDone?: () => void
}) => {
  const classes = useStyles()
  const userId = useUserId()
  const [isLoadingUser, isErroredLoadingUser, user] = useUserRecord()
  const [isSaving, isSaveSuccess, lastErrorCode, save] = useDataStoreEdit<User>(
    CollectionNames.Users,
    userId!
  )

  const [selectedFields, setSelectedFields] = useState<{
    [platformName: string]: {
      isSelected: boolean
      username: string
    }
  }>(
    vrPlatforms.reduce(
      (initialState, platform) => ({
        ...initialState,
        [platform.name]: {
          isSelected: false,
          username: '',
        },
      }),
      {}
    )
  )

  useEffect(() => {
    if (!user) {
      return
    }

    setSelectedFields({
      [VrPlatformName.VRCHAT]: {
        isSelected: !!user['vrchatusername'],
        username: user['vrchatusername'] || '',
      },
      [VrPlatformName.CHILLOUTVR]: {
        isSelected: !!user['chilloutvrusername'],
        username: user['chilloutvrusername'] || '',
      },
      [VrPlatformName.NEOSVR]: {
        isSelected: !!user['neosvrusername'],
        username: user['neosvrusername'] || '',
      },
    })
  }, [user && user.id])

  const areAnySelected = Object.values(selectedFields).find(
    (field) => field.isSelected
  )

  const toggleSelectPlatform = (platformName: VrPlatformName): void => {
    if (isSaving) {
      return
    }

    setSelectedFields((currentVal) => ({
      ...currentVal,
      [platformName]: {
        ...currentVal[platformName],
        isSelected: !currentVal[platformName].isSelected,
      },
    }))

    if (analyticsCategory) {
      trackAction(
        analyticsCategory,
        selectedFields[platformName].isSelected
          ? 'Unselect VR platform'
          : 'Select VR platform',
        platformName
      )
    }
  }

  const setUsername = (platformName: VrPlatformName, newUsername: string) =>
    setSelectedFields((currentVal) => ({
      ...currentVal,
      [platformName]: {
        ...currentVal[platformName],
        username: newUsername,
      },
    }))

  const onSaveBtnClick = async () => {
    try {
      await save({
        ['vrchatusername']:
          selectedFields[VrPlatformName.VRCHAT].username || null,
        ['chilloutvrusername']:
          selectedFields[VrPlatformName.CHILLOUTVR].username || null,
        ['neosvrusername']:
          selectedFields[VrPlatformName.NEOSVR].username || null,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save VR platforms to db', err)
      handleError(err)
    }
  }

  if (isLoadingUser) {
    return <LoadingIndicator />
  }

  if (isErroredLoadingUser) {
    return <ErrorMessage>Failed to lookup your profile</ErrorMessage>
  }

  return (
    <div>
      <div className={classes.intro}>
        Select the VR games that you play (optional):
      </div>
      <div className={classes.cards}>
        {vrPlatforms.map((platform) => (
          <Card className={classes.card}>
            <CardActionArea
              className={classes.actionArea}
              onClick={() => toggleSelectPlatform(platform.name)}>
              <div className={classes.checkbox}>
                <CheckboxInput
                  value={selectedFields[platform.name].isSelected}
                  isDisabled={isSaving}
                />
              </div>
              <div className={classes.image}>
                <img src={platform.imageUrl} />
              </div>
              <CardContent className={classes.cardContent}>
                <Typography gutterBottom variant="h5" component="h2">
                  {platform.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  {platform.description}
                </Typography>
              </CardContent>
            </CardActionArea>
            <CardActions className={classes.controls}>
              <Button
                size="small"
                color="secondary"
                url={platform.websiteUrl}
                icon={<OpenInNewIcon />}
                onClick={() => {
                  if (analyticsCategory) {
                    trackAction(
                      analyticsCategory,
                      'Click learn more about VR platform button',
                      platform.name
                    )
                  }
                }}>
                Learn More
              </Button>
            </CardActions>
          </Card>
        ))}
      </div>
      {areAnySelected && (
        <>
          <p>Enter your usernames:</p>
          <div className={classes.cards}>
            {vrPlatforms.map((platform) => (
              <div className={classes.card}>
                <div
                  className={`${classes.usernameInputItem} ${
                    selectedFields[platform.name].isSelected
                      ? classes.selected
                      : ''
                  }`}>
                  <TextField
                    value={selectedFields[platform.name].username}
                    label="Username"
                    variant="outlined"
                    onChange={(event) =>
                      setUsername(platform.name, event.target.value)
                    }
                    className={classes.usernameInput}
                    disabled={
                      !selectedFields[platform.name].isSelected || isSaving
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {isSaving && <LoadingIndicator message="Saving..." />}
      {isSaveSuccess ? (
        <SuccessMessage>Your VR platforms have been saved</SuccessMessage>
      ) : lastErrorCode ? (
        <ErrorMessage>Failed to save (code {lastErrorCode})</ErrorMessage>
      ) : null}
      <FormControls>
        <Button
          onClick={() => onSaveBtnClick()}
          isDisabled={isSaving}
          icon={<SaveIcon />}>
          Save
        </Button>{' '}
      </FormControls>
    </div>
  )
}
