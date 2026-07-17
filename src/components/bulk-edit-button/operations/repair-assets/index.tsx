import { useSelector } from 'react-redux'
import { useState } from 'react'
import SaveIcon from '@mui/icons-material/Save'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import styled from '@emotion/styled'

import { RootState } from '@/modules'
import useDataStoreItems from '@/hooks/useDataStoreItems'
import {
  Asset,
  AssetForList,
  AssetMeta,
  CollectionNames as AssetsCollectionNames,
  CollectionNames,
  DeletionReason,
  SourceInfo,
  ViewNames,
} from '@/modules/assets'

import Heading from '@/components/heading'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import AssetResultsItem from '@/components/asset-results-item'
import CheckboxInput from '@/components/checkbox-input'
import FormControls from '@/components/form-controls'
import Button from '@/components/button'

import assetEditableFields from '@/editable-fields/assets'
import WarningMessage from '@/components/warning-message'
import { updateRecord, updateRecords } from '@/data-store'
import { handleError } from '@/error-handling'
import useSupabaseClient from '@/hooks/useSupabaseClient'
import { AccessStatus } from '@/modules/common'
import SuccessMessage from '@/components/success-message'
import NoResultsMessage from '@/components/no-results-message'
import FieldOutput from '@/components/field-output'
import Tabs from '@/components/tabs'
import { getShortId } from '@/utils/formatting'

const Items = styled.div`
  display: flex;
  overflow-x: scroll;
  overflow-y: scroll;
  min-height: 600px;
`
const Item = styled.div`
  width: 500px;
`

const PrimaryAssetSelector = ({
  assetsForList,
  primaryAssetId,
  onSelect,
}: {
  assetsForList: AssetForList[]
  primaryAssetId: string | null
  onSelect: (id: string) => void
}) => {
  return (
    <Items>
      {assetsForList.map((asset) => (
        <div key={asset.id}>
          <CheckboxInput
            value={asset.id === primaryAssetId}
            onClick={() => onSelect(asset.id)}
            label={`Use as primary asset (${getShortId(asset.id)})`}
          />
          <AssetResultsItem
            asset={asset}
            isSelected={asset.id === primaryAssetId}
            showMoreInfo={false}
            showState={false}
            controls={null}
          />
        </div>
      ))}
    </Items>
  )
}

