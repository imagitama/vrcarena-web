import React, { useState } from 'react'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import { makeStyles } from '@material-ui/core/styles'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import CardButton from '../card-button'
import { moveItemToLeft, moveItemToRight } from '../../utils'
import { defaultBorderRadius } from '../../themes'
import Button from '../button'

export type Item<T> = {
  id: string
} & T

const useStyles = makeStyles({
  items: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center'
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
      width: '100%'
    }
  },
  emptyItem: {
    borderRadius: defaultBorderRadius,
    border: '0.1rem dashed rgba(255, 255, 255, 0.5)'
  },
  sideControl: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 0.5rem',
    cursor: 'pointer'
  },
  centerControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& > *': {
      padding: '0.5rem',
      cursor: 'pointer'
    }
  },
  controls: {},
  addButton: {
    width: '100%',
    height: '400px'
  },
  noItemsMessage: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: '0.5rem'
  },
  activeForEditing: {
    width: '100%',
    padding: '0.5rem',
    backgroundColor: 'rgba(0,0,0,0.1)'
  },
  disabledControl: {
    opacity: '0.5',
    cursor: 'not-allowed'
  }
})

// generic editor for "items" that can be individually edited, re-arranged, added and deleted

export default ({
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
  commonProps = {}
}: {
  // ensure all items have an "id" property (used for key prop but maybe for modifying array later)
  items: Item<any>[]
  onChange: (newItems: Item<any>[]) => void
  editor: React.ReactElement<{
    item: Item<any>
    index: number
    onChange?: (newFields: Item<any>) => void
    onDone?: (newFields: Item<any>) => void
  }>
  renderer: React.ReactElement<{
    item: Item<any>
  }>
  nameSingular?: string
  emptyItem?: Item<any>
  allowDelete?: boolean
  allowEditing?: boolean
  allowAdding?: boolean
  onAdd?: () => void
  commonProps?: any
}) => {
  const classes = useStyles()
  const [activeIndexToEdit, setActiveIndexToEdit] = useState<number | null>(
    null
  )

  const onAddClick = () => {
    console.debug('Adding item...')

    if (onAdd) {
      onAdd()
    } else if (emptyItem) {
      onChange(items.concat([emptyItem]))
    } else {
      console.warn('Cannot add without an onAdd handler OR an empty item')
    }
  }

  const onIdxChange = (indexToChange: number, newItem: Item<any>) => {
    console.debug(`Changing item ${indexToChange}...`, {
      old: items[indexToChange],
      new: newItem
    })
    const newItems = [...items]
    newItems[indexToChange] = newItem
    onChange(newItems)
  }
  const onIdxEdited = (indexToChange: number, newItem: Item<any>) => {
    console.debug(`Editing item ${indexToChange}...`, {
      old: items[indexToChange],
      new: newItem
    })
    const newItems = [...items]
    newItems[indexToChange] = newItem
    onChange(newItems)
    setActiveIndexToEdit(null)
  }
  const onMoveIdxLeftClick = (indexToMove: number) => {
    console.debug(`Moving item ${indexToMove} left...`)

    const newArray = moveItemToLeft<Item<any>>(items, indexToMove)

    onChange(newArray)
  }
  const onMoveIdxRightClick = (indexToMove: number) => {
    console.debug(`Moving item ${indexToMove} right...`)

    const newArray = moveItemToRight<Item<any>>(items, indexToMove)

    onChange(newArray)
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
    <div className={classes.items}>
      {items.length ? (
        items.map((item: Item<any>, idx) => (
          <div
            key={item.id}
            className={`${classes.item} ${
              idx === activeIndexToEdit ? classes.activeForEditing : ''
            }`}>
            {idx === activeIndexToEdit ? (
              <div>
                {React.cloneElement(editor, {
                  item,
                  index: idx,
                  onChange: (newFields: Item<any>) =>
                    onIdxChange(idx, newFields),
                  onDone: (newFields: Item<any>) => onIdxEdited(idx, newFields),
                  ...commonProps
                })}
              </div>
            ) : (
              <>
                {' '}
                <div
                  className={`${classes.sideControl} ${
                    idx === 0 ? classes.disabledControl : ''
                  }`}
                  onClick={() => onMoveIdxLeftClick(idx)}>
                  <ChevronLeftIcon />
                </div>
                <div>
                  <div>
                    {React.cloneElement(renderer, {
                      item,
                      index: idx,
                      ...commonProps
                    })}
                  </div>
                  <div className={`${classes.centerControls}`}>
                    {allowDelete ? (
                      <div onClick={() => onDeleteIdxClick(idx)}>
                        <DeleteIcon />
                      </div>
                    ) : null}
                    {allowEditing ? (
                      <div onClick={() => onEditIdxClick(idx)}>
                        <EditIcon />
                      </div>
                    ) : null}
                  </div>
                </div>
                <div
                  className={`${classes.sideControl} ${
                    idx === items.length - 1 ? classes.disabledControl : ''
                  }`}
                  onClick={() => onMoveIdxRightClick(idx)}>
                  <ChevronRightIcon />
                </div>
              </>
            )}
          </div>
        ))
      ) : (
        <div className={`${classes.item} ${classes.emptyItem}`}>
          <div>
            <div className={classes.noItemsMessage}>
              No {nameSingular}s defined yet
            </div>
            <Button color="default" onClick={onAddClick}>
              Add {nameSingular}
            </Button>
          </div>
        </div>
      )}
      {allowAdding ? (
        <div className={classes.item}>
          <div className={classes.addButton}>
            <CardButton label={`Add ${nameSingular}`} onClick={onAddClick} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
