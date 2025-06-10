import React from 'react'
import Dialog from '@mui/material/Dialog'
import SaveIcon from '@mui/icons-material/Save'
import LoopIcon from '@mui/icons-material/Loop'
import { makeStyles } from '@mui/styles'

import TextInput from '../text-input'
import { useEffect, useState } from 'react'
import { CollectionNames, CoreAssetFields } from '../../modules/assets'
import TagInput from '../tag-input'
import FormControls from '../form-controls'
import Button from '../button'
import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import SuccessMessage from '../success-message'
import ErrorMessage from '../error-message'
import useTimer from '../../hooks/useTimer'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import Heading from '../heading'

const useStyles = makeStyles({
  contents: {
    width: '50vw',
    [mediaQueryForTabletsOrBelow]: {
      width: '100%',
    },
  },
  paper: {
    maxWidth: '100%',
    padding: '0.5rem',
    [mediaQueryForTabletsOrBelow]: {
      width: '100%',
    },
  },
})

interface CoreAssetFieldsWithId extends CoreAssetFields {
  id: string
}

const InlineAssetEditor = ({
  asset,
  onDone,
  onCancel,
}: {
  asset: CoreAssetFieldsWithId
  onDone: () => void
  onCancel: () => void
}) => {
  const [newFields, setNewFields] = useState<CoreAssetFields>({
    title: asset.title,
    thumbnailurl: asset.thumbnailurl,
    author: asset.author,
    category: asset.category,
    slug: asset.slug,
    isadult: asset.isadult,
    price: asset.price,
    pricecurrency: asset.pricecurrency,
    species: asset.species,
    tags: asset.tags,
  })
  const [isSaving, isSuccess, lastErrorCode, save] =
    useDataStoreEdit<CoreAssetFields>(CollectionNames.Assets, asset.id)
  const onDoneAfterTimer = useTimer(onDone, 500)
  const classes = useStyles()

  useEffect(() => {
    if (!isSuccess) {
      return
    }
    onDoneAfterTimer()
  }, [isSuccess])

  const setField = (fieldName: keyof CoreAssetFields, value: any) =>
    setNewFields((currentVal) => ({
      ...currentVal,
      [fieldName]: value,
    }))

  const onClickSave = () => save(newFields)

  return (
    <Dialog
      open
      onClose={onCancel}
      PaperProps={{
        className: classes.paper,
      }}>
      <div className={classes.contents}>
        <Heading variant="h2" noTopMargin>
          Inline Edit "{asset.title}"
        </Heading>
        {isSuccess ? (
          <SuccessMessage>Saved. Closing...</SuccessMessage>
        ) : lastErrorCode !== null ? (
          <ErrorMessage>Failed to save: {lastErrorCode}</ErrorMessage>
        ) : (
          <>
            <TextInput
              value={newFields.title}
              onChange={(e) => setField('title', e.target.value)}
              label="Title"
              isDisabled={isSaving}
              fullWidth
            />
            {/* <DropdownInput
              options={Object.entries(AssetCategory).map(([key, value]) => ({
                value: value,
                label: key,
              }))}
              value={newFields.category}
              onChange={(newVal) => setField('category', newVal)}
              label="Category"
              isDisabled={isSaving}
              fullWidth
            /> */}
            {/* <TextInput
              value={newFields.tags.join(' ')}
              onChange={(e) => setField('tags', e.target.value.split(' '))}
              isDisabled={isSaving}
              multiline
              rows={5}
              fullWidth
            /> */}
            <TagInput
              currentTags={asset.tags}
              onChange={(newTags) => setField('tags', newTags)}
              isDisabled={isSaving}
              showChatGptSuggestions={false}
              showRecommendedTags={false}
            />
            <FormControls>
              <Button
                onClick={onClickSave}
                icon={isSaving ? <LoopIcon /> : <SaveIcon />}
                isDisabled={isSaving}>
                Save
              </Button>
              <Button
                onClick={onCancel}
                isDisabled={isSaving}
                color="secondary">
                Cancel
              </Button>
            </FormControls>
          </>
        )}
      </div>
    </Dialog>
  )
}

export default InlineAssetEditor
