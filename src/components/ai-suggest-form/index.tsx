import { useState } from 'react'
import styled from '@emotion/styled'
import { makeStyles } from '@mui/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import SaveIcon from '@mui/icons-material/Save'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import InfoIcon from '@mui/icons-material/Info'

import {
  Asset,
  FullAsset_Editor,
  CollectionNames as AssetsCollectionNames,
} from '@/modules/assets'
import assetEditableFields from '@/editable-fields/assets'
import {
  AiFieldSuggestion,
  AiFieldSuggestions,
  AiSuggestQueuedItem,
  CollectionNames as AiSuggestCollectionNames,
  FunctionNames,
} from '@/modules/aisuggest'
import { QueueStatus } from '@/modules/common'
import { DataStoreErrorCode } from '@/data-store'
import { fieldTypes } from '@/generic-forms'
import { getCategoryMeta } from '@/category-meta'
import { capitalize } from '@/utils'
import { getHasFieldChanged } from '@/utils/equality'
import { colorGreyedOut } from '@/themes'

import useDatabaseQuery, {
  Operators,
  OrderDirections,
} from '@/hooks/useDatabaseQuery'
import useDataStoreEdit from '@/hooks/useDataStoreEdit'
import useDataStoreItemSync from '@/hooks/useDataStoreItemSync'
import useDataStoreFunction, { ErrorCode } from '@/hooks/useDataStoreFunction'
import { HydrateFn } from '@/hooks/useDataStore'
import useIsEditor from '@/hooks/useIsEditor'

import Button from '@/components/button'
import FormControls from '@/components/form-controls'
import CheckboxInput from '@/components/checkbox-input'
import NoResultsMessage from '@/components/no-results-message'
import Heading from '@/components/heading'
import LoadingIndicator from '@/components/loading-indicator'
import SuccessMessage from '@/components/success-message'
import ErrorMessage from '@/components/error-message'
import TagDiff from '@/components/tag-diff'
import TagChips from '@/components/tag-chips'
import {
  getScoreAsPercentage,
  RequeueButton,
  Score,
} from '@/components/ai-result'
import Tooltip from '@/components/tooltip'
import AiDialog from '@/components/ai-dialog'
import FormattedDate from '../formatted-date'

const useStyles = makeStyles({
  title: {
    fontSize: '125%',
    textAlign: 'center',
    fontWeight: '100',
  },
  divider: {},
  fieldDiff: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    '& > *': {
      width: '33.3%',
      textAlign: 'center',
    },
  },
  noValue: {
    color: colorGreyedOut,
  },
  heading: {
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      marginRight: '0.5rem',
    },
  },
  date: {
    fontSize: '75%',
  },
  icon: {
    fontSize: '200% !important',
  },
})

const FieldDiffValue = ({
  fieldName,
  value,
}: {
  fieldName: string
  value: any
}) => {
  const editableField = assetEditableFields.find(
    (field) => field.name === fieldName
  )

  const fieldType = editableField ? editableField.type : null

  switch (fieldType) {
    case fieldTypes.checkbox:
      return value === true
        ? 'Yes'
        : value === false
        ? 'No'
        : `Unknown checkbox value: ${value}`
    case fieldTypes.tags:
      return <TagChips tags={value} />
    default:
      if (Array.isArray(value)) {
        if (value.length === 0) return <NoValueText>(no values)</NoValueText>
        return value.join(', ')
      } else if (fieldName === 'category') {
        const category = getCategoryMeta(value)
        return category.nameSingular
      } else {
        return value.toString()
      }
  }
}

