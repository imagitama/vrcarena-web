import React, { useEffect, useState } from 'react'
import SyncIcon from '@material-ui/icons/Sync'
import SaveIcon from '@material-ui/icons/Save'

import {
  SyncFieldTypes,
  SyncPlatformName,
  SyncResult,
  getSyncPlatformNameFromUrl,
  SyncPlatformInfo,
  SyncFieldResult,
  SyncField,
  ErrorCode,
} from '../../syncing'
import GumroadSyncInfo from '../../syncing/gumroad'
import BoothSyncInfo from '../../syncing/booth'
import ItchSyncInfo from '../../syncing/itch'

import useFirebaseFunction from '../../hooks/useFirebaseFunction'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Button from '../button'
import FormControls from '../form-controls'

import ExperimentalMessage from '../experimental-message'
import useNotice from '../../hooks/useNotice'
import { handleError } from '../../error-handling'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import InfoMessage from '../info-message'
import { addQuotesToDescription } from '../../utils/formatting'
import { SyncContext } from './hooks/useSync'
import FormField from './components/form-field'
import WarningMessage from '../warning-message'
import { capitalize } from '../../utils'

export const getSyncPlatformInfoFromName = (
  name: SyncPlatformName
): SyncPlatformInfo<any> => {
  switch (name) {
    case SyncPlatformName.Gumroad:
      return GumroadSyncInfo
    case SyncPlatformName.Booth:
      return BoothSyncInfo
    case SyncPlatformName.Itch:
      return ItchSyncInfo
    default:
      throw new Error(`Unknown name "${name}"`)
  }
}

const getInitialFieldsToSave = <TRecord,>(
  fields: SyncFieldResult[]
): TRecord => {
  const obj: { [fieldName: string]: any } = {}

  for (const field of fields) {
    let value

    switch (field.type) {
      case SyncFieldTypes.ImageUrl:
        value = ''
        break
      case SyncFieldTypes.ThumbnailFromUrls:
        value = ''
        break
      case SyncFieldTypes.Markdown:
        value = addQuotesToDescription(field.value)
        break
      case SyncFieldTypes.Attachments:
        value = []
        break
      case SyncFieldTypes.RecordId:
        if (field.value) {
          value = field.value
        }
        break
      default:
        value = field.value || ''
    }

    if (value !== undefined) {
      obj[field.ourName as string] = value
    }
  }

  return obj as TRecord
}

const getFieldsToSave = (
  currentFields: object,
  excludedFieldNames: string[]
): object =>
  // @ts-ignore
  !console.debug('getFieldsToSave', {
    currentFields,
    excludedFieldNames,
  }) &&
  Object.entries(currentFields).reduce(
    (newFields, [fieldName, fieldValue]) =>
      (excludedFieldNames.includes(fieldName)
        ? {
            ...newFields,
          }
        : {
            ...newFields,
            [fieldName]: fieldValue,
          }) as object,
    {} as object
  )

const getFieldsToRenderWith = (
  currentFields: object,
  disabledFieldNames: string[]
): object =>
  // @ts-ignore
  !console.debug('getFieldsToRenderWith', {
    currentFields,
    disabledFieldNames,
  }) &&
  Object.entries(currentFields).reduce(
    (newFields, [fieldName, fieldValue]) =>
      (disabledFieldNames.includes(fieldName)
        ? {
            ...newFields,
          }
        : {
            ...newFields,
            [fieldName]: fieldValue,
          }) as object,
    {} as object
  )

const getOutputForErrorCode = (errorCode: ErrorCode): string => {
  switch (errorCode) {
    case ErrorCode.NoExist:
      return 'does not appear to exist'
    case ErrorCode.BadPermissions:
      return 'requires even more permissions'
    case ErrorCode.BadRequest:
      return 'our request was incorrectly formatted'
    case ErrorCode.PlatformUnavailable:
      return 'platform unavailable'
    default:
      return 'unknown'
  }
}

enum ValidationReason {
  Empty,
}

const getValidationIssues = <TRecord extends object>(
  fields: TRecord
): ValidationIssue[] => {
  const issues: ValidationIssue[] = []

  for (const fieldName in fields) {
    if (!fields[fieldName]) {
      issues.push({
        fieldName,
        reason: ValidationReason.Empty,
      })
    }
  }

  return issues
}

interface ValidationIssue {
  fieldName: string
  reason: ValidationReason
}