const MergeAssetsForm = ({
  assetsForList,
  primaryAssetId,
  selectAssetId,
  finalFields,
  toggleFinalField,
  toggleExtraSource,
}: {
  assetsForList: AssetForList[]
  primaryAssetId: string | null
  selectAssetId: (id: string) => void
  finalFields: FinalFields
  toggleFinalField: (assetId: string, fieldName: string, val: any) => void
  toggleExtraSource: (
    assetId: string,
    fieldName: string,
    url: string,
    nowEnabled: boolean
  ) => void
}) => {
  const assetIds: string[] = assetsForList
    .map((a) => a.id)
    .filter(
      (id, i, arr) => id !== null && arr.findIndex((x) => x === id) === i
    ) as string[]

  return (
    <Items>
      {assetIds.map((assetId) => {
        const asset = assetsForList.find((a) => a.id === assetId)
        return (
          <Item key={assetId}>
            {asset ? (
              <>
                <AssetResultsItem
                  asset={asset}
                  isSelected={assetId === primaryAssetId}
                  showMoreInfo={false}
                  showState={false}
                  controls={null}
                />
                <Table size="small">
                  <TableBody>
                    {assetEditableFields
                      .filter((field) => {
                        const assetVal = asset[field.name]
                        return (
                          assetVal !== null &&
                          assetVal !== '' &&
                          (Array.isArray(assetVal) ? assetVal.length > 0 : true)
                        )
                      })
                      .map((field) => {
                        const fieldName = field.name
                        const assetVal = asset[fieldName]
                        const isSelected =
                          fieldName in finalFields &&
                          finalFields[fieldName].sourceAssetId === asset.id
                        const fieldValue =
                          fieldName in finalFields
                            ? finalFields[fieldName].value
                            : undefined
                        return (
                          <TableRow key={fieldName}>
                            <TableCell>
                              <strong>{field.label}</strong>
                            </TableCell>
                            <TableCell>
                              <FieldOutput
                                editableField={assetEditableFields.find(
                                  (field) => field.name === fieldName
                                )}>
                                {assetVal}
                              </FieldOutput>
                              {fieldName === 'sourceurl' && (
                                <CheckboxInput
                                  value={
                                    'extrasources' in finalFields
                                      ? (
                                          finalFields.extrasources
                                            .value as SourceInfo[]
                                        ).find(
                                          (source) => source.url === assetVal
                                        ) !== undefined
                                      : false
                                  }
                                  onChange={(newVal) =>
                                    toggleExtraSource(
                                      asset.id,
                                      fieldName as string,
                                      assetVal as string,
                                      newVal
                                    )
                                  }
                                  label="Use as extra source (with price and currency)"
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <CheckboxInput
                                value={isSelected}
                                isDisabled={assetId === primaryAssetId}
                                onChange={() =>
                                  toggleFinalField(
                                    asset.id,
                                    fieldName as string,
                                    assetVal
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
              <ErrorMessage>Failed to load asset</ErrorMessage>
            )}
            <ul></ul>
          </Item>
        )
      })}
    </Items>
  )
}

interface FieldToEdit {
  value: any
  sourceAssetId: string | string[]
}

type FinalFields = {
  [fieldName: string]: FieldToEdit
}

const RepairAssetsOperation = () => {
  const assetIds = useSelector<RootState, string[]>(
    (state) => state.app.bulkEditIds || []
  )
  const [isLoadingAssetsForList, lastErrorCodeAssetsForList, assetsForList] =
    useDataStoreItems<AssetForList>(ViewNames.GetAssetsForList, assetIds)
  const [isLoadingAssets, lastErrorCodeAssets, assets] =
    useDataStoreItems<Asset>(CollectionNames.Assets, assetIds)

  const [primaryAssetId, setPrimaryAssetId] = useState<null | string>(null)
  const [finalFields, setFinalFields] = useState<FinalFields>({})
  const client = useSupabaseClient()

  const [isSavingPrimaryAsset, setIsSavingPrimaryAsset] = useState(false)
  const [isSavingPrimaryAssetSuccess, setIsSavingPrimaryAssetSuccess] =
    useState(false)
  const [isSavingDeletedAssets, setIsSavingDeletedAssets] = useState(false)
  const [isSavingDeletedAssetsSuccess, setIsSavingDeletedAssetsSuccess] =
    useState(false)
  const [isFinallyDone, setIsFinallyDone] = useState(false)

  const assetIdsToDelete = primaryAssetId
    ? assetIds.filter((id) => id !== primaryAssetId)
    : []

  if (isLoadingAssetsForList || !assetsForList) {
    return <LoadingIndicator message="Loading asset list..." />
  }
  if (isLoadingAssets || !assets) {
    return <LoadingIndicator message="Loading assets..." />
  }

  if (lastErrorCodeAssetsForList !== null) {
    return (
      <ErrorMessage>
        Failed to load asset list (code {lastErrorCodeAssetsForList})
      </ErrorMessage>
    )
  }
  if (lastErrorCodeAssets !== null) {
    return (
      <ErrorMessage>
        Failed to load assets (code {lastErrorCodeAssets})
      </ErrorMessage>
    )
  }

  const primaryAsset: Asset | null =
    assets && primaryAssetId !== null
      ? assets.find((a) => a.id === primaryAssetId) || null
      : null

  const canPerform = primaryAssetId !== null

  const deletedEditorNotes = `Deleted in favour of https://www.vrcarena.com/assets/${primaryAssetId}`

  const onClickPerform = async () => {
    if (!canPerform) throw new Error('Need a primary ID')

    try {
      console.debug(`saving primary asset...`)

      const newPrimaryAssetFields: Partial<Asset> = {}

      for (const [fieldName, fieldInfo] of Object.entries(finalFields)) {
        newPrimaryAssetFields[fieldName] = fieldInfo.value
      }

      setIsFinallyDone(false)
      setIsSavingPrimaryAsset(true)
      setIsSavingPrimaryAssetSuccess(false)

      await updateRecord<Asset>(
        client,
        AssetsCollectionNames.Assets,
        primaryAssetId,
        newPrimaryAssetFields
      )

      setIsSavingPrimaryAsset(false)
      setIsSavingPrimaryAssetSuccess(true)

      setIsSavingDeletedAssets(true)
      setIsSavingDeletedAssetsSuccess(false)

      console.debug(`deleting assets...`, { assetIdsToDelete })

      await updateRecords<AssetMeta>(
        client,
        AssetsCollectionNames.AssetsMeta,
        assetIdsToDelete,
        {
          accessstatus: AccessStatus.Deleted,
          deletionreason: DeletionReason.inferior,
          editornotes: deletedEditorNotes,
        }
      )

      setIsSavingDeletedAssets(false)
      setIsSavingDeletedAssetsSuccess(true)

      setIsFinallyDone(true)
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const toggleFinalField = (assetId: string, fieldName: string, val: any) => {
    const isAlreadyThere =
      fieldName in finalFields &&
      finalFields[fieldName].sourceAssetId === assetId

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
          sourceAssetId: assetId,
        }
        if (
          fieldName === 'sourceurl' &&
          'extrasources' in newFields &&
          (newFields.extrasources.value as SourceInfo[]).find(
            (source) => source.url === val
          )
        ) {
          newFields.extrasources.value = (
            newFields.extrasources.value as SourceInfo[]
          ).filter((source) => source.url !== val)
        }
        return newFields
      })
    }
  }

  const toggleExtraSource = (
    assetId: string,
    fieldName: string,
    url: string,
    nowEnabled: boolean
  ) => {
    const newExtraSources =
      'extrasources' in finalFields
        ? [...(finalFields.extrasources.value as SourceInfo[])]
        : []

    const asset = assets.find((a) => a.id === assetId)
    if (!asset) throw new Error(`Could not find asset`)

    console.debug(`toggleExtraSources`, { url, before: [...newExtraSources] })

    const existingIndex = newExtraSources.findIndex(
      (source) => source.url === url
    )

    if (existingIndex !== -1) {
      newExtraSources.splice(existingIndex, 1)
    } else {
      newExtraSources.push({
        url,
        price: asset.price,
        pricecurrency: asset.pricecurrency,
        comments: '',
      })
    }

    console.debug(`toggleExtraSources.done`, { after: [...newExtraSources] })

    if (nowEnabled) {
      setFinalFields((fields) => {
        const newFields = { ...fields }
        newFields.extrasources = {
          value: newExtraSources,
          sourceAssetId: assetId,
        }
        if (
          newFields.sourceurl &&
          newFields.sourceurl.sourceAssetId === assetId
        ) {
          delete newFields.sourceurl
        }
        return newFields
      })
    } else {
      setFinalFields((fields) => {
        const newFields = { ...fields }
        if (newExtraSources.length > 0) {
          newFields.extrasources = {
            value: newExtraSources,
            sourceAssetId: assetId,
          }
        } else {
          delete newFields.extrasources
        }
        return newFields
      })
    }
  }

  return (
    <Tabs
      items={[
        {
          name: 'selection',
          label: 'Selection',
          contents: (
            <>
              <Heading variant="h3" noMargin>
                Selected Assets
              </Heading>
              <ul>
                {assetsForList.map((asset) => (
                  <li key={asset.id}>
                    {asset.title} ({getShortId(asset.id)})
                  </li>
                ))}
              </ul>
            </>
          ),
        },
        {
          name: 'primary',
          label: 'Primary Asset',
          contents: (
            <>
              <Heading variant="h3" noMargin>
                Select Primary Asset
              </Heading>
              <PrimaryAssetSelector
                assetsForList={assetsForList}
                primaryAssetId={primaryAssetId}
                onSelect={(id) => setPrimaryAssetId(id)}
              />
            </>
          ),
        },
        {
          name: 'merge',
          label: 'Merge Assets',
          contents: (
            <>
              <Heading variant="h3" noMargin>
                Merge Assets
              </Heading>
              <MergeAssetsForm
                assetsForList={assetsForList}
                primaryAssetId={primaryAssetId}
                selectAssetId={(id) => setPrimaryAssetId(id)}
                finalFields={finalFields}
                toggleFinalField={toggleFinalField}
                toggleExtraSource={toggleExtraSource}
              />
            </>
          ),
        },
        {
          name: 'result',
          label: 'Result',
          contents: (
            <>
              <Heading variant="h3" noMargin>
                Result
              </Heading>
              {canPerform ? (
                <>
                  <ol>
                    <li>
                      These assets will be deleted (updated with access status
                      to 'deleted') with reason 'inferior':
                      <br />
                      Their editor notes will be set to "{deletedEditorNotes}":
                      <ul>
                        {assetIdsToDelete.length ? (
                          assetIdsToDelete.map((assetId) => {
                            const asset = assetsForList.find(
                              (a) => a.id === assetId
                            )

                            if (!asset) {
                              return (
                                <ErrorMessage key={assetId}>
                                  Failed to find asset "{assetId}"
                                </ErrorMessage>
                              )
                            }

                            return (
                              <li key={assetId}>
                                {asset.title} ({getShortId(asset.id)})
                              </li>
                            )
                          })
                        ) : (
                          <li>(no assets will be deleted)</li>
                        )}
                      </ul>
                    </li>
                    <li>
                      This asset will be considered the primary asset:
                      <ul>
                        <li>
                          {primaryAsset
                            ? `"${primaryAsset.title}" (${getShortId(
                                primaryAsset.id
                              )})`
                            : '(no primary asset found)'}
                        </li>
                      </ul>
                    </li>
                    <li>
                      That asset will be edited with these fields:
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell></TableCell>
                            <TableCell>Old</TableCell>
                            <TableCell>New</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {primaryAsset ? (
                            Object.entries(finalFields).length ? (
                              Object.entries(finalFields).map(
                                ([fieldName, info]) => {
                                  const editableField =
                                    assetEditableFields.find(
                                      (field) => field.name === fieldName
                                    )!
                                  return (
                                    <TableRow key={fieldName}>
                                      <TableCell>
                                        <strong>{editableField.label}</strong>
                                      </TableCell>
                                      <TableCell>
                                        <FieldOutput
                                          editableField={editableField}>
                                          {primaryAsset[fieldName]}
                                        </FieldOutput>
                                      </TableCell>
                                      <TableCell>
                                        <FieldOutput>{info.value}</FieldOutput>
                                      </TableCell>
                                    </TableRow>
                                  )
                                }
                              )
                            ) : (
                              <TableRow>
                                <TableCell>
                                  (no fields will be changed)
                                </TableCell>
                              </TableRow>
                            )
                          ) : (
                            <TableRow>
                              <TableCell>(no primary asset selected)</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </li>
                  </ol>
                  <WarningMessage>
                    These actions cannot be (automatically) reversed.
                    <br />
                    <br />
                    No data will actually be deleted and all changes are
                    recorded for history.
                  </WarningMessage>
                </>
              ) : (
                <NoResultsMessage>
                  You must pick a primary asset first
                </NoResultsMessage>
              )}
              {isSavingPrimaryAsset && (
                <LoadingIndicator message="Saving primary asset..." />
              )}
              {isSavingDeletedAssets && (
                <LoadingIndicator message="Deleting other assets..." />
              )}
              {isSavingDeletedAssetsSuccess && (
                <SuccessMessage>
                  Assets have been (soft) deleted successfully
                </SuccessMessage>
              )}
              {isSavingPrimaryAssetSuccess && (
                <SuccessMessage>
                  Primary asset has been edited successfully
                </SuccessMessage>
              )}
              {isFinallyDone && (
                <SuccessMessage>
                  <strong>Everything is done!</strong>
                </SuccessMessage>
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
          ),
        },
      ]}
    />
  )
}

export default RepairAssetsOperation