const FieldDiff = <TValue,>({
  fieldName,
  before,
  after,
}: {
  fieldName: string
  before: TValue
  after: TValue
}) => {
  const classes = useStyles()

  const editableField = assetEditableFields.find(
    (field) => field.name === fieldName
  )

  if (!editableField)
    return (
      <>
        Note: This field cannot be edited yet.{' '}
        <Tooltip title="We are not finished integrating AI into the site so this field is not ready yet">
          <InfoIcon />
        </Tooltip>
        <br />
        <FieldDiffValue fieldName={fieldName} value={after} />
      </>
    )

  switch (editableField.type) {
    case fieldTypes.tags:
      return (
        <TagDiff oldTags={before as string[]} newTags={after as string[]} />
      )
    default:
      return (
        <div className={classes.fieldDiff}>
          <div>
            <FieldDiffValue fieldName={fieldName} value={before} />
          </div>
          <Divider />
          <div>
            <FieldDiffValue fieldName={fieldName} value={after} />
          </div>
        </div>
      )
  }
}

const Divider = () => {
  const classes = useStyles()
  return (
    <div className={classes.divider}>
      <ChevronRightIcon />
    </div>
  )
}

const NoValueText = styled.span`
  color: ${colorGreyedOut};
`

const getShouldRenderSuggestion = (
  fieldName: string,
  suggestion: AiFieldSuggestion
): boolean => {
  // hide tags suggestion
  if (suggestion.options !== undefined && suggestion.options.length === 0)
    return false
  return true
}

