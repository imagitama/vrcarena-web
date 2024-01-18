import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { useParams } from 'react-router'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import { makeStyles } from '@material-ui/core/styles'
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

import { CollectionNames, ReportFieldNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserId from '../../hooks/useUserId'

import * as routes from '../../routes'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { DISCORD_URL } from '../../config'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import {
  getReasonsForCollectionName,
  Report,
  reportReasonsKeysByCollection,
} from '../../modules/reports'
import GenericOutputItem from '../../components/generic-output-item'

const analyticsCategory = 'CreateReport'

const useStyles = makeStyles({
  input: { width: '100%', marginBottom: '1rem' },
  label: {
    fontSize: '150%',
    margin: '0.5rem 0',
  },
})

const View = () => {
  const userId = useUserId()
  const { parentTable, parentId } = useParams<{
    parentTable: string
    parentId: string
  }>()
  const [isLoadingParent, isErrorLoadingParent, parent] = useDataStoreItem(
    parentTable,
    parentId,
    'create-report'
  )
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave<Report>(
    CollectionNames.Reports
  )
  const [fieldData, setFieldData] = useState({
    [ReportFieldNames.reason]: null,
    [ReportFieldNames.comments]: '',
  })
  const [createdDocId, setCreatedDocId] = useState<string | null>(null)
  const classes = useStyles()

  if (!userId) {
    return <NoPermissionMessage />
  }

  if (isSaving) {
    return <LoadingIndicator message="Creating report..." />
  }

  if (isLoadingParent) {
    return <LoadingIndicator message="Loading parent..." />
  }

  if (isErrorLoadingParent) {
    return (
      <ErrorMessage>
        Failed to load whatever you want to report - are you sure it exists?
      </ErrorMessage>
    )
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to create the report</ErrorMessage>
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
    if (!fieldData[ReportFieldNames.reason]) {
      return
    }

    try {
      const [createdReport] = await save({
        ...fieldData,
        [ReportFieldNames.parentTable]: parentTable,
        [ReportFieldNames.parent]: parentId,
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
        value={fieldData[ReportFieldNames.reason]}
        variant="outlined"
        onChange={(e) =>
          onFieldChange(ReportFieldNames.reason, e.target.value as string)
        }>
        {getReasonsForCollectionName(parentTable).map((reason) => (
          <MenuItem key={reason.value} value={reason.value}>
            {reason.label}
          </MenuItem>
        ))}
      </Select>
      {fieldData[ReportFieldNames.reason] ===
        reportReasonsKeysByCollection[CollectionNames.Assets].TAKEDOWN && (
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
        onChange={(e) =>
          onFieldChange(ReportFieldNames.comments, e.target.value)
        }
        multiline
        rows={5}
      />
      <FormControls>
        <Button onClick={onCreateBtnClick}>Create</Button>
      </FormControls>
    </>
  )
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
