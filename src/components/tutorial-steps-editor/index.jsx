import React, { useState, useEffect } from 'react'
import Markdown from '../markdown'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import CheckIcon from '@material-ui/icons/Check'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'

import {
  TutorialStepFieldNames,
  CollectionNames,
  AssetFieldNames,
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserId from '../../hooks/useUserId'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'

import Button from '../button'
import TextInput from '../text-input'
import Paper from '../paper'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import ImageUploader from '../firebase-image-uploader'
import FormControls from '../form-controls'

const useStyles = makeStyles({
  step: {
    marginBottom: '1rem',
    '&:last-child': {
      margin: 0,
    },
  },
  controls: {
    marginTop: '0.5rem',
    textAlign: 'right',
  },
  label: {
    fontWeight: 'bold',
    marginTop: '0.5rem',
  },
})

function Label({ children }) {
  const classes = useStyles()
  return <div className={classes.label}>{children}</div>
}

const doesStepNeedSaving = (existingStepData, newStepData) => {
  if (
    existingStepData[TutorialStepFieldNames.title] !==
    newStepData[TutorialStepFieldNames.title]
  ) {
    return true
  }
  if (
    existingStepData[TutorialStepFieldNames.description] !==
    newStepData[TutorialStepFieldNames.description]
  ) {
    return true
  }
  if (
    existingStepData[TutorialStepFieldNames.imageUrls] &&
    !newStepData[TutorialStepFieldNames.imageUrls]
  ) {
    return true
  }
  if (
    !existingStepData[TutorialStepFieldNames.imageUrls] &&
    newStepData[TutorialStepFieldNames.imageUrls]
  ) {
    return true
  }
  return false
}

function StepEditor({
  assetId,
  number,
  isFirst,
  isLast,
  step,
  onSave,
  onMoveUp,
  onMoveDown,
  onDelete,
}) {
  const [isImageUploaderVisible, setIsImageUploaderVisible] = useState(false)
  const classes = useStyles()

  const updateStepField = (fieldName, newValue) =>
    onSave({ ...step, [fieldName]: newValue })

  return (
    <Paper className={classes.step}>
      <div>
        <strong>
          {number}. {step[TutorialStepFieldNames.title]}
        </strong>
        <br />
        <Markdown source={step[TutorialStepFieldNames.description]} />
        <br />
        {step[TutorialStepFieldNames.imageUrls] && (
          <>
            Attached image:{' '}
            <img
              src={step[TutorialStepFieldNames.imageUrls]}
              alt={`Attachment for step`}
            />
          </>
        )}
      </div>
      <div>
        <Label>Step Title</Label>
        <TextInput
          value={step[TutorialStepFieldNames.title]}
          onChange={(e) =>
            updateStepField(TutorialStepFieldNames.title, e.target.value)
          }
          style={{ width: '100%' }}
        />
        <Label>Instructions</Label>
        <TextInput
          value={step[TutorialStepFieldNames.description]}
          onChange={(e) =>
            updateStepField(TutorialStepFieldNames.description, e.target.value)
          }
          minRows={10}
          multiline
          style={{ width: '100%' }}
        />
        <Label>Attached Image</Label>
        {step[TutorialStepFieldNames.imageUrls] ? (
          <Button onClick={() => setIsImageUploaderVisible(true)}>
            Change Attached Image
          </Button>
        ) : null}
        {!step[TutorialStepFieldNames.imageUrls] || isImageUploaderVisible ? (
          <ImageUploader
            directoryPath={`tutorial-step-attachments/${assetId}`}
            onUploadedWithUrl={(optimizedUrl) => {
              updateStepField(TutorialStepFieldNames.imageUrls, optimizedUrl)
              setIsImageUploaderVisible(false)
            }}
          />
        ) : null}

        <div className={classes.controls}>
          {isFirst ? null : (
            <Button
              onClick={() => onMoveUp()}
              color="default"
              icon={<ArrowUpwardIcon />}>
              Move Up
            </Button>
          )}{' '}
          {isLast ? null : (
            <Button
              onClick={() => onMoveDown()}
              color="default"
              icon={<ArrowDownwardIcon />}>
              Move Down
            </Button>
          )}{' '}
          <Button
            onClick={() => onDelete()}
            color="default"
            icon={<DeleteIcon />}>
            Delete Step
          </Button>
        </div>
      </div>
    </Paper>
  )
}

function getStepsAsString(steps) {
  return steps.map((step) => step[TutorialStepFieldNames.uniqueName]).join('+')
}

function moveItemInArray(from, to, array) {
  const newArray = [].concat(array)
  newArray.splice(to, 0, newArray.splice(from, 1)[0])
  return newArray
}

export default ({
  assetId,
  existingSteps,
  onDone,
  actionCategory,
  overrideSave = null,
}) => {
  const [stepsBeingEdited, setStepsBeingEdited] = useState([])
  const classes = useStyles()
  const [isSaving, , isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const userId = useUserId()

  useEffect(() => {
    setStepsBeingEdited(existingSteps)
  }, [getStepsAsString(existingSteps || [])])

  const saveSteps = async () => {
    try {
      if (overrideSave) {
        overrideSave(stepsBeingEdited)
        onDone()
        return
      }

      trackAction(actionCategory, 'Click save tutorial steps', assetId)

      await save({
        [AssetFieldNames.tutorialSteps]: stepsBeingEdited,
      })

      onDone()
    } catch (err) {
      console.error('Failed to save tutorial steps', err)
      handleError(err)
    }
  }

  if (isSaving) {
    return <LoadingIndicator />
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save your changes</ErrorMessage>
  }

  const addStep = () => {
    setStepsBeingEdited((steps) =>
      steps.concat([
        {
          [TutorialStepFieldNames.title]: '',
          [TutorialStepFieldNames.description]: '',
        },
      ])
    )
  }

  const moveStepUp = (stepIdx) => {
    setStepsBeingEdited(moveItemInArray(stepIdx, stepIdx - 1, stepsBeingEdited))
  }

  const moveStepDown = (stepIdx) => {
    setStepsBeingEdited(moveItemInArray(stepIdx, stepIdx + 1, stepsBeingEdited))
  }

  const deleteStep = (stepIdx) => {
    setStepsBeingEdited(stepsBeingEdited.splice(stepIdx, 1))
  }

  const saveStep = (stepIdx, newStepFields) => {
    const step = stepsBeingEdited[stepIdx]
    const newStep = {
      ...step,
      ...newStepFields,
    }

    // fix undefined error if no image attached
    if (newStepFields[TutorialStepFieldNames.imageUrls]) {
      newStep[TutorialStepFieldNames.imageUrls] =
        newStepFields[TutorialStepFieldNames.imageUrls]
    }

    const newStepsBeingEdited = [...stepsBeingEdited]
    newStepsBeingEdited[stepIdx] = newStep

    setStepsBeingEdited(newStepsBeingEdited)
  }

  return (
    <div className={classes.root}>
      <div>
        {stepsBeingEdited.length
          ? stepsBeingEdited.map((step, idx) => (
              <StepEditor
                key={step[TutorialStepFieldNames.number]}
                assetId={assetId}
                step={step}
                number={idx + 1}
                onSave={(newStepFields) => saveStep(idx, newStepFields)}
                onMoveUp={() => moveStepUp(idx)}
                onMoveDown={() => moveStepDown(idx)}
                onDelete={() => deleteStep(idx)}
                isFirst={idx === 0}
                isLast={idx === stepsBeingEdited.length - 1}
              />
            ))
          : 'No steps have been added yet'}
      </div>
      <FormControls>
        <Button onClick={() => addStep()} color="default" icon={<AddIcon />}>
          Add Step
        </Button>
      </FormControls>
      <FormControls>
        <Button onClick={() => saveSteps()} icon={<SaveIcon />}>
          Save
        </Button>
      </FormControls>
    </div>
  )
}
