import { useState } from 'react'
import Table from '@/components/responsive-table'
import TableBody from '@mui/material/TableBody'
import { TableCell } from '@/components/responsive-table'
import { TableHead } from '@/components/responsive-table'
import { TableRow } from '@/components/responsive-table'

import useBulkEdit from '@/hooks/useBulkEdit'
import useDataStoreItems from '@/hooks/useDataStoreItems'

import AssetResultsItem from '@/components/asset-results-item'
import Button from '@/components/button'
import FormControls from '@/components/form-controls'
import SpeciesSelector from '@/components/species-selector'
import { Asset, AssetFields, CollectionNames } from '@/modules/assets'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import useSpecies from '@/hooks/useSpecies'
import CheckboxInput from '@/components/checkbox-input'
import {
  DataStoreErrorCode,
  getDataStoreErrorCodeFromError,
  updateRecord,
} from '@/data-store'
import SuccessMessage from '@/components/success-message'
import WarningMessage from '@/components/warning-message'
import useSupabaseClient from '@/hooks/useSupabaseClient'
import { handleError } from '@/error-handling'
import { getShortId } from '@/utils/formatting'
import Columns from '@/components/columns'
import Column from '@/components/column'
import StatusText from '@/components/status-text'

enum Step {
  SelectSpecies,
  RemoveSpecies,
  PreviewAndSaving,
}

const StepSelectSpecies = ({ onDone }: { onDone: (ids: string[]) => void }) => {
  const [selectedSpeciesIds, setSelectedSpeciesIds] = useState<string[]>([])
  return (
    <>
      <p>
        Select one or more species to add to each of the selected assets. Select
        nothing to skip this step.
      </p>
      <SpeciesSelector
        selectedSpeciesIds={selectedSpeciesIds}
        onSelectedSpeciesIds={(ids) => setSelectedSpeciesIds(ids)}
      />
      <FormControls>
        <Button onClick={() => onDone(selectedSpeciesIds)}>
          Continue With {selectedSpeciesIds.length} Species
        </Button>
      </FormControls>
    </>
  )
}

const SpeciesRemover = ({
  addedSpeciesIds,
  currentSpeciesIds,
  newSpeciesIds,
  onNewSpeciesIds,
}: {
  addedSpeciesIds: string[]
  currentSpeciesIds: string[]
  newSpeciesIds: string[]
  onNewSpeciesIds: (ids: string[]) => void
}) => {
  const [, , allSpecies] = useSpecies()
  if (!allSpecies) return <>No species!</>

  const updateSpecies = (speciesId: string, newVal: boolean) =>
    onNewSpeciesIds(
      newVal
        ? newSpeciesIds.concat([speciesId])
        : newSpeciesIds.filter((id) => id !== speciesId)
    )

  return (
    <>
      <ul>
        {currentSpeciesIds.map((id) => {
          const speciesItem = allSpecies.find((s) => s.id === id)
          if (!speciesItem) throw new Error(`No species: ${id}`)
          return (
            <li key={id}>
              <CheckboxInput
                value={newSpeciesIds.includes(id)}
                onChange={(isChecked) => updateSpecies(id, isChecked)}
                label={speciesItem.singularname}
              />
            </li>
          )
        })}
        {addedSpeciesIds.map((id) => {
          const speciesItem = allSpecies.find((s) => s.id === id)
          if (!speciesItem) throw new Error(`No species: ${id}`)
          return (
            <li key={id}>
              <CheckboxInput
                value={true}
                isDisabled
                label={`${speciesItem.singularname} (added)`}
              />
            </li>
          )
        })}
      </ul>
      {/* <FormControls>
        <Button onClick={() => onDone(newSpeciesIds)}>
          Mark Asset As Ready
        </Button>
      </FormControls> */}
    </>
  )
}

type SpeciesIdsByAssetId = { [assetId: string]: string[] }

