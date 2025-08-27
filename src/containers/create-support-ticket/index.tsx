import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { useParams } from 'react-router'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { makeStyles } from '@mui/styles'

import ErrorMessage from '../../components/error-message'
import NoPermissionMessage from '../../components/no-permission-message'
import SuccessMessage from '../../components/success-message'
import LoadingIndicator from '../../components/loading-indicator'
import Button from '../../components/button'
import Heading from '../../components/heading'
import TextInput from '../../components/text-input'
import FormControls from '../../components/form-controls'

import * as routes from '../../routes'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { DISCORD_URL, EMAIL } from '../../config'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import {
  CollectionNames,
  SupportTicket,
  SupportTicketAnswer,
  SupportTicketCategory,
  supportTicketCategoryMeta,
} from '../../modules/support-tickets'
import GenericOutputItem from '../../components/generic-output-item'
import usePermissions from '../../hooks/usePermissions'
import useDataStoreCreate from '../../hooks/useDataStoreCreate'
import { getViewNameForParentTable } from '../../utils/reports'
import WarningMessage from '@/components/warning-message'

const analyticsCategory = 'CreateSupportTicket'

const useStyles = makeStyles({
  input: { width: '100%', marginBottom: '1rem' },
  label: {
    fontSize: '150%',
    margin: '0.5rem 0',
  },
  categoryDesc: {
    fontSize: '75%',
    fontStyle: 'italic',
    marginLeft: '0.5rem',
  },
})

