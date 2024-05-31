import React, { useState } from 'react'
import Markdown from '../markdown'
import { makeStyles } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'

import { PlaylistItemsFieldNames } from '../../data-store'

import Button from '../button'
import TextInput from '../text-input'
import Paper from '../paper'
import FormControls from '../form-controls'
import SearchForAssetForm from '../search-for-asset-form'
import AssetResultsItem from '../asset-results-item'
import { moveItemInArray } from '../../utils'

const useStyles = makeStyles({
  item: {
    marginBottom: '1rem',
    '&:last-child': {
      margin: 0,
    },
  },
  controls: {
    marginTop: '0.5rem',
    textAlign: 'right',
  },
  label: {
    fontWeight: 'bold',
    marginTop: '0.5rem',
  },
})

function Label({ children }) {
  const classes = useStyles()
  return <div className={classes.label}>{children}</div>
}

function ItemEditor({
  isFirst,
  isLast,
  item,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}) {
  const classes = useStyles()
  const [foundAssetData, setFoundAssetData] = useState(null)

  const updateItemField = (field, value) =>
    onChange({ ...item, [field]: value })

  return (
    <Paper className={classes.item}>
      <div>
        {item[PlaylistItemsFieldNames.asset] ? (
          <AssetResultsItem asset={foundAssetData || item.assetData} />
        ) : (
          '(no asset picked yet)'
        )}
        <Markdown source={item[PlaylistItemsFieldNames.comments]} />
      </div>
      <div>
        <Label>Asset</Label>
        {item[PlaylistItemsFieldNames.asset] ? (
          <Button
            onClick={() => {
              updateItemField(PlaylistItemsFieldNames.asset, null)
              setFoundAssetData(null)
            }}
            color="default">
            Change Asset
          </Button>
        ) : (
          <SearchForAssetForm
            onSelectIdWithDetails={(id, details) => {
              updateItemField(PlaylistItemsFieldNames.asset, id)
              setFoundAssetData(details)
            }}
          />
        )}
        <Label>Comments</Label>
        <TextInput
          value={item[PlaylistItemsFieldNames.comments]}
          onChange={(e) =>
            updateItemField(PlaylistItemsFieldNames.comments, e.target.value)
          }
          rows={10}
          multiline
          style={{ width: '100%' }}
        />

        <div className={classes.controls}>
          {isFirst ? null : (
            <Button
              onClick={() => onMoveUp()}
              color="default"
              icon={<ArrowUpwardIcon />}>
              Move Up
            </Button>
          )}{' '}
          {isLast ? null : (
            <Button
              onClick={() => onMoveDown()}
              color="default"
              icon={<ArrowDownwardIcon />}>
              Move Down
            </Button>
          )}{' '}
          <Button
            onClick={() => onDelete()}
            color="default"
            icon={<DeleteIcon />}>
            Delete Item
          </Button>
        </div>
      </div>
    </Paper>
  )
}

export default ({ items: newItems = [], onChange, itemsAssetData = [] }) => {
  const classes = useStyles()

  const addItem = () => {
    onChange(
      newItems.concat([
        {
          [PlaylistItemsFieldNames.comments]: '',
          [PlaylistItemsFieldNames.asset]: null,
        },
      ])
    )
  }

  const moveItemUp = (itemIdx) => {
    onChange(moveItemInArray(itemIdx, itemIdx - 1, newItems))
  }

  const moveItemDown = (itemIdx) => {
    onChange(moveItemInArray(itemIdx, itemIdx + 1, newItems))
  }

  const deleteItem = (itemIdx) => {
    const itemsToSave = [...newItems]
    itemsToSave.splice(itemIdx, 1)
    onChange(itemsToSave)
  }

  const saveItem = (itemIdx, newItemFields) => {
    const item = newItems[itemIdx]
    const newItem = {
      ...item,
      ...newItemFields,
    }

    const newItemsToSave = [...newItems]
    newItemsToSave[itemIdx] = newItem

    onChange(newItemsToSave)
  }

  return (
    <div className={classes.root}>
      <div>
        {newItems.length
          ? newItems.map((item, idx) => (
              <ItemEditor
                key={idx}
                item={{
                  ...item,
                  assetData:
                    itemsAssetData.find(
                      (itemAssetData) => itemAssetData.id === item.asset
                    ) || null,
                }}
                onChange={(newItemFields) => saveItem(idx, newItemFields)}
                onMoveUp={() => moveItemUp(idx)}
                onMoveDown={() => moveItemDown(idx)}
                onDelete={() => deleteItem(idx)}
                isFirst={idx === 0}
                isLast={idx === newItems.length - 1}
              />
            ))
          : 'No asset have been added yet - add some!'}
      </div>
      <FormControls>
        <Button onClick={() => addItem()} color="default" icon={<AddIcon />}>
          Add Asset
        </Button>
      </FormControls>
    </div>
  )
}