const StepRemoveSpecies = ({
  assets,
  addedSpeciesIds,
  onDone,
  onBack,
}: {
  assets: Asset[]
  addedSpeciesIds: string[]
  onDone: (val: SpeciesIdsByAssetId) => void
  onBack: () => void
}) => {
  const { ids: assetIds } = useBulkEdit()
  const [newSpeciesIdsByAssetId, setNewSpeciesIdsByAssetId] =
    useState<SpeciesIdsByAssetId>(
      assetIds!.reduce((val, assetId) => {
        const asset = assets.find((a) => a.id === assetId)
        if (!asset) throw new Error(`No asset: ${assetId}`)
        return {
          ...val,
          [assetId]: asset.species.concat(
            addedSpeciesIds.filter((id) => !asset.species.includes(id))
          ),
        }
      }, {})
    )

  if (!assetIds) return <>Need IDs</>

  return (
    <>
      <Columns>
        {assetIds.map((assetId) => {
          const asset = assets.find((a) => a.id === assetId)
          if (!asset) throw new Error(`No asset: ${assetId}`)
          return (
            <Column widthPerc={25} key={assetId}>
              <AssetResultsItem
                asset={asset}
                controls={null} // hide
              />
              Keep These Species:
              <SpeciesRemover
                currentSpeciesIds={asset.species}
                addedSpeciesIds={addedSpeciesIds}
                newSpeciesIds={newSpeciesIdsByAssetId[assetId]}
                onNewSpeciesIds={(newSpeciesIds) => {
                  setNewSpeciesIdsByAssetId((currentVal) => ({
                    ...currentVal,
                    [assetId]: newSpeciesIds,
                  }))
                }}
              />
            </Column>
          )
        })}
      </Columns>
      <FormControls>
        <Button onClick={() => onDone(newSpeciesIdsByAssetId)}>
          Preview Assets
        </Button>{' '}
        <Button onClick={onBack} color="secondary">
          Back
        </Button>
      </FormControls>
    </>
  )
}

