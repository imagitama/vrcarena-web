import React, { useState } from 'react'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { makeStyles } from '@mui/styles'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import FlipMove from 'react-flip-move'

import { moveItemToLeft, moveItemToRight } from '../../utils'
import { VRCArenaTheme } from '../../themes'
import Button from '../button'

export type Item<T> = {} & T

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  items: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minWidth: '200px',
    minHeight: '400px',
    margin: '0 0.25rem',
    '& > *': {
      width: '100%',
    },
  },
  emptyItem: {
    borderRadius: theme.shape.borderRadius,
    border: '0.1rem dashed rgba(255, 255, 255, 0.5)',
  },
  sideControl: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  sideControlBtn: {
    width: '3rem',
    height: '3rem',
    padding: '0.5rem',
    cursor: 'pointer',
    borderRadius: '100%',
    background: theme.palette.background.paper,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover:not($disabledControl)': {
      background: theme.palette.action.hover,
    },
  },
  centerControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& > *': {
      padding: '0.5rem',
      cursor: 'pointer',
    },
  },
  controls: {},
  addButton: {
    width: '100%',
    height: '400px',
  },
  noItemsMessage: {
    width: '100%',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  noItemsMessageWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  activeForEditing: {
    width: '100%',
    padding: '0.5rem',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  disabledControl: {
    opacity: '0.5',
    cursor: 'not-allowed',
  },
}))

// generic editor for "items" that can be individually edited, re-arranged, added and deleted

const ItemsEditor = <TItem, TCommonProps extends object = {}>({
  items,
  onChange,
  editor,
  renderer,
  emptyItem,
  nameSingular = 'item',
  allowDelete = true,
  allowEditing = true,
  allowAdding = true,
  onAdd = undefined,
  commonProps = undefined,
  itemClassName = '',
  getKey = undefined,
}: {
  items: Item<TItem>[]
  onChange: (newItems: Item<TItem>[]) => void
  editor?: React.ComponentType<
    {
      item: Item<TItem>
      index: number
      onChange: (newFields: Item<TItem>) => void
      onDone: (newFields: Item<TItem>) => void
    } & TCommonProps
  >
  renderer: React.ComponentType<
    {
      item: Item<TItem>
      index: number
    } & TCommonProps
  >
  nameSingular?: string
  emptyItem?: TItem
  allowDelete?: boolean
  allowEditing?: boolean
  allowAdding?: boolean
  onAdd?: () => void
  commonProps?: TCommonProps // spread onto editor and renderer as props
  itemClassName?: string
  getKey?: (item: TItem) => string
}) => {
  const classes = useStyles()
  const [activeIndexToEdit, setActiveIndexToEdit] = useState<number | null>(
    null
  )

  const onAddClick = () => {
    console.debug('Adding item...')

    if (onAdd) {
      onAdd()
    } else if (emptyItem !== undefined) {
      onChange(items.concat([emptyItem!!]))
      setActiveIndexToEdit(items.length)
    } else {
      throw new Error('Cannot add without an onAdd handler OR an empty item')
    }
  }

  const onIdxChange = (indexToChange: number, newItem: Item<TItem>) => {
    console.debug(`Changing item ${indexToChange}...`, {
      old: items[indexToChange],
      new: newItem,
    })
    const newItems = [...items]
    newItems[indexToChange] = newItem
    onChange(newItems)
  }

  const onIdxEdited = (indexToChange: number, newItem: Item<TItem>) => {
    console.debug(`Editing item ${indexToChange}...`, {
      old: items[indexToChange],
      new: newItem,
    })
    const newItems = [...items]
    newItems[indexToChange] = newItem
    onChange(newItems)
    setActiveIndexToEdit(null)
  }

  const onMoveIdxLeftClick = (indexToMove: number) => {
    console.debug(`Moving item ${indexToMove} left...`)
    const newItems = moveItemToLeft<Item<TItem>>(items, indexToMove)
    onChange(newItems)
  }

  const onMoveIdxRightClick = (indexToMove: number) => {
    console.debug(`Moving item ${indexToMove} right...`)
    const newItems = moveItemToRight<Item<TItem>>(items, indexToMove)
    onChange(newItems)
  }

  const onDeleteIdxClick = (indexToDelete: number) => {
    console.debug(`Deleting item ${indexToDelete}...`)
    onChange(items.filter((itemToCheck, idx) => idx !== indexToDelete))
  }

  const onEditIdxClick = (indexToEdit: number) => {
    console.debug(`Entering edit mode for ${indexToEdit}...`)
    setActiveIndexToEdit(indexToEdit)
  }

  return (
    <div className={classes.root}>
      <FlipMove className={classes.items}>
        {items.length
          ? items.map((item: Item<TItem>, idx) => {
              const key = getKey
                ? getKey(item)
                : typeof item === 'string'
                ? item
                : item === null
                ? 'null'
                : // @ts-ignore
                item.id
                ? // @ts-ignore
                  item.id
                : idx
              return (
                <div
                  key={key}
                  className={`${classes.item} ${
                    idx === activeIndexToEdit ? classes.activeForEditing : ''
                  } ${itemClassName}`}>
                  {idx === activeIndexToEdit && editor ? (
                    <div>
                      {/* @ts-ignore */}
                      {React.createElement(editor, {
                        item,
                        index: idx,
                        onChange: (newFields: Item<TItem>) =>
                          onIdxChange(idx, newFields),
                        onDone: (newFields: Item<TItem>) =>
                          onIdxEdited(idx, newFields),
                        ...(commonProps || {}),
                      })}
                    </div>
                  ) : (
                    <>
                      {' '}
                      <div className={classes.sideControl}>
                        <div
                          className={`${classes.sideControlBtn}  ${
                            idx === 0 ? classes.disabledControl : ''
                          }`}
                          onClick={() => onMoveIdxLeftClick(idx)}>
                          <ChevronLeftIcon />
                        </div>
                      </div>
                      <div>
                        <div>
                          {/* @ts-ignore */}
                          {React.createElement(renderer, {
                            item,
                            index: idx,
                            ...(commonProps || {}),
                          })}
                        </div>
                        <div className={`${classes.centerControls}`}>
                          {allowDelete ? (
                            <div onClick={() => onDeleteIdxClick(idx)}>
                              <DeleteIcon />
                            </div>
                          ) : null}
                          {allowEditing && editor ? (
                            <div onClick={() => onEditIdxClick(idx)}>
                              <EditIcon />
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className={classes.sideControl}>
                        <div
                          className={`${classes.sideControlBtn}  ${
                            idx === items.length - 1
                              ? classes.disabledControl
                              : ''
                          }`}
                          onClick={() => onMoveIdxRightClick(idx)}>
                          <ChevronRightIcon />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )
            })
          : null}
        {allowAdding ? (
          <div className={`${classes.item} ${classes.emptyItem}`}>
            <div className={classes.noItemsMessageWrapper}>
              <div className={classes.noItemsMessage}>
                No {nameSingular}s defined yet
              </div>
              <Button color="secondary" onClick={onAddClick} icon={<AddIcon />}>
                Add {nameSingular}
              </Button>
            </div>
          </div>
        ) : null}
      </FlipMove>
      {/* {allowAdding ? (
        <div className={classes.item}>
          <div className={classes.addButton}>
            <CardButton
              label={
                <>
                  <AddIcon /> Add {nameSingular}
                </>
              }
              onClick={onAddClick}
            />
          </div>
        </div>
      ) : null} */}
    </div>
  )
}

export default ItemsEditor
