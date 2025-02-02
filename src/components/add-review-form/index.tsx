import React, { useState, createContext, useContext, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import StarIcon from '@material-ui/icons/Star'
import StarOutlineIcon from '@material-ui/icons/StarOutline'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useDatabaseQuery, { Operators } from '../../hooks/useDatabaseQuery'
import useUserId from '../../hooks/useUserId'

import { handleError } from '../../error-handling'
import { ReviewsFieldNames } from '../../data-store'
import { allowedRatings, RatingMeta } from '../../ratings'

import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import LoadingIndicator from '../loading-indicator'
import Button from '../button'
import Message from '../message'
import TextInput from '../text-input'
import Paper from '../paper'
import FormControls from '../form-controls'
import { CollectionNames, Rating, Review } from '../../modules/reviews'

const useStyles = makeStyles({
  root: {},
  rating: {
    marginTop: '0.5rem',
  },
  stars: {
    display: 'flex',
  },
  star: {
    cursor: 'pointer',
  },
  active: {},
  inactive: {
    opacity: 0.6,
  },
  input: {
    width: '100%',
  },
  overallRating: {
    padding: '1rem',
  },
  ratingInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginRight: '1rem',
    fontWeight: 'bold',
  },
})

interface RatingsContext {
  newRatings: Rating[]
  addOrEdit: (ratingName: string, newRating: Rating) => void
  remove: (ratingName: string) => void
}

const ratingsContext = createContext<RatingsContext>({
  newRatings: [],
  addOrEdit: () => {},
  remove: () => {},
})
const useRatings = () => useContext(ratingsContext)

function RatingInput({
  currentRatingOutOf5,
  onChange,
}: {
  currentRatingOutOf5: number | null
  onChange: (newIdx: number) => void
}) {
  const [idxHoveringOver, setIdxHoveringOver] = useState<number | null>(null)
  const classes = useStyles()

  const hoverOverIdx = (idx: number) => setIdxHoveringOver(idx)
  const hoverOffIdx = (idx: number) => setIdxHoveringOver(null)

  return (
    <div className={classes.stars}>
      {Array.from(Array(5)).map((item, idx) => (
        <div
          className={classes.star}
          onMouseEnter={() => hoverOverIdx(idx)}
          onMouseLeave={() => hoverOffIdx(idx)}
          onClick={() => onChange(idx + 1)}>
          {(idxHoveringOver !== null && idx <= idxHoveringOver) ||
          (idxHoveringOver === null &&
            currentRatingOutOf5 !== null &&
            idx <= currentRatingOutOf5 - 1) ? (
            <StarIcon />
          ) : (
            <StarOutlineIcon />
          )}
        </div>
      ))}
    </div>
  )
}

const getIsRatingDifferent = (
  oldRating: Rating,
  newRating?: Rating
): boolean => {
  if (!newRating) {
    return true
  }

  if (!oldRating && newRating) {
    return true
  }

  if (oldRating && !newRating) {
    return true
  }

  if (oldRating.rating !== newRating.rating) {
    return true
  }

  if (oldRating.comments !== newRating.comments) {
    return true
  }

  return false
}

function RatingOutput({ ratingMeta }: { ratingMeta: RatingMeta }) {
  const { newRatings, addOrEdit, remove } = useRatings()
  const [newRatingNumber, setNewRatingNumber] = useState<number | undefined>()
  const [newComments, setNewComments] = useState<string>('')
  const classes = useStyles()

  const currentRating = newRatings.find(
    (rating) => rating.name === ratingMeta.name
  )
  const isActive = !!currentRating

  useEffect(() => {
    if (currentRating === undefined) {
      return
    }

    setNewRatingNumber(currentRating.rating)
    setNewComments(currentRating.comments)
  }, [currentRating !== undefined])

  const changesNeedToBeSaved =
    newRatingNumber &&
    newComments &&
    getIsRatingDifferent(
      {
        name: '',
        rating: newRatingNumber,
        comments: newComments,
      },
      currentRating
    )

  return (
    <Paper
      className={`${classes.rating} ${
        isActive || changesNeedToBeSaved ? classes.active : classes.inactive
      }`}>
      <strong>{ratingMeta.title}</strong>
      <br />
      {ratingMeta.description}
      <br />
      <RatingInput
        currentRatingOutOf5={newRatingNumber ? newRatingNumber / 2 : null}
        onChange={(newNumber) => setNewRatingNumber(newNumber * 2)}
      />
      <br />
      Your comments (Markdown enabled):
      <br />
      <TextInput
        value={newComments}
        onChange={(e) => setNewComments(e.target.value)}
        minRows={3}
        multiline
        className={classes.input}
      />
      <FormControls>
        {changesNeedToBeSaved && (
          <>
            You need to apply your changes:{' '}
            <Button
              onClick={() => {
                if (!newRatingNumber) {
                  console.warn('Cannot add rating: no rating number!')
                  return
                }

                if (!newComments) {
                  console.warn('Cannot add rating: no comments!')
                  return
                }

                addOrEdit(ratingMeta.name, {
                  name: ratingMeta.name,
                  rating: newRatingNumber,
                  comments: newComments,
                })
              }}>
              {isActive ? 'Save Changes' : 'Add'}
            </Button>
          </>
        )}{' '}
        {isActive && (
          <Button onClick={() => remove(ratingMeta.name)} color="default">
            Clear Rating
          </Button>
        )}
      </FormControls>
    </Paper>
  )
}

