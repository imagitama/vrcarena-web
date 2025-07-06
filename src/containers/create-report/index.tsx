import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { useParams } from 'react-router'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { makeStyles } from '@mui/styles'
import Link from '../../components/link'

import ErrorMessage from '../../components/error-message'
import WarningMessage from '../../components/warning-message'
import NoPermissionMessage from '../../components/no-permission-message'
import SuccessMessage from '../../components/success-message'
import LoadingIndicator from '../../components/loading-indicator'
import Button from '../../components/button'
import Heading from '../../components/heading'
import TextInput from '../../components/text-input'
import FormControls from '../../components/form-controls'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserId from '../../hooks/useUserId'

import * as routes from '../../routes'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { DISCORD_URL } from '../../config'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import {
  CollectionNames,
  getReasonsForCollectionName,
  Report,
  reportReasonsKeysByCollection,
} from '../../modules/reports'
import { CollectionNames as AssetsCollectionNames } from '../../modules/assets'
import GenericOutputItem from '../../components/generic-output-item'
import usePermissions from '../../hooks/usePermissions'

const analyticsCategory = 'CreateReport'

const useStyles = makeStyles({
  input: { width: '100%', marginBottom: '1rem' },
  label: {
    fontSize: '150%',
    margin: '0.5rem 0',
  },
})

const Form = ({
  parentTable,
  parentId,
}: {
  parentTable: string
  parentId: string
}) => {
  const [isLoadingParent, lastErrorCodeLoadingParent, parent] =
    useDataStoreItem(parentTable, parentId, 'create-report')
  const [isSaving, isSaveSuccess, lastErrorCodeCreating, save] =
    useDatabaseSave<Report>(CollectionNames.Reports)
  const [fieldData, setFieldData] = useState<{
    reason: string
    comments: string
  }>({
    reason: '',
    comments: '',
  })
  const [createdDocId, setCreatedDocId] = useState<string | null>(null)
  const classes = useStyles()

  if (isSaving) {
    return <LoadingIndicator message="Creating report..." />
  }

  if (isLoadingParent) {
    return <LoadingIndicator message="Loading parent..." />
  }

  if (lastErrorCodeLoadingParent !== null) {
    return (
      <ErrorMessage>
        Failed to load whatever you want to report - are you sure it exists?
        (code {lastErrorCodeLoadingParent})
      </ErrorMessage>
    )
  }

  if (lastErrorCodeCreating !== null) {
    return (
      <ErrorMessage>
        Failed to create the report (code {lastErrorCodeCreating})
      </ErrorMessage>
    )
  }

  if (isSaveSuccess) {
    return (
      <SuccessMessage>
        Report created successfully
        <br />
        <br />A member of the staff will review your report as soon as possible.
        You can also join our <a href={DISCORD_URL}>Discord server</a> to ask
        for more help.
        <br />
        <br />
        {createdDocId ? (
          <Button
            url={routes.viewReportWithVar.replace(':reportId', createdDocId)}>
            View Report
          </Button>
        ) : (
          '(No report ID found)'
        )}
      </SuccessMessage>
    )
  }

  const onFieldChange = (fieldName: string, newValue: string) =>
    setFieldData({
      ...fieldData,
      [fieldName]: newValue,
    })

  const onCreateBtnClick = async () => {
    trackAction(analyticsCategory, 'Click create report button')

    // TODO: Output this invalid data to user
    if (!fieldData.reason) {
      return
    }

    try {
      const [createdReport] = await save({
        ...fieldData,
        parenttable: parentTable,
        parent: parentId,
      })

      if (!createdReport) {
        throw new Error('Created report is null')
      }
      if (!createdReport.id) {
        throw new Error('Created report does not have an ID property')
      }

      setCreatedDocId(createdReport.id)
    } catch (err) {
      console.error('Failed to create request', err)
      handleError(err)
    }
  }

  return (
    <>
      <Heading variant="h1">Create Report</Heading>
      <WarningMessage>
        Do you want to submit a DMCA copyright claim? Please read our{' '}
        <Link to={routes.dmcaPolicy}>DMCA policy</Link>.
      </WarningMessage>
      <GenericOutputItem
        type={parentTable}
        id={parentId}
        data={parent as any}
      />
      <Heading variant="h2">Reason</Heading>
      <Select
        className={classes.input}
        value={fieldData['reason']}
        variant="outlined"
        onChange={(e) => onFieldChange('reason', e.target.value as string)}>
        {getReasonsForCollectionName(parentTable).map((reason) => (
          <MenuItem key={reason.value} value={reason.value}>
            {reason.label}
          </MenuItem>
        ))}
      </Select>
      {fieldData['reason'] ===
        reportReasonsKeysByCollection[AssetsCollectionNames.Assets]
          .TAKEDOWN && (
        <WarningMessage>
          Before submitting a takedown request please read our{' '}
          <Link to={routes.takedownPolicy}>takedown policy</Link> and ensure you
          can prove your are the creator of this asset.
        </WarningMessage>
      )}
      <Heading variant="h2">Comments</Heading>
      <p>Explain your reasoning. Provide evidence if necessary.</p>
      <TextInput
        className={classes.input}
        onChange={(e) => onFieldChange('comments', e.target.value)}
        multiline
        minRows={5}
      />
      <FormControls>
        <Button onClick={onCreateBtnClick} size="large">
          Create Report
        </Button>
      </FormControls>
    </>
  )
}

const View = () => {
  const { parentTable, parentId } = useParams<{
    parentTable: string
    parentId: string
  }>()

  if (!usePermissions(routes.createReportWithVar)) {
    return <NoPermissionMessage />
  }

  return <Form parentTable={parentTable} parentId={parentId} />
}

export default () => (
  <>
    <Helmet>
      <title>{`Create a new report | VRCArena`}</title>
      <meta
        name="description"
        content="Use this form to create a new report."
      />
    </Helmet>
    <View />
  </>
)
