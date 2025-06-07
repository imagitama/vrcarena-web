import React, { useState, useEffect } from 'react'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserId from '../../hooks/useUserId'
import useDatabaseQuery, { Operators } from '../../hooks/useDatabaseQuery'

import { handleError } from '../../error-handling'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Button from '../button'
import FormControls from '../form-controls'

import { topics, getLabelForTopic } from '../../subscriptions'
import { CollectionNames, Subscription } from '../../modules/subscriptions'

const useStyles = makeStyles({
  root: {
    border: '1px dashed rgba(255, 255, 255, 0.5)',
    padding: '0.25rem',
  },
  output: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
})

// TODO: Get this per table
const defaultTopics: string[] = []

export default ({
  parentTable,
  parentId,
}: {
  parentTable: string
  parentId: string
}) => {
  const myUserId = useUserId()
  // TODO: Search by parenttable/parentid/userid
  const [isLoadingProfile, isErrorLoadingProfile, existingSubscriptions] =
    useDatabaseQuery<Subscription>(CollectionNames.Subscriptions, [
      ['parenttable', Operators.EQUALS, parentTable],
      ['parent', Operators.EQUALS, parentId],
      ['createdby', Operators.EQUALS, myUserId],
    ])
  const existingSubscription =
    existingSubscriptions && existingSubscriptions.length
      ? existingSubscriptions[0]
      : null
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    existingSubscription ? CollectionNames.Subscriptions : false,
    existingSubscription ? existingSubscription.id : undefined
  )
  const [newTopics, setNewTopics] = useState(defaultTopics)
  const classes = useStyles()

  useEffect(() => {
    if (!existingSubscription) {
      return
    }
    setNewTopics(existingSubscription.topics)
  }, [existingSubscription !== null])

  if (isLoadingProfile || isSaving) {
    return <LoadingIndicator />
  }

  if (isErrorLoadingProfile) {
    return <ErrorMessage>Failed to load your subscription</ErrorMessage>
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save your subscription</ErrorMessage>
  }

  const onNewValue = (topic: string, nowEnabled: boolean) => {
    setNewTopics((currentTopics) =>
      nowEnabled
        ? currentTopics.concat([topic])
        : currentTopics.filter((item) => item !== topic)
    )
  }

  const onSaveClick = async () => {
    try {
      await save({
        parenttable: parentTable,
        parent: parentId,
        topics: newTopics,
      })
    } catch (err) {
      console.error('Failed to save subscription', err)
      handleError(err)
    }
  }

  return (
    <div className={classes.root}>
      <p>Choose what kind of events you want to subscribe to:</p>
      {Object.keys(topics).map((topic) => (
        <FormControlLabel
          key={topic}
          control={
            <Checkbox
              checked={newTopics.includes(topic)}
              onChange={(e) => onNewValue(topic, !newTopics.includes(topic))}
            />
          }
          label={getLabelForTopic(topic)}
        />
      ))}
      <p>Note it will use your notification preferences!</p>
      <FormControls>
        <Button onClick={onSaveClick}>Save</Button>
      </FormControls>
      <div className={classes.output}>
        {isSaving && 'Saving...'}
        {isSaveError && 'Failed to save. Please try again'}
        {isSaveSuccess && 'Saved successfully'}
      </div>
    </div>
  )
}
