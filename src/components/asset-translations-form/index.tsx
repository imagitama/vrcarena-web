import { Suspense, useState } from 'react'
import styled from '@emotion/styled'

import { AssetFields, AssetTranslation } from '@/modules/assets'
import {
  AssetTranslationResult,
  FunctionNames,
  CollectionNames,
  TranslateQueuedItem,
  TranslateQueuedItemStatus,
} from '@/modules/translatequeue'
import { Refresh as RefreshIcon } from '@/icons'

import useDataStoreItem from '@/hooks/useDataStoreItem'
import useDataStoreItemSync from '@/hooks/useDataStoreItemSync'
import useDataStoreFunction from '@/hooks/useDataStoreFunction'

import Paper from '../paper'
import Markdown from '../markdown'
import NoResultsMessage from '../no-results-message'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Button, { DeleteButton } from '../button'
import ConnectionIndicator, {
  getConnectionLabel,
  getConnectionStatusFromHookResult,
} from '../connection-indicator'
import Tooltip from '../tooltip'
import Select, { MenuItem } from '../select'
import FailureInfoOutput from '../failure-info-output'
import FormControls from '../form-controls'
import Heading from '../heading'
import InfoMessage from '../info-message'
import WarningMessage from '../warning-message'
import { allowedLocales } from '@/config'
import Tabs from '../tabs'
import AssetTitleEditor from '../asset-title-editor'
import MarkdownEditor from '../markdown-editor'
import TextInput from '../text-input'

interface RequestAssetTranslationPayload {
  fields: { title: string; description: string }
  locale: string
  assetid: string | null
}
type RequestAssetTranslationResult = string

enum RequestAiSuggestionErrorCode {
  USER_NOT_VERIFIED = 'USER_NOT_VERIFIED',
  //   ALREADY_IN_QUEUE = 'ALREADY_IN_QUEUE',
}

enum ErrorNames {
  MissingDataTranslateError = 'MissingDataTranslateError',
  InvalidResponseTranslateError = 'InvalidResponseTranslateError',
}

