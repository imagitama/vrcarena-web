import React, { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'

import useDatabaseQuery, { Operators } from '../../hooks/useDatabaseQuery'
import Button from '../../components/button'
import Heading from '../../components/heading'
import Fireworks from '../../components/fireworks'
import { AssetCategory } from '../../modules/assets'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem', userSelect: 'none', userDrag: 'none' },
  items: {
    display: 'flex',
    flexWrap: 'wrap',
    paddingLeft: '4rem',
  },
  item: {
    width: '100px',
    height: '140px',
    position: 'relative',
    margin: '0.25rem',
    // clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)',
    transition: 'all 1s',
    '& img': {
      height: '100%',
      userSelect: 'none',
      userDrag: 'none',
      pointerEvents: 'none',
      transition: 'all 100ms',
    },
    transformStyle: 'preserve-3d',
    transform: 'rotateY(0deg)',
  },
  side: {
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: '0.5rem',
  },
  front: {
    background: '#d2d2d2',
    '&:after': {
      content: '" "',
      position: 'absolute',
      top: '0.25rem',
      left: '0.25rem',
      width: 'calc(100% - 0.5rem)',
      height: 'calc(100% - 0.5rem)',
      background: '#490000',
      borderRadius: '0.5rem',
    },
  },
  back: {
    transform: 'rotateY(180deg)',
    background: '#FFF',
  },
  inner: {
    position: 'absolute',
    top: '0.25rem',
    left: '0.25rem',
    width: 'calc(100% - 0.5rem)',
    height: 'calc(100% - 0.5rem)',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    background: '#000',
  },
  title: {
    width: '100%',
    position: 'absolute',
    bottom: '44%',
    right: '-30%',
    color: '#FFF',
    textShadow: '0 0 2px #000',
    opacity: 0,
    transition: 'all 100ms',
    transform: 'rotate(-76deg)',
    fontSize: '150%',
  },
  scored: {
    transform: 'rotateY(180deg)',
    '& $inner img': {
      opacity: '0.2',
    },
  },
  revealed: {
    transform: 'rotateY(180deg)',
  },
})

