import React, { Fragment, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { makeStyles } from '@material-ui/styles'

import useIsEditor from '../../hooks/useIsEditor'
import {
  enterBulkEditMode as enterBulkEditModeAction,
  leaveBulkEditMode as leaveBulkEditModeAction,
} from '../../modules/app'
import Button from '../button'
import * as RemoveTag from './actions/RemoveTag'
import * as AddTag from './actions/AddTag'
import * as ChangeSpecies from './actions/ChangeSpecies'
// import * as Delete from './action/Delete'
// import * as Undelete from './action/Undelete'
// import * as Approve from './action/Approve'
// import * as Unapprove from './action/Unapprove'
// import * as Publish from './action/Publish'
// import * as Unpublish from './action/Unpublish'
// import * as ReplaceInText from './action/ReplaceInText'
// import * as ChangeCategory from './action/ChangeCategory'
// import * as ChangeAuthor from './action/ChangeAuthor'
// import * as ToggleIsAdult from './action/ToggleIsAdult'
import { context, useBulkEdit } from './context'
import useGlobalBulkEdit from '../../hooks/useBulkEdit'
import { readRecord } from '../../data-store'
import { Asset, CollectionNames } from '../../modules/assets'
import { handleError } from '../../error-handling'
import Paper from '../paper'
import SuccessMessage from '../success-message'
import LoadingIndicator from '../loading-indicator'
import { RootState } from '../../modules'
import useSupabaseClient from '../../hooks/useSupabaseClient'
import { SupabaseClient } from '@supabase/supabase-js'

export enum BulkAction {
  RemoveTag,
  AddTag,
  ChangeSpecies,
  // Delete,
  // Undelete,
  // Approve,
  // Unapprove,
  // Publish,
  // Unpublish,
  // ReplaceInText,
  // ChangeCategory,
  // ChangeAuthor,
  // ToggleIsAdult
}

interface Handler {
  Form?: () => React.ReactElement | null
  FormPerAsset?: ({ asset }: { asset: Asset }) => React.ReactElement | null
  Preview: ({ asset }: { asset: Asset }) => React.ReactElement | null
  Action: (
    client: SupabaseClient,
    assetId: string,
    asset: Asset,
    data: any
  ) => Promise<void>
}

const Handlers: { [key in BulkAction]: Handler } = {
  [BulkAction.RemoveTag]: RemoveTag,
  [BulkAction.AddTag]: AddTag,
  [BulkAction.ChangeSpecies]: ChangeSpecies,
  // [BulkAction.Delete]: Delete,
  // [BulkAction.Undelete]: Undelete,
  // [BulkAction.Approve]: Approve,
  // [BulkAction.Unapprove]: Unapprove,
  // [BulkAction.Publish]: Publish,
  // [BulkAction.Unpublish]: Unpublish,
  // [BulkAction.ReplaceInText]: ReplaceInText,
  // [BulkAction.ChangeCategory]: ChangeCategory,
  // [BulkAction.ChangeAuthor]: ChangeAuthor,
  // [BulkAction.ToggleIsAdult]: ToggleIsAdult
}

const useStyles = makeStyles({
  root: {
    display: 'inline-block',
  },
})

const Preview = ({
  selectedBulkAction,
}: {
  selectedBulkAction: BulkAction
}) => {
  const { ids, assets } = useBulkEdit()

  if (!ids) {
    return null
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Asset</TableCell>
          <TableCell>Preview</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {ids.map((id) => {
          const asset = assets.find((asset) => asset.id === id)
          return (
            <TableRow key={id}>
              <TableCell>
                {asset ? asset.id : '(loading)'}
                <br />
                {asset ? asset.title : '(loading)'}
              </TableCell>
              <TableCell>
                {asset
                  ? React.createElement(
                      // @ts-ignore
                      Handlers[selectedBulkAction.toString()].Preview,
                      { asset }
                    )
                  : null}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

const FormsForEachAsset = () => {
  const { ids, assets, selectedBulkAction } = useBulkEdit()

  if (!ids) {
    return null
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Asset</TableCell>
          <TableCell>Form</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {ids.map((id) => {
          const asset = assets.find((asset) => asset.id === id)
          return (
            <TableRow key={id}>
              <TableCell>
                {asset ? asset.id : '(loading)'}
                <br />
                {asset ? asset.title : '(loading)'}
              </TableCell>
              <TableCell>
                {asset
                  ? React.createElement(
                      // @ts-ignore
                      Handlers[selectedBulkAction.toString()].FormPerAsset,
                      { asset }
                    )
                  : null}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

const Render = () => {
  const bulkEditIds = useSelector(
    ({ app: { bulkEditIds } }: RootState) => bulkEditIds
  )
  const dispatch = useDispatch()
  const [selectedBulkAction, setSelectedBulkAction] =
    useState<null | BulkAction>(null)
  const [assetData, setAssetData] = useState<Asset[]>([])
  const [newData, setNewData] = useState<
    { [assetId: string]: Partial<Asset> } & { all: Partial<Asset> }
  >({
    all: {},
  })
  const { ids, setSelectingAll, assetDatas } = useGlobalBulkEdit()
  const [assetIdsWaitingToEdit, setAssetIdsWaitingToEdit] = useState<
    null | string[]
  >(null)
  const enterBulkEditMode = () => dispatch(enterBulkEditModeAction())
  const leaveBulkEditMode = () => dispatch(leaveBulkEditModeAction())
  const supabase = useSupabaseClient()

  const reset = () => {
    setSelectedBulkAction(null)
    setAssetData([])
    setNewData({
      all: {},
    })
    setAssetIdsWaitingToEdit(null)
    leaveBulkEditMode()
  }

  const onSelectAllClick = () => setSelectingAll(true)

  useEffect(() => {
    if (!ids) {
      return
    }

    ;(async () => {
      try {
        const idsToGet = ids.filter(
          (id) => assetData.find((asset) => asset.id === id) === undefined
        )

        console.debug(`Fetching data for ${idsToGet.length} assets...`)

        const newAssetData = await Promise.all(
          idsToGet.map((id) => {
            const existingData = assetDatas.find((asset) => asset.id === id)

            if (existingData) {
              return existingData
            }

            return readRecord<Asset>(supabase, CollectionNames.Assets, id)
          })
        )

        console.debug(`Found data for them`, newAssetData)

        setAssetData((currentAssets) => currentAssets.concat(newAssetData))
        setNewData((currentData) => {
          const evenNewerData = { ...currentData }
          for (const asset of newAssetData) {
            if (!evenNewerData[asset.id]) {
              evenNewerData[asset.id] = asset
            }
          }
          return evenNewerData
        })
      } catch (err) {
        console.error(err)
        handleError(err)
      }
    })()
  }, [ids !== null ? ids.join('+') : null])

  const isInBulkEditMode = bulkEditIds !== null

  if (!isInBulkEditMode) {
    return (
      <Button
        onClick={() => {
          enterBulkEditMode()
        }}>
        Enable Bulk Edit Mode
      </Button>
    )
  }

  const initiateBulkAction = (actionToInitiate: BulkAction) => {
    setSelectedBulkAction(actionToInitiate)
  }

  const applyBulkEdit = async () => {
    if (selectedBulkAction === null) {
      throw new Error('Cannot apply bulk edit without an action')
    }
    if (!ids) {
      throw new Error('IDs should not be null')
    }

    const actionFn = Handlers[selectedBulkAction].Action

    setAssetIdsWaitingToEdit(assetData.map((asset) => asset.id))

    for (const id of ids) {
      console.debug(
        `Performing action "${selectedBulkAction}" on asset ${id}...`
      )

      const asset = assetData.find((asset) => asset.id === id)

      if (!asset) {
        throw new Error(`Could not find asset "${id}" in data`)
      }

      await actionFn(supabase, id, asset, newData)

      setAssetIdsWaitingToEdit((currentIds) => {
        if (!currentIds) {
          throw new Error('Race condition')
        }
        return currentIds.filter((id) => id !== asset.id)
      })
    }

    console.debug('All done')
  }

  if (assetIdsWaitingToEdit) {
    if (assetIdsWaitingToEdit.length) {
      return (
        <LoadingIndicator
          message={`Processing ${
            assetIdsWaitingToEdit.length
          } assets... (${assetIdsWaitingToEdit.join(',')})`}
        />
      )
    } else {
      return (
        <SuccessMessage>
          All assets have been bulk edited successfully
          <Button onClick={() => reset()}>Okay</Button>
        </SuccessMessage>
      )
    }
  }

  return (
    <>
      <Button color="default" onClick={() => reset()}>
        Cancel Bulk Edit
      </Button>{' '}
      {selectedBulkAction === null ? (
        (Object.values(BulkAction) as Array<keyof typeof BulkAction>)
          .filter((i) => typeof i === 'string')
          .map((bulkAction) => (
            <Fragment key={bulkAction}>
              <Button
                onClick={() => initiateBulkAction(BulkAction[bulkAction])}>
                {bulkAction}
              </Button>{' '}
            </Fragment>
          ))
      ) : (
        <context.Provider
          value={{
            ids,
            assets: assetData,
            newData,
            setNewData,
            selectedBulkAction,
          }}>
          <Paper>
            {Handlers[selectedBulkAction].Form ? (
              React.createElement(
                Handlers[selectedBulkAction].Form || 'div',
                {}
              )
            ) : Handlers[selectedBulkAction].FormPerAsset ? (
              <FormsForEachAsset />
            ) : (
              <>No form to render</>
            )}
            <Preview selectedBulkAction={selectedBulkAction} />
            <br />
            <Button onClick={() => applyBulkEdit()}>
              Apply Bulk Edit (DESTRUCTIVE)
            </Button>{' '}
            Warning: Recommended to only operate on 10 assets at a time to avoid
            throttling our backend
            <br />
            Warning: Refresh page after operation or it will show old data
          </Paper>
        </context.Provider>
      )}
    </>
  )
}

const BulkEditButton = () => {
  const classes = useStyles()

  if (!useIsEditor()) {
    return null
  }

  return (
    <div className={classes.root}>
      <Render />
    </div>
  )
}

export default BulkEditButton
