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

import Button from '../button'
import Dialog from '../dialog'
import FormControls from '../form-controls'
import {
  AiFieldSuggestion,
  AiFieldSuggestions,
  AiSuggestQueuedItem,
  CollectionNames,
} from '@/modules/aisuggest'
import CheckboxInput from '../checkbox-input'
import useDatabaseQuery, {
  Operators,
  OrderDirections,
} from '@/hooks/useDatabaseQuery'
import NoResultsMessage from '../no-results-message'
import { DataStoreErrorCode } from '@/data-store'
import Heading from '../heading'
import useDataStoreEdit from '@/hooks/useDataStoreEdit'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import ErrorMessage from '../error-message'
import { fieldTypes } from '@/generic-forms'
import TagDiff from '../tag-diff'
import { QueueStatus } from '@/modules/common'
import TagChips from '../tag-chips'
import { getCategoryMeta } from '@/category-meta'
import { capitalize } from '@/utils'
import HintText from '../hint-text'
import { getScoreAsPercentage, Score } from '../ai-result'
import Tooltip from '../tooltip'
import { getHasFieldChanged } from '@/utils/equality'
import { colorGreyedOut } from '@/themes'

const useStyles = makeStyles({
  title: {
    fontSize: '125%',
    textAlign: 'center',
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
  suggestions,
  onDone,
}: {
  asset: FullAsset_Editor
  suggestions: AiFieldSuggestions
  onDone: () => void
}) => {
  const [finalChanges, setFinalChanges] = useState<Partial<Asset>>({})
  const [isSaving, isSuccess, lastErrorCode, save] = useDataStoreEdit<Asset>(
    AssetsCollectionNames.Assets,
    asset.id
  )

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
          [fieldName]: suggestions[fieldName].suggestedValue,
        }
      }
    })
  }

  const hasChanges = Object.keys(finalChanges).length > 0

  const suggestionsArr = Object.entries(suggestions)
    // .filter(([fieldName, suggestion]) =>
    //   getHasFieldChanged(asset[fieldName], suggestion.suggestedValue)
    // )
    // .filter(([fieldName, suggestion]) =>
    //   getShouldRenderSuggestion(fieldName, suggestion)
    // )
    .sort(([a], [b]) => {
      const ai = assetEditableFields.findIndex((f) => f.name === a)
      const bi = assetEditableFields.findIndex((f) => f.name === b)
      return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi)
    })

  return (
    <>
      <Heading variant="h2" noMargin>
        Suggested Fields
      </Heading>
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
                        <Tooltip title="The AI decided on a new value but we decided it was not good enough">
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
      <Heading variant="h2">Changes To Apply</Heading>
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
      </FormControls>
    </>
  )
}

const useAiSuggestion = (
  assetId: string
): [boolean, DataStoreErrorCode | null, AiSuggestQueuedItem | null] => {
  const [isLoading, lastErrorCode, lastResults] =
    useDatabaseQuery<AiSuggestQueuedItem>(
      CollectionNames.AiSuggestQueue,
      [
        ['recordtable', Operators.EQUALS, AssetsCollectionNames.Assets],
        ['recordid', Operators.EQUALS, assetId],
      ],
      {
        orderBy: ['createdat', OrderDirections.DESC],
      }
    )

  return [
    isLoading,
    lastErrorCode,
    Array.isArray(lastResults) && lastResults.length > 0
      ? lastResults[0]
      : null,
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
  const [isLoading, lastErrorCode, lastQueuedItem] = useAiSuggestion(assetId)
  const classes = useStyles()

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
          <div className={classes.title}>The AI suggestion is ready!</div>
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
        <div>The AI suggestion is "{lastQueuedItem.status}"</div>
      ) : (
        <div>
          No AI suggestion has been queued yet (it should happen automatically)
        </div>
      )}
      {isOpen && (
        <Dialog onClose={() => setIsOpen(false)}>
          {lastQueuedItem ? (
            <Form
              asset={asset}
              suggestions={lastQueuedItem.suggestions}
              onDone={() => {
                setIsOpen(false)
                onDone()
              }}
            />
          ) : (
            <NoResultsMessage>No queued item</NoResultsMessage>
          )}
        </Dialog>
      )}
    </>
  )
}

export default AiSuggestForm