const getIsCorrectGuess = (guess, assetTitle) => {
  if (assetTitle === guess) {
    return true
  }

  const guessByWord = guess.toLowerCase().split(' ')
  const assetTitleByWord = assetTitle.toLowerCase().split(' ')

  for (const assetTitleWord of assetTitleByWord) {
    if (guessByWord.includes(assetTitleWord)) {
      return true
    }
    // strip out S at end
    if (
      guessByWord.includes(assetTitleWord.substr(0, assetTitleByWord.length))
    ) {
      return true
    }
  }

  return false
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const delay = 2000

const View = () => {
  const classes = useStyles()
  const [isLoading, isError, avatars] = useDatabaseQuery('getpublicassets', [
    ['category', Operators.EQUALS, AssetCategory.Avatar],
  ])
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [guess, setGuess] = useState('')
  const [isCorrect, setIsCorrect] = useState(null)
  const [totalNumberOfGuesses, setTotalNumberOfGuesses] = useState(0)
  const [totalNumberOfGiveUps, setTotalNumberOfGiveUps] = useState(0)
  const [totalNumberOfCorrect, setTotalNumberOfCorrect] = useState(0)
  const [totalNumberOfIncorrect, setTotalNumberOfIncorrect] = useState(0)
  const autoSelectNewAvatarTimeoutRef = useRef()
  const [hasGameEnded, setHasGameEnded] = useState(false)
  const [guessesByAvatarId, setGuessesByAvatarId] = useState({})

  const selectNewAvatar = () => {
    clearTimeout(autoSelectNewAvatarTimeoutRef.current)
    const newAvatar = avatars[getRandomInt(0, avatars.length - 1)]
    setSelectedAvatar(newAvatar)
    setIsCorrect(null)
    setGuess('')
  }

  useEffect(() => {
    if (!avatars || !avatars.length) {
      return
    }
    selectNewAvatar()
  }, [avatars !== null ? avatars.length : null])

  useEffect(() => {
    return () => clearTimeout(autoSelectNewAvatarTimeoutRef.current)
  }, [])

  if (isLoading || !selectedAvatar) {
    return 'Loading...'
  }
  if (isError || !avatars || !avatars.length) {
    return 'Error!'
  }

  const onClickGuess = () => {
    if (!guess || !selectedAvatar) {
      return
    }

    const isCorrect = getIsCorrectGuess(guess, selectedAvatar.title)

    setGuessesByAvatarId((currentVal) => ({
      ...currentVal,
      [selectedAvatar.id]:
        selectedAvatar.id in currentVal
          ? currentVal[selectedAvatar.id].concat([guess])
          : [guess],
    }))

    setTotalNumberOfGuesses((currentVal) => currentVal + 1)

    if (isCorrect) {
      setTotalNumberOfCorrect((currentVal) => currentVal + 1)

      autoSelectNewAvatarTimeoutRef.current = setTimeout(() => {
        selectNewAvatar()
      }, delay)
    } else {
      setTotalNumberOfIncorrect((currentVal) => currentVal + 1)
    }

    setIsCorrect(isCorrect)
  }

  const giveUp = () => {
    setTotalNumberOfGiveUps((currentVal) => currentVal + 1)

    setGuessesByAvatarId((currentVal) => ({
      ...currentVal,
      [selectedAvatar.id]:
        selectedAvatar.id in currentVal
          ? currentVal[selectedAvatar.id].concat([''])
          : [''],
    }))

    selectNewAvatar()
  }

  const clearGuess = () => setGuess('')

  const onEndGameClick = () => {
    setHasGameEnded(true)
  }

  const resetGame = () => {
    setGuess('')
    setTotalNumberOfGuesses(0)
    setTotalNumberOfGiveUps(0)
    setTotalNumberOfCorrect(0)
    setTotalNumberOfIncorrect(0)
    setHasGameEnded(false)
    setGuessesByAvatarId({})
    selectNewAvatar()
  }

  return (
    <div className={classes.root}>
      <Heading variant="h1">Guess the avatar!</Heading>
      <ul>
        <li>Total number of guesses: {totalNumberOfGuesses}</li>
        <li>Total number of correct guesses: {totalNumberOfCorrect}</li>
        <li>Total number of incorrect guesses: {totalNumberOfIncorrect}</li>
        <li>Total number of give ups: {totalNumberOfGiveUps}</li>
      </ul>
      {hasGameEnded ? (
        <>
          <p>The game has ended!</p>
          <Button onClick={() => resetGame()}>Play Again</Button>
          <ul>
            {Object.entries(guessesByAvatarId).map(([avatarId, guesses]) => {
              const asset = avatars.find((avatar) => avatar.id === avatarId)
              return (
                <li key={avatarId}>
                  <img
                    src={asset.thumbnailurl}
                    width={100}
                    alt="Thumbnail for item"
                  />
                  <br />
                  {asset.title}
                  <ul>
                    {guesses.map((guess) => (
                      <li key={guess}>{guess}</li>
                    ))}
                  </ul>
                </li>
              )
            })}
          </ul>
        </>
      ) : (
        <>
          {' '}
          <p>
            If any of the words match any in asset title (case doesn't matter)
            it works. Press Esc to clear guess (or if you typed something press
            Esc to skip). Press Enter to guess.
          </p>
          <div style={{ textAlign: 'center' }}>
            <img src={selectedAvatar.thumbnailurl} alt="Thumbnail" />
            <br />
            <br />
            <TextField
              size="large"
              variant="outlined"
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => {
                if (e.keyCode === 13) {
                  onClickGuess()
                }
                if (e.keyCode === 27) {
                  if (guess === '') {
                    giveUp()
                  } else {
                    clearGuess()
                  }
                }
              }}
              value={guess}
            />
            <br />
            <br />
            <Button onClick={onClickGuess}>Am I right?</Button>{' '}
            <Button onClick={giveUp} color="default">
              I give up!
            </Button>
            <br />
            <br />
            {isCorrect === true ? (
              <>
                <Fireworks />
                You are correct! Automatically going to next avatar in 2
                seconds...{' '}
                <Button onClick={() => selectNewAvatar()}>Pick New One</Button>
              </>
            ) : isCorrect === false ? (
              'You are wrong'
            ) : (
              ''
            )}
            <br />
            <br />
            <Button onClick={onEndGameClick}>End Game</Button>
          </div>
        </>
      )}
    </div>
  )
}

export default () => (
  <>
    <Helmet>
      <title>Guess The Avatar | VRCArena</title>
      <meta name="description" content="Play the guess the avatar game!" />
    </Helmet>
    <View />
  </>
)
