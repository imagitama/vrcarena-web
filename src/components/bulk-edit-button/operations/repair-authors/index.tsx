import { useSelector } from 'react-redux'
import { useState } from 'react'
import SaveIcon from '@mui/icons-material/Save'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import { RootState } from '@/modules'
import useDataStoreItems from '@/hooks/useDataStoreItems'
import {
  Asset,
  CollectionNames as AssetsCollectionNames,
  ViewNames as AssetsViewNames,
} from '@/modules/assets'
import {
  Author,
  AuthorMeta,
  CollectionNames as AuthorsCollectionNames,
} from '@/modules/authors'

import Heading from '@/components/heading'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import AuthorResultsItem from '@/components/author-results-item'
import Items from '@/components/items'
import CheckboxInput from '@/components/checkbox-input'
import FormControls from '@/components/form-controls'
import Button from '@/components/button'
import { shortIdLength } from '@/config'

import authorEditableFields from '@/editable-fields/authors'
import WarningMessage from '@/components/warning-message'
import { updateRecord, updateRecords } from '@/data-store'
import { handleError } from '@/error-handling'
import useSupabaseClient from '@/hooks/useSupabaseClient'
import { AccessStatus } from '@/modules/common'
import SuccessMessage from '@/components/success-message'
import NoResultsMessage from '@/components/no-results-message'
import FieldOutput from '@/components/field-output'

