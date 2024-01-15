import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import TextField from '@material-ui/core/TextField'
import SaveIcon from '@material-ui/icons/Save'

import { CollectionNames, UserFieldNames } from '../../hooks/useDatabaseQuery'
import useUserId from '../../hooks/useUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'
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

const useStyles = makeStyles({
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

const vrPlatformNames = {
  VRCHAT: 'VRCHAT',
  CHILLOUTVR: 'CHILLOUTVR',
  NEOSVR: 'NEOSVR',
}

const vrPlatforms = [
  {
    name: vrPlatformNames.VRCHAT,
    title: 'VRChat',
    websiteUrl: 'https://hello.vrchat.com/',
    description:
      'A free-to-play massively multiplayer online virtual reality social platform created by Graham Gaylor and Jesse Joudrey.',
    imageUrl: vrchatImageUrl,
    field: UserFieldNames.vrchatUsername,
  },
  {
    name: vrPlatformNames.CHILLOUTVR,
    title: 'ChilloutVR',
    websiteUrl: 'https://store.steampowered.com/app/661130/ChilloutVR',
    description:
      'A free-to-play massively multiplayer online virtual reality platform created by Alpha Blend Interactive.',
    imageUrl: chilloutVrImageUrl,
    field: UserFieldNames.chilloutVrUsername,
  },
  {
    name: vrPlatformNames.NEOSVR,
    title: 'Resonite/Neos',
    websiteUrl: 'https://store.steampowered.com/app/2519830/Resonite',
    description:
      'A free-to-play massively multiplayer online virtual reality metaverse created by Yellow Dog Man Studios.',
    imageUrl: resoniteImageUrl,
    field: UserFieldNames.neosVrUsername,
  },
]

export default ({ analyticsCategory, onDone = undefined }) => {
  const classes = useStyles()
  const userId = useUserId()
  const [isLoadingUser, isErroredLoadingUser, user] = useUserRecord()
  const [isSaving, isSaveSuccess, isSaveErrored, save] = useDatabaseSave(
    CollectionNames.Users,
    userId
  )

  const [selectedFields, setSelectedFields] = useState(
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
      [vrPlatformNames.VRCHAT]: {
        isSelected: !!user[UserFieldNames.vrchatUsername],
        username: user[UserFieldNames.vrchatUsername] || '',
      },
      [vrPlatformNames.CHILLOUTVR]: {
        isSelected: !!user[UserFieldNames.chilloutVrUsername],
        username: user[UserFieldNames.chilloutVrUsername] || '',
      },
      [vrPlatformNames.NEOSVR]: {
        isSelected: !!user[UserFieldNames.neosVrUsername],
        username: user[UserFieldNames.neosVrUsername] || '',
      },
    })
  }, [user && user.id])

  const areAnySelected = Object.values(selectedFields).find(
    (field) => field.isSelected
  )

  const toggleSelectPlatform = (platformName) => {
    setSelectedFields((currentVal) => ({
      ...currentVal,
      [platformName]: {
        ...currentVal[platformName],
        isSelected: !currentVal[platformName].isSelected,
      },
    }))

    trackAction(
      analyticsCategory,
      selectedFields[platformName].isSelected
        ? 'Unselect VR platform'
        : 'Select VR platform',
      platformName
    )
  }

  const setUsername = (platformName, newUsername) =>
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
        [UserFieldNames.vrchatUsername]:
          selectedFields[vrPlatformNames.VRCHAT].username || null,
        [UserFieldNames.chilloutVrUsername]:
          selectedFields[vrPlatformNames.CHILLOUTVR].username || null,
        [UserFieldNames.neosVrUsername]:
          selectedFields[vrPlatformNames.NEOSVR].username || null,
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
      <p>Select the VR games that you play (optional):</p>
      <div className={classes.cards}>
        {vrPlatforms.map((platform) => (
          <Card className={classes.card}>
            <CardActionArea
              className={classes.actionArea}
              onClick={() => toggleSelectPlatform(platform.name)}>
              <div className={classes.checkbox}>
                <Checkbox checked={selectedFields[platform.name].isSelected} />
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
                color="default"
                url={platform.websiteUrl}
                icon={<OpenInNewIcon />}
                onClick={() =>
                  trackAction(
                    analyticsCategory,
                    'Click learn more about VR platform button',
                    platform.name
                  )
                }>
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
                    disabled={!selectedFields[platform.name].isSelected}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <FormControls>
        <Button
          onClick={() => onSaveBtnClick()}
          isDisabled={isSaving}
          icon={<SaveIcon />}>
          Save
        </Button>{' '}
        {isSaving
          ? 'Saving...'
          : isSaveSuccess
          ? ' Saved!'
          : isSaveErrored
          ? ' Error'
          : ''}
      </FormControls>
    </div>
  )
}