const SyncForm = <TRecord extends object>({
  collectionName,
  parentId,
  urlToSync,
  onChange,
  overrideSave,
  onDone,
}: {
  collectionName: string
  parentId: string
  urlToSync: string
  onChange: (fields: TRecord) => void
  overrideSave?: (fields: TRecord) => void
  onDone?: () => void
}) => {
  const platformName = getSyncPlatformNameFromUrl(urlToSync)

  if (platformName === undefined) {
    throw new Error(`Could not get platform name for ${urlToSync}`)
  }

  const platformInfo = getSyncPlatformInfoFromName(platformName)

  const [disabledFieldNames, setDisabledFieldNames] = useState<string[]>([])
  const [fieldsToSave, setFieldsToSave] = useState<TRecord>({} as TRecord)
  const [isLoading, isError, lastResult, performSync] = useFirebaseFunction<
    { urlToSync: string; platformName: string },
    SyncResult
  >('syncWithPlatform')
  const [isNoticeHidden, hideNotice] = useNotice('experimental-sync')
  const [lastValidationIssues, setLastValidationIssues] = useState<
    ValidationIssue[]
  >([])

  const [isSaving, , isSavingError, save] = useDatabaseSave(
    collectionName,
    parentId
  )

  const sync = async () => {
    setLastValidationIssues([])

    const payload = {
      urlToSync,
      platformName,
    }

    console.debug(`SyncForm.sync`, { payload })

    const result = await performSync(payload)

    console.debug(`SyncForm.sync.result`, { result })

    if (result.errorCode) {
      console.debug(`sync failed`, result.errorCode)
      return
    }

    const initialFields = getInitialFieldsToSave<TRecord>(result.fields)

    setFieldsToSave(initialFields)

    onChange(initialFields)
  }

  const setField = (name: string, value: any) => {
    console.debug(`SyncForm.setField`, { name, value })

    setFieldsToSave((currentFields) => {
      const newFields = {
        ...currentFields,
        [name]: value,
      }

      const fieldsToRenderWith = getFieldsToRenderWith(
        newFields,
        disabledFieldNames
      ) as TRecord

      // updates the visual diff (use onDone after saving here)
      onChange(fieldsToRenderWith)

      return newFields
    })
  }

  const toggleField = (name: string) => {
    console.debug(`SyncForm.toggleField`, { name })

    setDisabledFieldNames((currentNames) => {
      const newNames = currentNames.includes(name)
        ? currentNames.filter((currentName) => currentName !== name)
        : currentNames.concat([name])

      const fieldsToRenderWith = getFieldsToRenderWith(
        fieldsToSave,
        newNames
      ) as TRecord

      onChange(fieldsToRenderWith)

      return newNames
    })
  }

  const onApplyClick = async () => {
    try {
      const excludedFieldNames = disabledFieldNames.concat(
        platformInfo.fields
          .filter((field) => field.type === SyncFieldTypes.Ignored)
          .map((field) => field.ourName as string)
      )

      const fieldsToActuallySave = getFieldsToSave(
        fieldsToSave,
        excludedFieldNames
      ) as TRecord

      console.debug(`SyncForm.onApplyClick`, { fieldsToActuallySave })

      if (Object.keys(fieldsToActuallySave).length === 0) {
        console.warn('Trying to save without any fields', {
          fieldsToActuallySave,
        })
        return
      }

      const newValidationIssues = getValidationIssues(fieldsToActuallySave)
      setLastValidationIssues(newValidationIssues)

      if (newValidationIssues.length) {
        console.debug('validation issues:', newValidationIssues)
        return
      }

      if (overrideSave) {
        overrideSave(fieldsToActuallySave)

        if (onDone) {
          onDone()
        }
        return
      }

      await save({
        ...fieldsToActuallySave,
      })

      // note: on save this component is re-mounted so cannot rely on isSuccess
      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save asset', err)
      handleError(err)
    }
  }

  useEffect(() => {
    sync()
  }, [urlToSync])

  if (isLoading) {
    return (
      <LoadingIndicator
        message={`Syncing with ${capitalize(platformName)}...`}
      />
    )
  }

  if (isError || (lastResult && lastResult.errorCode !== null)) {
    return (
      <ErrorMessage onRetry={sync} onOkay={onDone}>
        Failed to sync:{' '}
        {isError
          ? 'internal error'
          : getOutputForErrorCode(
              ErrorCode[lastResult!.errorCode! as keyof typeof ErrorCode]
            )}
      </ErrorMessage>
    )
  }

  if (isSaving) {
    return <LoadingIndicator message="Saving record..." />
  }

  if (isSavingError) {
    return <ErrorMessage>Failed to save record</ErrorMessage>
  }

  if (!lastResult) {
    return (
      <>
        <Button icon={<SyncIcon />} onClick={() => sync()}>
          Sync With {capitalize(platformName)}
        </Button>
      </>
    )
  }

  const SubmitButton = () => (
    <FormControls>
      <Button icon={<SaveIcon />} onClick={onApplyClick}>
        Apply & Finish Sync
      </Button>
    </FormControls>
  )

  return (
    <SyncContext.Provider
      value={{
        parentId,
        lastResult,
        fields: fieldsToSave,
        setField,
        disabledFieldNames,
        toggleField,
      }}>
      {!isNoticeHidden && (
        <ExperimentalMessage
          title="Syncing With Third Parties"
          controls={[<Button onClick={hideNotice}>OK</Button>]}>
          Syncing with third parties like Gumroad and Booth is experimental and
          may break overnight if they ever change their websites
        </ExperimentalMessage>
      )}
      <SubmitButton />
      {lastResult !== null ? (
        <InfoMessage>
          Sync successful. Found {lastResult.fields.length} fields. Select which
          fields you want to overwrite your record with:
        </InfoMessage>
      ) : null}
      {lastValidationIssues.length ? (
        <WarningMessage>
          There was an issue with applying your changes. Are you sure you have
          completed all of the steps?
          <ul>
            {lastValidationIssues.map((issue) => (
              <li key={issue.fieldName}>
                {issue.fieldName} {issue.reason}
              </li>
            ))}
          </ul>
        </WarningMessage>
      ) : null}
      {platformInfo.fields
        .filter((field) => field.type !== SyncFieldTypes.Ignored)
        .map((field) => (
          <FormField<TRecord>
            key={field.ourName as string}
            fieldMeta={field as SyncField<TRecord>}
          />
        ))}
      <SubmitButton />
    </SyncContext.Provider>
  )
}

export default SyncForm