const Form = ({
  parentTable,
  viewName,
  parentId,
}: {
  parentTable?: string
  viewName?: string
  parentId?: string
}) => {
  const [isLoadingParent, lastErrorCodeLoadingParent, parent] =
    useDataStoreItem(
      viewName || parentTable || '',
      parentId || false,
      'create-support-ticket'
    )
  const [
    isSaving,
    isSaveSuccess,
    lastErrorCodeCreating,
    save,
    ,
    createdSupportTicket,
  ] = useDataStoreCreate<SupportTicket>(CollectionNames.SupportTickets)
  const [fieldData, setFieldData] = useState<{
    category: SupportTicketCategory | null
    comments: string
    answers: SupportTicketAnswer[]
  }>({
    category: null,
    comments: '',
    answers: [],
  })
  const classes = useStyles()

  // TODO: Populate relatedTable/Id instead
  const [relatedItemUrl, setRelatedItemUrl] = useState('')

  if (isSaving) {
    return <LoadingIndicator message="Creating support-ticket..." />
  }

  if (isLoadingParent) {
    return <LoadingIndicator message="Loading parent..." />
  }

  if (lastErrorCodeLoadingParent !== null) {
    return (
      <ErrorMessage>
        Failed to load the related item for this support ticket - are you sure
        it exists? (code {lastErrorCodeLoadingParent})
      </ErrorMessage>
    )
  }

  if (lastErrorCodeCreating !== null) {
    return (
      <ErrorMessage>
        Failed to create the support ticket (code {lastErrorCodeCreating})
      </ErrorMessage>
    )
  }

  if (isSaveSuccess) {
    return (
      <SuccessMessage
        viewRecordUrl={
          createdSupportTicket
            ? routes.viewSupportTicketWithVar.replace(
                ':supportTicketId',
                createdSupportTicket.id
              )
            : undefined
        }>
        Support ticket created successfully
        <br />
        <br />A member of the staff will review your support ticket as soon as
        possible. You can also join our <a href={DISCORD_URL}>
          Discord server
        </a>{' '}
        and request additional support if it has not been actioned within 7
        days.
      </SuccessMessage>
    )
  }

  const onFieldChange = (fieldName: string, newValue: any) =>
    setFieldData({
      ...fieldData,
      [fieldName]: newValue,
    })

  const storeQuestionAnswer = (question: string, newAnswer: string) =>
    onFieldChange(
      'answers',
      fieldData.answers.find(
        (questionAndAnswer) => questionAndAnswer.question === question
      )
        ? fieldData.answers.map((questionAndAnswer) =>
            questionAndAnswer.question === question
              ? { ...questionAndAnswer, answer: newAnswer }
              : questionAndAnswer
          )
        : fieldData.answers.concat([{ question, answer: newAnswer }])
    )

  const onCreateBtnClick = async () => {
    trackAction(analyticsCategory, 'Click create support ticket button')

    // TODO: Output this invalid data to user
    if (!fieldData.category || !fieldData.comments) {
      return
    }

    try {
      const questions =
        supportTicketCategoryMeta[fieldData.category].questions || []

      await save({
        ...fieldData,
        comments: `${relatedItemUrl ? `URL: ${relatedItemUrl}\n\n` : ''}${
          fieldData.comments
        }`,
        answers: fieldData.answers.filter((questionAndAnswer) =>
          questions.includes(questionAndAnswer.question)
        ),
        category: fieldData.category!,
        relatedtable: parentTable,
        relatedid: parentId,
      })
    } catch (err) {
      console.error('Failed to create support ticket', err)
      handleError(err)
    }
  }

  return (
    <>
      <Heading variant="h1">Create Support Ticket</Heading>
      <WarningMessage>
        Having trouble submitting this support ticket? You can message us via
        our <a href={DISCORD_URL}>Discord server</a> or email us at {EMAIL}{' '}
        (Discord preferred)
      </WarningMessage>
      {/* <WarningMessage>
        Have an issue with another person's asset or comment? Want to takedown
        your asset? Please{' '}
        <Link
          to={routes.createReportWithVar
            .replace(':parentTable', parentTable)
            .replace(':parentId', parentId)}>
          create a report
        </Link>{' '}
        instead.
      </WarningMessage> */}
      {/* {parentTable && parentId && (
        <GenericOutputItem
          type={parentTable}
          id={parentId}
          data={parent as any}
        />
      )} */}
      <Heading variant="h2">Related Item</Heading>
      <p>
        Copy and paste the URL to the user account, asset, author, or whatever
        you need support for:
      </p>
      <TextInput
        value={relatedItemUrl}
        onChange={(e) => setRelatedItemUrl(e.target.value)}
        placeholder="URL"
        fullWidth
      />
      <Heading variant="h2">Category</Heading>
      <Select
        className={classes.input}
        value={fieldData['category'] || ''}
        variant="outlined"
        onChange={(e) => onFieldChange('category', e.target.value as string)}>
        {Object.entries(supportTicketCategoryMeta).map(([category, meta]) => (
          <MenuItem key={category} value={category}>
            {meta.label}
            <span className={classes.categoryDesc}>{meta.description}</span>
          </MenuItem>
        ))}
      </Select>
      {fieldData.category &&
      supportTicketCategoryMeta[fieldData.category].questions ? (
        <>
          <Heading variant="h2">More Info</Heading>
          {supportTicketCategoryMeta[fieldData.category].questions!.map(
            (question, idx) => (
              <div>
                <p>{question}</p>
                <TextInput
                  value={
                    fieldData.answers.find(
                      (questionAndAnswer) =>
                        questionAndAnswer.question === question
                    )?.answer
                  }
                  onChange={(e) =>
                    storeQuestionAnswer(question, e.target.value)
                  }
                  fullWidth
                />
              </div>
            )
          )}
        </>
      ) : null}
      <Heading variant="h2">Comments</Heading>
      <TextInput
        className={classes.input}
        onChange={(e) => onFieldChange('comments', e.target.value)}
        multiline
        minRows={5}
        placeholder="What is your support ticket about? Please add as much information as possible."
      />
      <FormControls>
        <Button onClick={onCreateBtnClick} size="large">
          Create Support Ticket
        </Button>
      </FormControls>
    </>
  )
}

const View = () => {
  const { parentTable, parentId } = useParams<{
    parentTable?: string
    parentId?: string
  }>()

  if (!usePermissions(routes.createReportWithVar)) {
    return <NoPermissionMessage />
  }

  return (
    <Form
      parentTable={parentTable}
      parentId={parentId}
      viewName={
        parentTable ? getViewNameForParentTable(parentTable) : undefined
      }
    />
  )
}

export default () => (
  <>
    <Helmet>
      <title>{`Create a new support ticket | VRCArena`}</title>
      <meta
        name="description"
        content="Use this form to create a new support ticket."
      />
    </Helmet>
    <View />
  </>
)