const Form = ({
  asset,
  queuedItem,
  onDone,
}: {
  asset: FullAsset_Editor
  queuedItem: AiSuggestQueuedItem
  onDone: () => void
}) => {
  const classes = useStyles()
  const [finalChanges, setFinalChanges] = useState<Partial<Asset>>({})
  const [isSaving, isSuccess, lastErrorCode, save] = useDataStoreEdit<Asset>(
    AssetsCollectionNames.Assets,
    asset.id
  )
  const isEditor = useIsEditor()

  const onClickSave = async () => {
    console.debug(`saving the asset...`)

    save({
      ...finalChanges,
    })
  }

  const updateFinalChanges = (fieldName: string, val: boolean) => {
    setFinalChanges((currentVal) => {
      const current = currentVal ?? {}

      if (fieldName in current) {
        // Remove the field
        const { [fieldName]: _, ...rest } = current
        return rest
      } else {
        // Add the field from suggestions
        return {
          ...current,
          [fieldName]: queuedItem.suggestions[fieldName].suggestedValue,
        }
      }
    })
  }

  const hasChanges = Object.keys(finalChanges).length > 0

  const suggestionsArr = Object.entries(queuedItem.suggestions).sort(
    ([a], [b]) => {
      const ai = assetEditableFields.findIndex((f) => f.name === a)
      const bi = assetEditableFields.findIndex((f) => f.name === b)
      return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi)
    }
  )

  return (
    <>
      <div className={classes.heading}>
        <AutoAwesomeIcon className={classes.icon} />
        <div>
          <Heading variant="h2" noMargin>
            Suggested Fields
          </Heading>
          <FormattedDate
            date={queuedItem.lastmodifiedat || queuedItem.createdat}
            className={classes.date}
          />
        </div>
      </div>
      <Table size="small">
        <TableBody>
          {suggestionsArr.length ? (
            suggestionsArr.map(([fieldName, suggestion]) => {
              const oldValue = asset[fieldName]
              const suggestedValue = suggestion.suggestedValue
              const editableField = assetEditableFields.find(
                (field) => field.name === fieldName
              )
              return (
                <TableRow key={fieldName}>
                  <TableCell>
                    {editableField
                      ? editableField.label
                      : capitalize(fieldName)}
                  </TableCell>
                  <TableCell>
                    {!getShouldRenderSuggestion(fieldName, suggestion) ? (
                      <NoValueText>
                        (no suitable value){' '}
                        <Tooltip
                          title={
                            <>
                              The AI decided on a new value but we decided it
                              was not good enough:
                              <br />
                              <br />
                              <FieldDiffValue
                                fieldName={fieldName}
                                value={suggestion.suggestedValue}
                              />
                            </>
                          }>
                          <InfoIcon />
                        </Tooltip>
                      </NoValueText>
                    ) : getHasFieldChanged(
                        asset[fieldName],
                        suggestion.suggestedValue
                      ) ? (
                      <FieldDiff
                        fieldName={fieldName}
                        before={oldValue}
                        after={suggestedValue}
                      />
                    ) : (
                      <NoValueText>(no change)</NoValueText>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={suggestion.reason}>
                      <Score value={suggestion.confidence}>
                        {getScoreAsPercentage(suggestion.confidence)}%
                      </Score>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <CheckboxInput
                      value={
                        finalChanges !== null
                          ? fieldName in finalChanges
                          : false
                      }
                      onChange={(newVal) =>
                        updateFinalChanges(fieldName, newVal)
                      }
                      isDisabled={
                        editableField === undefined ||
                        !getShouldRenderSuggestion(fieldName, suggestion) ||
                        !getHasFieldChanged(
                          asset[fieldName],
                          suggestion.suggestedValue
                        )
                      }
                    />
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <NoResultsMessage>
              The AI could not suggest any better tags! Nice!
            </NoResultsMessage>
          )}
        </TableBody>
      </Table>
      <Heading variant="h2" noTopMargin>
        Changes To Apply
      </Heading>
      {hasChanges ? (
        <Table size="small">
          <TableBody>
            {Object.entries(finalChanges).map(([fieldName, fieldVal]) => {
              const editableField = assetEditableFields.find(
                (field) => field.name === fieldName
              )

              if (!editableField) {
                return (
                  <ErrorMessage>
                    No editable field found for "{fieldName}"
                  </ErrorMessage>
                )
              }

              return (
                <TableRow>
                  <TableCell>{editableField.label}</TableCell>
                  <TableCell>
                    <FieldDiffValue fieldName={fieldName} value={fieldVal} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      ) : (
        <NoResultsMessage>No changes to apply</NoResultsMessage>
      )}
      {isSaving && <LoadingIndicator message="Saving asset..." />}
      {isSuccess && (
        <SuccessMessage onOkay={() => onDone()}>
          Asset saved successfully
        </SuccessMessage>
      )}
      {lastErrorCode !== null && (
        <ErrorMessage>Failed to save asset (code {lastErrorCode})</ErrorMessage>
      )}
      <FormControls>
        <Button
          onClick={onClickSave}
          icon={<SaveIcon />}
          isDisabled={!hasChanges}>
          Save Asset
        </Button>
        <Button onClick={onDone} color="secondary">
          Cancel
        </Button>
        {isEditor && (
          <RequeueButton
            queueCollectionName={AiSuggestCollectionNames.AiSuggestQueue}
            assetId={asset.id}
            color="tertiary"
            hollow={false}
          />
        )}
      </FormControls>
    </>
  )
}

const useAiSuggestion = (
  assetId: string
): [
  boolean,
  DataStoreErrorCode | null,
  AiSuggestQueuedItem | null,
  HydrateFn
] => {
  const [isLoading, lastErrorCode, lastStaleResults, hydrate] =
    useDatabaseQuery<AiSuggestQueuedItem>(
      AiSuggestCollectionNames.AiSuggestQueue,
      [
        ['recordtable', Operators.EQUALS, AssetsCollectionNames.Assets],
        ['recordid', Operators.EQUALS, assetId],
      ],
      {
        orderBy: ['createdat', OrderDirections.DESC],
      }
    )

  const lastStaleResult: AiSuggestQueuedItem | null =
    lastStaleResults !== null && lastStaleResults.length > 0
      ? lastStaleResults[0]
      : null

  const [isSubscribing, lastErrorCodeSync, lastSyncResult] =
    useDataStoreItemSync<AiSuggestQueuedItem>(
      AiSuggestCollectionNames.AiSuggestQueue,
      lastStaleResult !== null ? lastStaleResult.id : false
    )

  const queuedItem: AiSuggestQueuedItem | null =
    lastSyncResult !== null && lastSyncResult !== false
      ? lastSyncResult
      : lastStaleResult

  return [
    isLoading,
    lastErrorCode !== null
      ? lastErrorCode
      : lastErrorCodeSync !== null
      ? lastErrorCodeSync
      : null,
    queuedItem,
    hydrate,
  ]
}

const useAiSuggestionRequest = (
  assetId: string
): [boolean, ErrorCode | null, null | string, () => Promise<string | null>] => {
  const [isCalling, lastErrorCode, lastFunctionResult, callFunc] =
    useDataStoreFunction<{ assetid: string }, string>(
      FunctionNames.RequestAiSuggestion
    )
  const requestAiSuggestion = async () => {
    const result = await callFunc({ assetid: assetId })

    if (result !== null) {
      return result[0]
    }

    return null
  }

  return [
    isCalling,
    lastErrorCode,
    lastFunctionResult !== null ? lastFunctionResult[0] : null,
    requestAiSuggestion,
  ]
}

const AiSuggestForm = ({
  assetId,
  asset,
  onDone,
}: {
  assetId: string
  asset: FullAsset_Editor
  onDone: () => void
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, lastErrorCode, lastQueuedItem, hydrate] =
    useAiSuggestion(assetId)
  const classes = useStyles()
  const [
    isCalling,
    lastErrorCodeFunction,
    lastFunctionResult,
    requestAiSuggestion,
  ] = useAiSuggestionRequest(assetId)

  const onClickRequest = async () => {
    console.debug(`onClickRequest`)
    const queuedItemId = await requestAiSuggestion()
    console.debug(`onClickRequest.done`, { queuedItemId })
    if (queuedItemId !== null) {
      hydrate()
    }
  }

  // this isn't a critical form so silently hide it
  if (isLoading || lastErrorCode !== null) {
    return null
  }

  const isAiSuggestionReady =
    lastQueuedItem !== null && lastQueuedItem.status === QueueStatus.Processed

  return (
    <>
      {isAiSuggestionReady ? (
        <div>
          <div className={classes.title}>The AI suggestion is ready! 🎉</div>
          <FormControls>
            <Button
              onClick={() => setIsOpen(true)}
              isDisabled={lastQueuedItem === null}
              color="ai"
              icon={<AutoAwesomeIcon />}>
              View Suggestions
            </Button>
          </FormControls>
        </div>
      ) : lastQueuedItem !== null ? (
        <div>
          {(() => {
            switch (lastQueuedItem.status) {
              case QueueStatus.Processed:
                return (
                  <SuccessMessage>
                    Processed! This message should disappear
                  </SuccessMessage>
                )
              case QueueStatus.Processing:
                return (
                  <LoadingIndicator message="Working on your suggestions..." />
                )
              case QueueStatus.Queued:
                return (
                  <LoadingIndicator message="Waiting to work on your suggestions..." />
                )
              case QueueStatus.Failed:
              default:
                return `Unknown status: ${lastQueuedItem.status}`
            }
          })()}
        </div>
      ) : (
        <div>
          {lastErrorCodeFunction !== null && (
            <ErrorMessage>
              Failed to request suggestions (code {lastErrorCodeFunction})
            </ErrorMessage>
          )}
          <div className={classes.title}>Use AI to suggest fields</div>
          <FormControls>
            <Button
              onClick={onClickRequest}
              isDisabled={isCalling}
              color="ai"
              icon={<AutoAwesomeIcon />}>
              Request Suggestion
            </Button>
          </FormControls>
        </div>
      )}
      {isOpen && (
        <AiDialog onClose={() => setIsOpen(false)}>
          {lastQueuedItem ? (
            <Form
              asset={asset}
              onDone={() => {
                setIsOpen(false)
                onDone()
              }}
              queuedItem={lastQueuedItem}
            />
          ) : (
            <NoResultsMessage>No queued item</NoResultsMessage>
          )}
        </AiDialog>
      )}
    </>
  )
}

export default AiSuggestForm