const StyledAssetTranslationOutput = styled.div`
  margin-bottom: 1rem;
`
const Root = styled.div`
  position: relative;
`
const ConnectionStatus = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 100;
`

const QueueItem = ({
  queuedItemId,
  onDone,
}: {
  queuedItemId: string
  onDone: (locale: string, result: AssetTranslationResult) => void
}) => {
  const [isLoading, lastErrorCode, staleQueuedItem, hydrate] =
    useDataStoreItem<TranslateQueuedItem>(
      CollectionNames.TranslateQueue,
      queuedItemId,
      {
        queryName: `view-translate-queue_${queuedItemId}`,
      }
    )

  const [isSubscribing, isSubscribed, lastErrorCodeSync, liveQueuedItem] =
    useDataStoreItemSync<TranslateQueuedItem>(
      CollectionNames.TranslateQueue,
      queuedItemId,
      {
        queryName: `view-translate-queue_sync_${queuedItemId}`,
      }
    )

  const queuedItem = liveQueuedItem || staleQueuedItem

  console.debug(`QueueItem.render`, {
    staleQueuedItem,
    liveQueuedItem,
    queuedItem,
  })

  const connectionStatus = getConnectionStatusFromHookResult(
    isSubscribing,
    isSubscribed,
    lastErrorCode
  )

  if (lastErrorCode !== null)
    return (
      <ErrorMessage errorCode={lastErrorCode}>
        Failed to load queued item
      </ErrorMessage>
    )

  if (isLoading) return <LoadingIndicator message="Loading..." />

  const onClickUse = () => {
    if (!queuedItem || !queuedItem.result)
      throw new Error('No queued item or result')
    onDone(queuedItem.locale, queuedItem.result)
  }

  const RefreshButton = () => (
    <FormControls>
      <Button size="small" color="secondary" onClick={hydrate}>
        Refresh
      </Button>
    </FormControls>
  )

  return (
    <Root>
      <ConnectionStatus>
        <Tooltip
          title={getConnectionLabel(connectionStatus, lastErrorCodeSync)}>
          <ConnectionIndicator status={connectionStatus} />
        </Tooltip>
      </ConnectionStatus>
      {queuedItem ? (
        <>
          {queuedItem.status === TranslateQueuedItemStatus.Processed ? (
            <>
              <AssetTranslationOutput
                locale={queuedItem.locale}
                fields={queuedItem.result!}
              />
              <FormControls>
                <Button onClick={onClickUse} color="secondary" hollow={false}>
                  Add This Translation
                </Button>
              </FormControls>
            </>
          ) : queuedItem.status === TranslateQueuedItemStatus.Processing ? (
            <LoadingIndicator
              message={
                <>
                  Processing...
                  <RefreshButton />
                </>
              }
            />
          ) : queuedItem.status === TranslateQueuedItemStatus.Failed ? (
            <ErrorMessage>
              {queuedItem.failureinfo ? (
                <FailureInfoOutput
                  failureInfo={queuedItem.failureinfo}
                  messages={{
                    [ErrorNames.MissingDataTranslateError]:
                      'Missing title or description',
                    [ErrorNames.InvalidResponseTranslateError]:
                      'Something failed',
                  }}
                />
              ) : (
                'Failed (no reason)'
              )}
            </ErrorMessage>
          ) : (
            <LoadingIndicator
              message={
                <>
                  Queued
                  <RefreshButton />
                </>
              }
            />
          )}
        </>
      ) : (
        <LoadingIndicator
          message={
            <>
              Waiting
              <RefreshButton />
            </>
          }
        />
      )}
    </Root>
  )
}

const RequestTranslationForm = ({
  assetId,
  title,
  description,
  onDone,
}: {
  assetId: string | null
  title: string | null
  description: string | null
  onDone: (locale: string, result: AssetTranslationResult) => void
}) => {
  const [selectedLocale, setSelectedLocale] = useState<null | string>(null)
  const [isRequesting, lastErrorCode, queuedItemId, requestTranslation, clear] =
    useDataStoreFunction<
      RequestAssetTranslationPayload,
      RequestAssetTranslationResult
    >(
      FunctionNames.RequestAssetTranslation,
      Object.values(RequestAiSuggestionErrorCode)
    )

  if (isRequesting)
    return <LoadingIndicator message="Requesting translation..." />

  if (lastErrorCode !== null)
    return (
      <ErrorMessage errorCode={lastErrorCode as string}>
        Failed to request
      </ErrorMessage>
    )

  const isAllowedToRequest = selectedLocale && title && description

  const onClickRequest = async () => {
    if (!isAllowedToRequest) return
    await requestTranslation({
      fields: {
        title,
        description,
      },
      locale: selectedLocale,
      assetid: assetId || null,
    })
  }

  return (
    <div>
      {!title || !description ? (
        <WarningMessage noTopMargin>
          This asset must have a title and description
        </WarningMessage>
      ) : null}
      {queuedItemId !== null ? (
        <Suspense fallback={<LoadingIndicator message="Loading..." />}>
          <QueueItem
            queuedItemId={queuedItemId}
            onDone={(locale, fields) => {
              clear()
              onDone(locale, fields)
            }}
          />
        </Suspense>
      ) : null}
      <FormControls>
        <Select
          label="Target Locale"
          size="small"
          style={{ minWidth: '200px' }}
          value={selectedLocale}
          onChange={(e) => setSelectedLocale(e.target.value as string)}
          disabled={isRequesting}>
          {Object.entries(allowedLocales).map(([locale, label]) => (
            <MenuItem key={locale} value={locale}>
              {label}
            </MenuItem>
          ))}
        </Select>
        <Button
          color="secondary"
          hollow={false}
          isDisabled={isRequesting || !isAllowedToRequest}
          onClick={onClickRequest}>
          Request Translation
        </Button>
      </FormControls>
    </div>
  )
}

export const AssetTranslationOutput = ({
  locale,
  fields,
  onRemove,
}: {
  locale: string
  fields: AssetTranslationResult
  onRemove?: () => void
}) => (
  <StyledAssetTranslationOutput>
    <Heading variant="h4" noTopMargin>
      Locale: {locale}{' '}
      {onRemove && <DeleteButton onClick={onRemove}>Remove</DeleteButton>}
    </Heading>
    <Paper>
      <Heading variant="h1" noMargin>
        {fields.title}
      </Heading>
    </Paper>
    <Paper>
      <Markdown source={fields.description} />
    </Paper>
  </StyledAssetTranslationOutput>
)

const TranslationEditor = ({
  locale,
  fields,
  onChange,
  onRemove,
}: {
  locale: string
  fields: AssetTranslationResult
  onChange: (fields: AssetTranslationResult) => void
  onRemove: () => void
}) => {
  const onFieldChange = (
    fieldName: keyof AssetTranslationResult,
    val: string
  ) =>
    onChange({
      ...fields,
      [fieldName]: val,
    })
  return (
    <>
      <DeleteButton onClick={onRemove}>Remove {locale}</DeleteButton>
      <Heading variant="h4">Title</Heading>
      <TextInput
        fullWidth
        value={fields.title}
        onChange={(e) => onFieldChange('title', e.target.value)}
      />
      <Heading variant="h4">Description</Heading>
      <MarkdownEditor
        content={fields.description}
        onChange={(val) => onFieldChange('description', val)}
      />
    </>
  )
}

const AssetTranslationsForm = ({
  assetId,
  title,
  description,
  value,
  onChange,
}: {
  assetId: string | null
  title: string | null
  description: string | null
  value: AssetFields['translations']
  onChange: (newVal: AssetFields['translations']) => void
}) => {
  const updateLocale = (locale: string, fields: AssetTranslationResult) =>
    onChange(
      value
        ? {
            ...value,
            [locale]: fields,
          }
        : {
            [locale]: fields,
          }
    )

  const removeLocale = (locale: string) => {
    let updated: AssetFields['translations'] = { ...value }
    delete updated[locale]
    if (Object.keys(updated).length === 0) {
      updated = null
    }
    onChange(updated)
  }

  return (
    <>
      <InfoMessage hideId="how-translations-work" title="How Translations Work">
        When you request a translation we send the title, description and locale
        to Google for translating. Translations are shown as tabs in the asset
        with a message explaining how we translated it.
      </InfoMessage>
      {value !== null ? (
        <>
          <Heading variant="h3">Translations</Heading>
          <Tabs
            items={Object.entries(value).map(([locale, fields]) => ({
              name: locale,
              label:
                locale in allowedLocales
                  ? allowedLocales[locale as keyof typeof allowedLocales]
                  : locale,
              contents: (
                <TranslationEditor
                  locale={locale}
                  fields={fields}
                  onChange={(newFields) => updateLocale(locale, newFields)}
                  onRemove={() => removeLocale(locale)}
                />
              ),
            }))}
          />
        </>
      ) : (
        <NoResultsMessage>No translations yet</NoResultsMessage>
      )}
      <Heading variant="h3">Request Translation</Heading>
      <RequestTranslationForm
        assetId={assetId}
        title={title}
        description={description}
        onDone={updateLocale}
      />
    </>
  )
}

export default AssetTranslationsForm