const Authors = ({
  assets,
  authors,
  primaryAuthorId,
  selectAuthorId,
  finalFields,
  toggleFinalField,
}: {
  assets: Asset[]
  authors: Author[]
  primaryAuthorId: string | null
  selectAuthorId: (id: string) => void
  finalFields: FinalFields
  toggleFinalField: (authorId: string, fieldName: string, val: any) => void
}) => {
  const authorIds: string[] = assets
    .map((a) => a.author)
    .filter(
      (id, i, arr) => id !== null && arr.findIndex((x) => x === id) === i
    ) as string[]

  return (
    <Items>
      {authorIds.map((authorId) => {
        const author = authors.find((a) => a.id === authorId)

        return (
          <div key={authorId} style={{ width: '300px' }}>
            <CheckboxInput
              value={authorId === primaryAuthorId}
              onClick={() => selectAuthorId(authorId)}
              label={`Use this author (${authorId.substring(
                0,
                shortIdLength
              )})`}
            />
            {author ? (
              <>
                <AuthorResultsItem
                  author={author}
                  isSelected={authorId === primaryAuthorId}
                />
                <Table size="small">
                  <TableBody>
                    {authorEditableFields
                      .filter((field) => {
                        const authorVal = author[field.name]
                        return (
                          authorVal !== null &&
                          authorVal !== '' &&
                          (Array.isArray(authorVal)
                            ? authorVal.length > 0
                            : true)
                        )
                      })
                      .map((field) => {
                        const fieldName = field.name
                        const authorVal = author[fieldName]
                        const isSelected =
                          fieldName in finalFields &&
                          finalFields[fieldName].sourceAuthorId === author.id
                        return (
                          <TableRow key={fieldName}>
                            <TableCell>
                              <strong>{field.label}</strong>
                            </TableCell>
                            <TableCell>
                              <FieldOutput
                                editableField={authorEditableFields.find(
                                  (field) => field.name === fieldName
                                )}>
                                {authorVal}
                              </FieldOutput>
                            </TableCell>
                            <TableCell>
                              <CheckboxInput
                                value={isSelected}
                                onClick={() =>
                                  toggleFinalField(
                                    author.id,
                                    fieldName as string,
                                    authorVal
                                  )
                                }
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </>
            ) : (
              <ErrorMessage>Failed to load author</ErrorMessage>
            )}
            <ul></ul>
          </div>
        )
      })}
    </Items>
  )
}

interface FieldToEdit {
  value: any
  sourceAuthorId: string
}

type FinalFields = {
  [fieldName: string]: FieldToEdit
}

const RepairAuthorsOperation = () => {
  const assetIds = useSelector<RootState, string[]>(
    (state) => state.app.bulkEditIds || []
  )
  const [isLoadingAssets, lastErrorCodeAssets, assets] =
    useDataStoreItems<Asset>(AssetsCollectionNames.Assets, assetIds)

  let authorIds: string[] = assets
    ? (assets
        .map((a) => a.author)
        .filter(
          (id, i, arr) => id !== null && arr.findIndex((x) => x === id) === i
        ) as string[])
    : []

  const [isLoadingAuthors, lastErrorCodeAuthors, authors] =
    useDataStoreItems<Author>(
      AuthorsCollectionNames.Authors,
      authorIds.length > 0 ? authorIds : false
    )

  const [primaryAuthorId, setPrimaryAuthorId] = useState<null | string>(null)
  const [finalFields, setFinalFields] = useState<FinalFields>({})
  const client = useSupabaseClient()

  const [isSavingPrimaryAuthor, setIsSavingPrimaryAuthor] = useState(false)
  const [isSavingAssets, setIsSavingAssets] = useState(false)
  const [isSavingDeletedAssets, setIsSavingDeletedAssets] = useState(false)
  const [isFinallyDone, setIsFinallyDone] = useState(false)

  const authorIdsToDelete = primaryAuthorId
    ? authorIds.filter((id) => id !== primaryAuthorId)
    : []

  if (isLoadingAssets || !assets) {
    return <LoadingIndicator message="Loading assets..." />
  }
  if (isLoadingAuthors || !authors) {
    return <LoadingIndicator message="Loading authors..." />
  }

  if (lastErrorCodeAssets !== null) {
    return (
      <ErrorMessage>
        Failed to load assets (code {lastErrorCodeAssets})
      </ErrorMessage>
    )
  }
  if (lastErrorCodeAuthors !== null) {
    return (
      <ErrorMessage>
        Failed to load authors (code {lastErrorCodeAuthors})
      </ErrorMessage>
    )
  }

  const primaryAuthor: Author | null =
    authors && primaryAuthorId !== null
      ? authors.find((a) => a.id === primaryAuthorId) || null
      : null

  const canPerform = primaryAuthorId !== null

  const onClickPerform = async () => {
    if (!canPerform) throw new Error('Need a primary ID')

    try {
      console.debug(`saving primary author...`)

      const newPrimaryAuthorFields: Partial<Author> = {}

      for (const [fieldName, fieldInfo] of Object.entries(finalFields)) {
        newPrimaryAuthorFields[fieldName] = fieldInfo.value
      }

      setIsFinallyDone(false)
      setIsSavingPrimaryAuthor(true)

      await updateRecord<Author>(
        client,
        AuthorsCollectionNames.Authors,
        primaryAuthorId,
        newPrimaryAuthorFields
      )

      setIsSavingPrimaryAuthor(false)
      setIsSavingAssets(true)

      console.debug(`updating assets...`)

      await updateRecords<Asset>(
        client,
        AssetsCollectionNames.Assets,
        assetIds,
        {
          author: primaryAuthorId,
        }
      )

      setIsSavingAssets(false)
      setIsSavingDeletedAssets(true)

      console.debug(`deleting authors...`, { authorIdsToDelete })

      await updateRecords<AuthorMeta>(
        client,
        AuthorsCollectionNames.AuthorsMeta,
        authorIdsToDelete,
        {
          accessstatus: AccessStatus.Deleted,
        }
      )

      setIsSavingDeletedAssets(false)
      setIsFinallyDone(true)
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const toggleFinalField = (authorId: string, fieldName: string, val: any) => {
    const isAlreadyThere =
      fieldName in finalFields &&
      finalFields[fieldName].sourceAuthorId === authorId

    if (isAlreadyThere) {
      setFinalFields((fields) => {
        const newFields = { ...fields }
        delete newFields[fieldName]
        return newFields
      })
    } else {
      setFinalFields((fields) => {
        const newFields = { ...fields }
        newFields[fieldName] = {
          value: val,
          sourceAuthorId: authorId,
        }
        return newFields
      })
    }
  }

  return (
    <>
      <Heading variant="h3" noMargin>
        Assets
      </Heading>
      <ul>
        {assets.map((asset) => (
          <li key={asset.id}>{asset.title}</li>
        ))}
      </ul>
      <Heading variant="h3" noMargin>
        Authors
      </Heading>
      <Authors
        assets={assets}
        authors={authors}
        primaryAuthorId={primaryAuthorId}
        selectAuthorId={(id) => setPrimaryAuthorId(id)}
        finalFields={finalFields}
        toggleFinalField={toggleFinalField}
      />
      <Heading variant="h3" noMargin>
        Result
      </Heading>
      {canPerform ? (
        <>
          <ol>
            <li>
              These assets will have their author set to{' '}
              {primaryAuthor
                ? `"${primaryAuthor.name}" (${primaryAuthor.id.substring(
                    0,
                    shortIdLength
                  )})`
                : ''}
              :
              <ul>
                {assets.map((asset) => (
                  <li key={asset.id}>{asset.title}</li>
                ))}
              </ul>
            </li>
            <li>
              That author will be edited with these fields:
              <Table size="small">
                <TableBody>
                  {primaryAuthor ? (
                    Object.entries(finalFields).length ? (
                      Object.entries(finalFields).map(([fieldName, info]) => {
                        const editableField = authorEditableFields.find(
                          (field) => field.name === fieldName
                        )!
                        return (
                          <TableRow key={fieldName}>
                            <TableCell>
                              <strong>{editableField.label}</strong>
                            </TableCell>
                            <TableCell>
                              <FieldOutput editableField={editableField}>
                                {primaryAuthor[fieldName]}
                              </FieldOutput>
                            </TableCell>
                            <TableCell>
                              <FieldOutput>{info.value}</FieldOutput>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell>(no fields will be changed)</TableCell>
                      </TableRow>
                    )
                  ) : (
                    <TableRow>
                      <TableCell>(no primary author selected)</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </li>
            <li>
              These authors will be deleted:
              <ul>
                {authorIdsToDelete.length ? (
                  authorIdsToDelete.map((authorId) => {
                    const author = authors.find((a) => a.id === authorId)

                    if (!author) {
                      return (
                        <ErrorMessage key={authorId}>
                          Failed to find author "{authorId}"
                        </ErrorMessage>
                      )
                    }

                    return (
                      <li key={authorId}>
                        {author.name} ({author.id.substring(0, shortIdLength)})
                      </li>
                    )
                  })
                ) : (
                  <li>(no authors will be deleted)</li>
                )}
              </ul>
            </li>
          </ol>
          <WarningMessage>
            These actions cannot be (automatically) reversed.
            <br />
            <br />
            No data will actually be deleted and all changes are recorded for
            history.
          </WarningMessage>
        </>
      ) : (
        <NoResultsMessage>
          You must pick a primary author first
        </NoResultsMessage>
      )}
      {isSavingPrimaryAuthor && (
        <LoadingIndicator message="Saving primary author..." />
      )}
      {isSavingAssets && (
        <LoadingIndicator message="Updating assets with new primary author..." />
      )}
      {isSavingDeletedAssets && (
        <LoadingIndicator message="Deleting other authors..." />
      )}
      {isFinallyDone && (
        <SuccessMessage>Everything has been saved!</SuccessMessage>
      )}
      <FormControls>
        <Button
          onClick={onClickPerform}
          icon={<SaveIcon />}
          isDisabled={!canPerform}>
          Perform Actions
        </Button>
      </FormControls>
    </>
  )
}

export default RepairAuthorsOperation