const StepPreview = ({
  assets,
  newSpeciesIdsByAssetId,
  onBack,
}: {
  assets: Asset[]
  newSpeciesIdsByAssetId: SpeciesIdsByAssetId
  onBack: () => void
}) => {
  const { leave } = useBulkEdit()
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false)
  const [assetSaveState, setAssetSaveState] =
    useState<SaveStateByAssetId | null>(null)
  const supabase = useSupabaseClient()
  const [, , allSpecies] = useSpecies()
  const [isDone, setIsDone] = useState(false)

  if (!allSpecies) return null

  const updateSaveState = (assetId: string, newState: Partial<SaveState>) =>
    setAssetSaveState((currentVal) =>
      currentVal !== null
        ? {
            ...currentVal,
            [assetId]:
              assetId in currentVal
                ? {
                    ...currentVal![assetId],
                    ...(newState as SaveState),
                  }
                : {
                    isSaving: false,
                    lastErrorCode: null,
                    isSuccess: false,
                    ...newState,
                  },
          }
        : {
            [assetId]: {
              isSaving: false,
              lastErrorCode: null,
              isSuccess: false,
              ...newState,
            },
          }
    )

  const onClickSave = async () => {
    try {
      if (!hasAttemptedSave) {
        setHasAttemptedSave(true)
        return
      }

      setIsDone(false)

      for (const assetId in newSpeciesIdsByAssetId) {
        const newSpeciesIds = newSpeciesIdsByAssetId[assetId]
        console.debug(`saving asset ${assetId}...`, newSpeciesIds)

        try {
          updateSaveState(assetId, {
            isSaving: true,
            lastErrorCode: null,
            isSuccess: false,
          })

          await updateRecord<AssetFields>(
            supabase,
            CollectionNames.Assets,
            assetId,
            {
              species: newSpeciesIds,
            }
          )

          console.debug(`asset ${assetId} saved!`)

          updateSaveState(assetId, {
            isSaving: false,
            lastErrorCode: null,
            isSuccess: true,
          })
        } catch (err) {
          console.error(err)
          updateSaveState(assetId, {
            isSaving: false,
            lastErrorCode: getDataStoreErrorCodeFromError(err),
            isSuccess: false,
          })
        }
      }

      setIsDone(true)
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (assetSaveState) {
    return (
      <>
        <Table size="small">
          <TableBody>
            {Object.entries(assetSaveState).map(
              ([assetId, { isSaving, lastErrorCode, isSuccess }]) => (
                <TableRow key={assetId}>
                  <TableCell>
                    <strong>#{getShortId(assetId)}</strong>
                  </TableCell>
                  <TableCell>
                    <StatusText
                      positivity={
                        lastErrorCode !== null
                          ? -1
                          : isSuccess
                          ? 1
                          : isSaving
                          ? 0
                          : undefined
                      }>
                      {lastErrorCode !== null
                        ? `Failed: ${lastErrorCode}`
                        : isSuccess
                        ? 'Saved!'
                        : isSaving
                        ? 'Saving...'
                        : '-'}
                    </StatusText>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
        {isDone && (
          <>
            <SuccessMessage>
              All assets have been saved. You can close this dialog.
            </SuccessMessage>
            <FormControls>
              <Button onClick={leave}>Close Dialog</Button>
            </FormControls>
          </>
        )}
      </>
    )
  }

  return (
    <>
      <p>These assets will be saved:</p>
      <Columns>
        {Object.entries(newSpeciesIdsByAssetId).map(
          ([assetId, newSpeciesIds]) => {
            const asset = assets.find((a) => a.id === assetId)
            if (!asset) throw new Error(`No asset: ${assetId}`)
            return (
              <Column widthPerc={25} key={assetId}>
                <AssetResultsItem
                  asset={asset}
                  controls={null} // hide
                />
                Species:
                <ul>
                  {newSpeciesIds.map((speciesId) => {
                    const speciesItem = allSpecies.find(
                      (s) => s.id === speciesId
                    )
                    if (!speciesItem)
                      throw new Error(`No species: ${speciesId}`)
                    return <li key={speciesId}>{speciesItem.singularname}</li>
                  })}
                </ul>
              </Column>
            )
          }
        )}
      </Columns>
      {hasAttemptedSave && (
        <WarningMessage>Are you sure you want to proceed?</WarningMessage>
      )}
      <FormControls>
        <Button onClick={onClickSave}>
          {hasAttemptedSave && 'Yes - '}Save These Assets
        </Button>{' '}
        <Button onClick={onBack} color="secondary">
          Back
        </Button>
      </FormControls>
    </>
  )
}

interface SaveState {
  isSaving: boolean
  lastErrorCode: DataStoreErrorCode | null
  isSuccess: boolean
}
type SaveStateByAssetId = { [assetId: string]: SaveState }

const ChangeSpeciesOperation = () => {
  const { ids: assetIds } = useBulkEdit()
  const [selectedStep, setSelectedStep] = useState(Step.SelectSpecies)
  const [speciesIdsToAdd, setSpeciesIdsToAdd] = useState<string[]>([])
  const [newSpeciesIdsByAssetId, setNewSpeciesIdsByAssetId] =
    useState<SpeciesIdsByAssetId>({})
  const [isLoading, lastErrorCode, assets] = useDataStoreItems<Asset>(
    CollectionNames.Assets,
    assetIds || false
  )

  if (!assetIds || !assetIds.length)
    return <ErrorMessage>No assets have been selected</ErrorMessage>

  if (isLoading) return <LoadingIndicator message="Loading assets..." />
  if (lastErrorCode !== null)
    return (
      <ErrorMessage>Failed to load assets (code{lastErrorCode})</ErrorMessage>
    )
  if (!assets) return null

  switch (selectedStep) {
    case Step.SelectSpecies:
      return (
        <StepSelectSpecies
          onDone={(ids) => {
            setSpeciesIdsToAdd(ids)
            setSelectedStep(Step.RemoveSpecies)
          }}
        />
      )
    case Step.RemoveSpecies:
      return (
        <StepRemoveSpecies
          assets={assets}
          addedSpeciesIds={speciesIdsToAdd}
          onDone={(val) => {
            setNewSpeciesIdsByAssetId(val)
            setSelectedStep(Step.PreviewAndSaving)
          }}
          onBack={() => setSelectedStep(Step.SelectSpecies)}
        />
      )
    case Step.PreviewAndSaving:
      return (
        <StepPreview
          assets={assets}
          newSpeciesIdsByAssetId={newSpeciesIdsByAssetId}
          onBack={() => setSelectedStep(Step.RemoveSpecies)}
        />
      )
    default:
      return null
  }
}

export default ChangeSpeciesOperation