function Ratings() {
  return (
    <div>
      {allowedRatings.map((ratingMeta) => (
        <RatingOutput key={ratingMeta.name} ratingMeta={ratingMeta} />
      ))}
    </div>
  )
}

export default ({
  assetId,
  onDone = undefined,
}: {
  assetId: string
  onDone?: () => void
}) => {
  const [newOverallRatingNumber, setNewOverallRatingNumber] = useState<
    number | null
  >(null)
  const [newComments, setNewComments] = useState('')
  const [newRatings, setNewRatings] = useState<Rating[]>([])
  const userId = useUserId()

  const [isLoadingMyReview, isErrorLoadingMyReview, myReview] =
    useDatabaseQuery<Review>(CollectionNames.Reviews, [
      ['asset', Operators.EQUALS, assetId],
      ['createdby', Operators.EQUALS, userId],
    ])

  const reviewToEdit =
    myReview !== null && Array.isArray(myReview) ? myReview[0] : null
  const inEditMode = !!reviewToEdit

  const [isSaving, isSuccess, isErrored, save, clear] = useDatabaseSave(
    CollectionNames.Reviews,
    reviewToEdit ? reviewToEdit.id : null
  )

  const classes = useStyles()

  useEffect(() => {
    if (!inEditMode) {
      return
    }

    setNewComments(reviewToEdit.comments)
    setNewOverallRatingNumber(reviewToEdit.overallrating)
    setNewRatings(reviewToEdit.ratings)
  }, [inEditMode])

  if (Array.isArray(myReview) && myReview.length > 1) {
    return (
      <ErrorMessage>
        Failed to load review form: you have more than 1 review for this asset!
      </ErrorMessage>
    )
  }

  if (!userId) {
    return <Message>You must be logged in to review</Message>
  }

  if (isLoadingMyReview) {
    return <LoadingIndicator message="Checking your reviews..." />
  }

  if (isErrorLoadingMyReview) {
    return <ErrorMessage>Failed to check your reviews</ErrorMessage>
  }

  if (isSaving) {
    return <LoadingIndicator message="Adding your review..." />
  }

  if (isSuccess) {
    return (
      <SuccessMessage>
        {inEditMode
          ? 'Your review has been edited successfully'
          : 'Your review has been published successfully'}
      </SuccessMessage>
    )
  }

  if (isErrored) {
    return (
      <ErrorMessage>
        Error adding or editing your review
        <br />
        <br />
        <Button onClick={() => clear()}>Try Again</Button>
      </ErrorMessage>
    )
  }

  const onAddClick = async () => {
    try {
      if (!newOverallRatingNumber) {
        console.warn('Cannot save review without a valid rating number')
        return
      }

      if (!newComments) {
        console.warn('Cannot save review without a valid comment')
        return
      }

      await save({
        [ReviewsFieldNames.asset]: assetId,
        [ReviewsFieldNames.comments]: newComments,
        [ReviewsFieldNames.overallRating]: newOverallRatingNumber,
        [ReviewsFieldNames.ratings]: newRatings,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save review', err)
      handleError(err)
    }
  }

  const onAddOrEditRating = (ratingName: string, newRating: Rating) => {
    setNewRatings((currentVal) => {
      if (currentVal.find((rating) => rating.name === ratingName)) {
        return currentVal.map((rating) => {
          if (rating.name === ratingName) {
            return newRating
          } else {
            return rating
          }
        })
      } else {
        return currentVal.concat([newRating])
      }
    })
  }

  const onRemoveRating = (ratingName: string) => {
    setNewRatings((currentVal) =>
      currentVal.filter((rating) => rating.name !== ratingName)
    )
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.overallRating}>
        <div className={classes.ratingInputWrapper}>
          <div className={classes.label}>Overall rating:</div>
          <RatingInput
            currentRatingOutOf5={
              newOverallRatingNumber ? newOverallRatingNumber / 2 : null
            }
            onChange={(ratingNumber: number) =>
              setNewOverallRatingNumber(ratingNumber * 2)
            }
          />
        </div>
        <br />
        Your comments (Markdown enabled):
        <TextInput
          value={newComments}
          onChange={(e) => setNewComments(e.target.value)}
          minRows={5}
          multiline
          className={classes.input}
        />
      </Paper>
      <ratingsContext.Provider
        value={{
          newRatings,
          addOrEdit: onAddOrEditRating,
          remove: onRemoveRating,
        }}>
        <Ratings />
      </ratingsContext.Provider>
      <FormControls>
        <Button onClick={onAddClick} size="large">
          {inEditMode ? 'Edit Review' : 'Publish Review'}
        </Button>
      </FormControls>
    </div>
  )
}
