import React, { Fragment, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { makeStyles } from '@material-ui/styles'

import useIsEditor from '../../hooks/useIsEditor'
import { RootState } from '../../store'
import {
  enterBulkEditMode as enterBulkEditModeAction,
  leaveBulkEditMode as leaveBulkEditModeAction
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
import { FullAsset } from '../../modules/assets'
import { handleError } from '../../error-handling'
import Paper from '../paper'
import SuccessMessage from '../success-message'
import LoadingIndicator from '../loading-indicator'

enum BulkAction {
  RemoveTag,
  AddTag,
  ChangeSpecies
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
  Form: () => React.ReactElement | null
  Preview: ({ asset }: { asset: FullAsset }) => React.ReactElement | null
  Action: (assetId: string, asset: FullAsset, data: any) => Promise<void>
}

const Handlers: { [key in BulkAction]: Handler } = {
  [BulkAction.RemoveTag]: RemoveTag,
  [BulkAction.AddTag]: AddTag,
  [BulkAction.ChangeSpecies]: ChangeSpecies
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
    display: 'inline-block'
  }
})

const Preview = ({
  selectedBulkAction
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
          <TableCell>Change</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {ids.map(id => {
          const asset = assets.find(asset => asset.id === id)
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

const Render = () => {
  const bulkEditIds = useSelector<RootState>(state => state.app.bulkEditIds)
  const dispatch = useDispatch()
  const [
    selectedBulkAction,
    setSelectedBulkAction
  ] = useState<null | BulkAction>(null)
  const [assetData, setAssetData] = useState<FullAsset[]>([])
  const [userInput, setUserInput] = useState<string | string[]>('')
  const { ids, setSelectingAll } = useGlobalBulkEdit()
  const [assetIdsWaitingToEdit, setAssetIdsWaitingToEdit] = useState<
    null | string[]
  >(null)
  const enterBulkEditMode = () => dispatch(enterBulkEditModeAction())
  const leaveBulkEditMode = () => dispatch(leaveBulkEditModeAction())

  const reset = () => {
    setSelectedBulkAction(null)
    setAssetData([])
    setUserInput('')
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
          id => assetData.find(asset => asset.id === id) === undefined
        )

        console.debug(`Fetching data for ${idsToGet.length} assets...`)

        const newAssetData = await Promise.all(
          idsToGet.map(id => readRecord<FullAsset>('getfullassets', id))
        )

        console.debug(`Found data for them`, newAssetData)

        setAssetData(currentAssets => currentAssets.concat(newAssetData))
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
    // TODO: Better do this
    if (actionToInitiate === BulkAction.ChangeSpecies) {
      setUserInput([])
    }
    setSelectedBulkAction(actionToInitiate)
  }

  const applyBulkEdit = async () => {
    if (selectedBulkAction === null) {
      throw new Error('Cannot apply bulk edit without an action')
    }
    if (!ids) {
      throw new Error('IDs should not be null')
    }

    const action = Handlers[selectedBulkAction].Action

    setAssetIdsWaitingToEdit(assetData.map(asset => asset.id))

    for (const id of ids) {
      console.debug(`Performing action on asset ${id}...`)

      const asset = assetData.find(asset => asset.id === id)

      if (!asset) {
        throw new Error(`Could not find asset "${id}" in data`)
      }

      await action(id, asset, userInput)

      setAssetIdsWaitingToEdit(currentIds => {
        if (!currentIds) {
          throw new Error('Race condition')
        }
        return currentIds.filter(id => id !== asset.id)
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
      </Button>
      {' | '}
      {selectedBulkAction === null ? (
        (Object.values(BulkAction) as Array<keyof typeof BulkAction>)
          .filter(i => typeof i === 'string')
          .map(bulkAction => (
            <Fragment key={bulkAction}>
              <Button
                onClick={() => initiateBulkAction(BulkAction[bulkAction])}>
                {bulkAction}
              </Button>{' '}
            </Fragment>
          ))
      ) : (
        <context.Provider
          value={{ ids, assets: assetData, userInput, setUserInput }}>
          <Paper>
            {React.createElement(Handlers[selectedBulkAction].Form, {})}
            <Preview selectedBulkAction={selectedBulkAction} />
            <br />
            <Button onClick={() => applyBulkEdit()}>
              Apply Bulk Edit (DESTRUCTIVE)
            </Button>{' '}
            Warning: Recommended to only operate on 10 assets at a time to avoid
            throttling our backend
          </Paper>
        </context.Provider>
      )}
      {' | '}
      <Button onClick={() => onSelectAllClick()}>Select All</Button>
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
