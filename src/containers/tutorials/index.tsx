import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import AddIcon from '@material-ui/icons/Add'
import useDatabaseQuery, {
  Operators,
  OrderDirections,
  WhereClause,
} from '../../hooks/useDatabaseQuery'
import {
  AttachmentReason,
  FullAttachment,
  ViewNames,
} from '../../modules/attachments'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import AttachmentResults from '../../components/attachment-results'
import NoResultsMessage from '../../components/no-results-message'
import FormControls from '../../components/form-controls'
import Button from '../../components/button'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'
import AttachmentEditor from '../../components/attachment-editor'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import useTimer from '../../hooks/useTimer'
import Paper from '../../components/paper'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'

const useTutorials = () => {
  const isAdultContentEnabled = useIsAdultContentEnabled()

  const whereClauses: WhereClause<FullAttachment>[] = [
    ['reason', Operators.EQUALS, AttachmentReason.Tutorial],
  ]

  if (!isAdultContentEnabled) {
    whereClauses.push(['isadult', Operators.NOT_EQUALS, true])
  }

  return useDatabaseQuery<FullAttachment>(
    ViewNames.GetFullAttachments,
    whereClauses,
    {
      orderBy: ['createdat', OrderDirections.DESC],
    }
  )
}

export default () => {
  const [isLoading, lastErrorCode, attachments, hydrateAttachments] =
    useTutorials()
  const isLoggedIn = useIsLoggedIn()
  const [isFormVisible, setIsFormVisible] = useState(false)
  const startTimer = useTimer(() => setIsFormVisible(false))

  const onDone = () => {
    startTimer()
    hydrateAttachments()
  }

  return (
    <>
      <Helmet>
        <title>Tutorials | VRCArena</title>
        <meta
          name="description"
          content={`Learn how to create avatars, create worlds and more in your favorite VR games with these tutorials.`}
        />
      </Helmet>
      <Heading variant="h1">Tutorials</Heading>
      <BodyText>
        Learn how to create avatars, create worlds and more in your favorite VR
        games with these tutorials.
      </BodyText>
      {isLoading ? (
        <LoadingIndicator message="Loading tutorials..." />
      ) : lastErrorCode !== null ? (
        <ErrorMessage>Failed to load tutorials</ErrorMessage>
      ) : attachments ? (
        attachments.length ? (
          <AttachmentResults attachments={attachments} />
        ) : (
          <NoResultsMessage>No tutorials found</NoResultsMessage>
        )
      ) : (
        <ErrorMessage>Attachments is empty</ErrorMessage>
      )}
      <FormControls>
        <Button
          onClick={() => setIsFormVisible((currentVal) => !currentVal)}
          isDisabled={!isLoggedIn || isFormVisible}
          size="large"
          icon={<AddIcon />}>
          Add Tutorial
        </Button>
      </FormControls>
      {isFormVisible && (
        <>
          <Paper>
            <AttachmentEditor
              reason={AttachmentReason.Tutorial}
              onDone={onDone}
              isPreExpanded
              allowEmptyIsAdult={false}
            />
          </Paper>
        </>
      )}
    </>
  )
}
