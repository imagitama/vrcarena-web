import React, { useState } from 'react'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { makeStyles } from '@mui/styles'
import SaveIcon from '@mui/icons-material/Save'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import categoryMeta, { CategoryMeta } from '../../category-meta'
import { Asset, AssetCategory, CollectionNames } from '../../modules/assets'

import LoadingIndicator from '../loading-indicator'
import Button from '../button'
import FormControls from '../form-controls'

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
    display: 'flex !important',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: 'grey !important',
    boxShadow: '0px 0px 10px #FFF !important',
  },
})

const CategoryButton = ({
  onClick,
  isSelected,
  meta: { optimizedImageUrl, nameSingular, shortDescription },
}: {
  onClick: () => void
  isSelected: boolean
  meta: CategoryMeta
}) => {
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

const CategoryButtons = ({
  selectedCategory,
  onSelect,
}: {
  selectedCategory: AssetCategory
  onSelect: (newCategory: AssetCategory) => void
}) => {
  const classes = useStyles()
  return (
    <div className={classes.buttons}>
      {Object.values(AssetCategory)
        .filter((name) => name !== AssetCategory.Tutorial)
        .map((categoryName) => (
          <CategoryButton
            key={categoryName}
            onClick={() => onSelect(categoryName)}
            isSelected={categoryName === selectedCategory}
            meta={categoryMeta[categoryName]}
          />
        ))}
    </div>
  )
}

const ChangeCategoryForm = ({
  assetId,
  existingCategory,
  actionCategory,
  onDone,
  overrideSave,
}: {
  assetId: string | null
  existingCategory: AssetCategory
  actionCategory?: string
  onDone?: () => void
  overrideSave?: (newCategory: AssetCategory) => void
}) => {
  const [isSaving, , , save] = useDatabaseSave<Asset>(
    assetId ? CollectionNames.Assets : false,
    assetId
  )
  const [newCategory, setNewCategory] = useState(existingCategory)

  if (isSaving) {
    return <LoadingIndicator message="Saving asset..." />
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

      if (actionCategory) {
        trackAction(actionCategory, 'Click save asset category button', assetId)
      }

      await save({
        category: newCategory,
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

export default ChangeCategoryForm
