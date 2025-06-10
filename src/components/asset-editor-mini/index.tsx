import React, { useState } from 'react'
import { makeStyles } from '@mui/styles'

import { AssetFields } from '../../modules/assets'

import AssetThumbnail from '../asset-thumbnail'
import Button from '../button'
import Heading from '../heading'
import Paper from '../paper'
import TagInput from '../tag-input'
import TextInput from '../text-input'

const useStyles = makeStyles({
  cols: {
    display: 'flex',
  },
  col: {
    width: '100%',
    '&:first-child': {
      width: '33%',
    },
  },
})

const AssetEditorMini = ({
  newFields,
  onNewFields,
}: {
  newFields: AssetFields
  onNewFields: (newFields: AssetFields) => void | Promise<void>
}) => {
  const [showRecommendedTags, setShowRecommendedTags] = useState(false)
  const styles = useStyles()

  const setField = (fieldName: keyof AssetFields, value: any) =>
    onNewFields({
      ...newFields,
      [fieldName]: value,
    })

  return (
    <Paper>
      <div className={styles.cols}>
        <div className={styles.col}>
          <AssetThumbnail url={newFields.thumbnailurl} />
        </div>
        <div className={styles.col}>
          <Heading variant="h4">Title</Heading>
          <TextInput
            fullWidth
            value={newFields.title}
            onChange={(e) => setField('title', e.target.value)}
          />
          <Heading variant="h4">Description</Heading>
          <TextInput
            fullWidth
            value={newFields.description}
            onChange={(e) => setField('description', e.target.value)}
            multiline
            minRows={2}
          />
        </div>
      </div>
      <Heading variant="h4">Tags</Heading>
      <Button
        onClick={() => setShowRecommendedTags((currentVal) => !currentVal)}>
        Toggle Recommended
      </Button>
      <br />
      <TagInput
        currentTags={newFields.tags}
        onChange={(newTags: string[]) => setField('tags', newTags)}
        showRecommendedTags={showRecommendedTags}
      />
    </Paper>
  )
}

export default AssetEditorMini
