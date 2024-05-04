import React, { useState } from 'react'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'

import Button from '../button'
import FormControls from '../form-controls'

import {
  CollectionNames,
  AssetFieldNames,
  AssetCategories,
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserId from '../../hooks/useUserId'

import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import categoryMeta from '../../category-meta'

const useStyles = makeStyles({
  buttons: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  button: {
    width: '50%',
    padding: '0.5rem',
    position: 'relative',
  },
  contentsWrapper: {
    display: 'flex',
  },
  media: {
    width: '200px',
    height: '200px',
    flexShrink: 0,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
  },
  // TODO: Invert theme and share components with species selector
  isSelected: {
    backgroundColor: 'grey',
    boxShadow: '0px 0px 10px #FFF',
  },
})

function CategoryButton({
  name,
  nameSingular,
  optimizedImageUrl,
  shortDescription,
  onClick,
  isSelected,
}) {
  const classes = useStyles()
  return (
    <div className={classes.button}>
      <Card className={isSelected ? classes.isSelected : ''}>
        <CardActionArea className={classes.contentsWrapper} onClick={onClick}>
          <div className={classes.media}>
            <img
              src={optimizedImageUrl}
              alt={`Thumbnail for category ${name}`}
              className={classes.thumbnail}
            />
          </div>

          <CardContent className={classes.content}>
            <Typography variant="h5" component="h2">
              {nameSingular}
            </Typography>
            <Typography component="p">{shortDescription}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </div>
  )
}

function CategoryButtons({ selectedCategory, onSelect }) {
  const classes = useStyles()
  return (
    <div className={classes.buttons}>
      {Object.keys(AssetCategories).map((categoryName) => (
        <CategoryButton
          key={categoryName}
          onClick={() => onSelect(categoryName)}
          isSelected={categoryName === selectedCategory}
          {...categoryMeta[categoryName]}
        />
      ))}
    </div>
  )
}

export default ({
  assetId,
  existingCategory,
  actionCategory = '',
  onDone = null,
  overrideSave = null,
}) => {
  const userId = useUserId()
  const [isSaving, , , save] = useDatabaseSave(CollectionNames.Assets, assetId)
  const [newCategory, setNewCategory] = useState(existingCategory)

  if (!userId) {
    return 'You are not logged in'
  }

  if (isSaving) {
    return 'Saving...'
  }

  const onSaveBtnClick = async () => {
    try {
      if (overrideSave) {
        overrideSave(newCategory)

        if (onDone) {
          onDone()
        }
        return
      }

      trackAction(actionCategory, 'Click save asset category button', assetId)

      await save({
        [AssetFieldNames.category]: newCategory,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return (
    <>
      <CategoryButtons
        selectedCategory={newCategory}
        onSelect={(categoryName) => setNewCategory(categoryName)}
      />
      <FormControls>
        <Button onClick={onSaveBtnClick} icon={<SaveIcon />}>
          Save
        </Button>
      </FormControls>
    </>
  )
}
