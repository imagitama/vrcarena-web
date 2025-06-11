import React, { useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import SaveIcon from '@mui/icons-material/Save'
import CreateIcon from '@mui/icons-material/Create'
import LaunchIcon from '@mui/icons-material/Launch'

import useIsEditor from '../../hooks/useIsEditor'
import NoPermissionMessage from '../../components/no-permission-message'
import useSupabaseView from '../../hooks/useSupabaseView'
import { Author, AuthorMeta } from '../../modules/authors'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import Heading from '../../components/heading'
import CheckboxInput from '../../components/checkbox-input'
import Button from '../../components/button'
import { makeStyles } from '@mui/styles'
import { alpha } from '@mui/material'
import { colorBrandLight } from '../../themes'
import WarningMessage from '../../components/warning-message'
import Paper from '../../components/paper'
import { DataStoreErrorCode } from '../../data-store'
import SuccessMessage from '../../components/success-message'
import useSupabaseClient from '../../hooks/useSupabaseClient'
import FormattedDate from '../../components/formatted-date'
import { dedupe } from './dedupe'
import {
  AssetInfo,
  AuthorWithAssets,
  GetAuthorDupesResult,
  PlannedField,
  SelectedFields,
} from './types'
import BodyText from '../../components/body-text'
import { routes } from '../../routes'
import { OpenExternalLink as OpenExternalLinkIcon } from '../../icons'

const getFieldsToUse = (
  dupeInfo: GetAuthorDupesResult,
  selectedFields: SelectedFields
): PlannedField[] => {
  const fields = []

  for (const authorId in selectedFields) {
    for (const fieldName of selectedFields[authorId]) {
      const author = dupeInfo.dupes
        .concat([dupeInfo.oldest])
        .find((author) => author.id === authorId)

      if (!author) {
        throw new Error(`Could not get author ${authorId}`)
      }

      console.debug(`getFieldsToUse`, authorId, fieldName, author)

      fields.push({
        fieldName,
        value: author.fields[fieldName],
        sourceId: authorId,
      })
    }
  }

  return fields
}

const PlanMode = ({
  dupeInfo,
  selectedFields,
}: {
  dupeInfo: GetAuthorDupesResult
  selectedFields: SelectedFields
}) => {
  const fieldInfosToApply = getFieldsToUse(dupeInfo, selectedFields)
  const assetsToSwitch = dupeInfo.dupes.reduce<AssetInfo[]>(
    (assets, author) => assets.concat(author.assets),
    []
  )
  const authorIdsToDelete = dupeInfo.dupes.map((author) => author.id)
  const [isSuccess, setIsSuccess] = useState(false)
  const [lastErrorCode, setLastErrorCode] = useState<DataStoreErrorCode | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(false)
  const client = useSupabaseClient()

  const onClickApply = async () => {
    console.debug('click apply', {
      fieldInfosToApply,
      assetsToSwitch,
      authorIdsToDelete,
    })

    try {
      setIsSuccess(false)
      setIsLoading(true)
      setLastErrorCode(null)

      await dedupe(
        client,
        dupeInfo,
        fieldInfosToApply,
        assetsToSwitch,
        authorIdsToDelete
      )

      setIsSuccess(true)
      setIsLoading(false)
      setIsSuccess(true)
    } catch (err) {
      console.error(err)
      setLastErrorCode(DataStoreErrorCode.Unknown)
    }
  }

  return (
    <>
      {isLoading ? <LoadingIndicator message="Working..." /> : null}
      {lastErrorCode !== null ? (
        <ErrorMessage>Failed to apply (code {lastErrorCode})</ErrorMessage>
      ) : null}
      {isSuccess ? <SuccessMessage>Apply successful!</SuccessMessage> : null}
      <Heading variant="h3">Plan</Heading>
      <strong>
        1. Save author {dupeInfo.oldest.id} with these additional fields:
      </strong>
      <ul>
        {fieldInfosToApply.length
          ? fieldInfosToApply.map(({ fieldName, value, sourceId }) => (
              <li key={fieldName}>
                {fieldName} {'=>'} {value as string} (from {sourceId})
              </li>
            ))
          : '(no fields to be added)'}
      </ul>
      <strong>2. Switch these assets to author {dupeInfo.oldest.id}:</strong>
      <ul>
        {assetsToSwitch.length
          ? assetsToSwitch.map((assetInfo) => (
              <li key={assetInfo.id}>
                {assetInfo.id} - {assetInfo.title}
              </li>
            ))
          : '(none need switching)'}
      </ul>
      <strong>3. Delete authors:</strong>
      <ul>
        {authorIdsToDelete.map((id) => (
          <li key={id}>{id}</li>
        ))}
      </ul>
      <WarningMessage>Clicking the below button is permanent!</WarningMessage>
      <Button
        icon={<SaveIcon />}
        size="large"
        onClick={onClickApply}
        isDisabled={isLoading || isSuccess}>
        Apply
      </Button>
    </>
  )
}

const useStyles = makeStyles({
  mainCell: {
    backgroundColor: `${alpha(colorBrandLight, 0.1)} !important`,
  },
})

const savableFieldNames: (keyof Author)[] = ['id']
const getIsSavableFieldName = (fieldName: string) =>
  !savableFieldNames.includes(fieldName)

const DupeRow = ({
  authorWithAssets,
  selectedFields,
  toggleSelectedField,
  head = false,
}: {
  authorWithAssets: AuthorWithAssets
  selectedFields?: SelectedFields
  toggleSelectedField?: (authorId: string, fieldName: string) => void
  head?: boolean
}) => {
  const classes = useStyles()

  return (
    <TableRow key={authorWithAssets.id}>
      <TableCell className={head ? classes.mainCell : ''}>
        <a
          href={routes.viewAuthorWithVar.replace(
            ':authorId',
            authorWithAssets.id
          )}
          target="_blank">
          {authorWithAssets.id} <OpenExternalLinkIcon />
        </a>
        {authorWithAssets.assets.map(({ id, title }) => (
          <li>
            Asset:{' '}
            <a
              href={routes.viewAssetWithVar.replace(':assetId', id)}
              target="_blank">
              {title} <OpenExternalLinkIcon />
            </a>
          </li>
        ))}
      </TableCell>
      <TableCell className={head ? classes.mainCell : ''}>
        <FormattedDate
          date={new Date(authorWithAssets.meta.createdat)}
          isRelative={false}
        />
        <br />
        {authorWithAssets.meta.accessstatus}
        <br />
        {authorWithAssets.meta.publishstatus}
        <br />
        {authorWithAssets.meta.approvalstatus}
        <br />
        {authorWithAssets.meta.editornotes}
      </TableCell>
      {Object.entries(authorWithAssets.fields).map(
        ([fieldName, fieldValue]) => (
          <TableCell key={fieldName} className={head ? classes.mainCell : ''}>
            {Array.isArray(fieldValue)
              ? fieldValue.length
              : (fieldValue as string)}
            {!Array.isArray(fieldValue) &&
            getIsSavableFieldName(fieldName) &&
            fieldValue &&
            selectedFields &&
            toggleSelectedField ? (
              <CheckboxInput
                value={
                  authorWithAssets.id in selectedFields &&
                  selectedFields[authorWithAssets.id].includes(fieldName)
                }
                onChange={(newVal) =>
                  toggleSelectedField(authorWithAssets.id, fieldName)
                }
              />
            ) : null}
          </TableCell>
        )
      )}
      <TableCell className={head ? classes.mainCell : ''}>
        {head
          ? 'Used For All Assets'
          : selectedFields &&
            authorWithAssets.id in selectedFields &&
            selectedFields[authorWithAssets.id].length > 0
          ? 'Partially Used Then Deletion'
          : 'Deletion'}
      </TableCell>
    </TableRow>
  )
}

const DupeOutput = ({ dupeInfo }: { dupeInfo: GetAuthorDupesResult }) => {
  const [selectedFields, setSelectedFields] = useState<SelectedFields>({})
  const [inPlanMode, setInPlanMode] = useState(false)

  const toggleSelectedField = (authorId: string, fieldName: string) =>
    setSelectedFields((currentFields) => {
      const newFields = { ...currentFields }

      if (!(authorId in newFields)) {
        newFields[authorId] = []
      }

      if (!newFields[authorId].includes(fieldName)) {
        newFields[authorId] = newFields[authorId].concat([fieldName])
      } else {
        newFields[authorId] = newFields[authorId].filter(
          (name) => name !== fieldName
        )
      }

      console.debug(
        `toggleSelectedField`,
        authorId,
        fieldName,
        currentFields,
        newFields
      )

      return newFields
    })

  const onClickPlan = () => setInPlanMode(true)

  return (
    <Paper margin>
      <Heading variant="h2" noTopMargin>
        {dupeInfo.oldest.fields.name}
      </Heading>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Meta</TableCell>
            {Object.entries(dupeInfo.oldest.fields).map(
              ([fieldName, fieldValue]) => (
                <TableCell key={fieldName}>{fieldName}</TableCell>
              )
            )}
            <TableCell>Result</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <DupeRow authorWithAssets={dupeInfo.oldest} head />
          {dupeInfo.dupes.map((author) => (
            <DupeRow
              key={author.id}
              authorWithAssets={author}
              selectedFields={selectedFields}
              toggleSelectedField={toggleSelectedField}
            />
          ))}
        </TableBody>
      </Table>
      {inPlanMode ? (
        <PlanMode dupeInfo={dupeInfo} selectedFields={selectedFields} />
      ) : (
        <Button icon={<CreateIcon />} size="large" onClick={onClickPlan}>
          Plan
        </Button>
      )}
    </Paper>
  )
}

const View = () => {
  const [isLoading, lastErrorCode, dupes] =
    useSupabaseView<GetAuthorDupesResult>('getAuthorDupes')

  if (isLoading) {
    return <LoadingIndicator message="Finding dupes..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to find dupes (code {lastErrorCode})</ErrorMessage>
    )
  }

  if (!dupes) {
    return <>Nothing to display</>
  }

  return dupes.map((dupeInfo) => <DupeOutput dupeInfo={dupeInfo} />)
}

const Dupes = () => {
  const isEditor = useIsEditor()

  if (!isEditor) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">Dupes</Heading>
      <BodyText>
        An interface for deleting duplicate authors while copying their data and
        switching the assets to the "main" author.
      </BodyText>
      <BodyText>
        Note you get a chance to "plan" what the site will do but any change you
        do is somewhat permanent.
      </BodyText>
      <View />
    </>
  )
}

export default Dupes
