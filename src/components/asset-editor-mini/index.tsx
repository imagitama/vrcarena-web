import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { useState } from 'react'
import { AssetCategories, AssetFieldNames } from '../../hooks/useDatabaseQuery'
import AssetThumbnail from '../asset-thumbnail'
import Button from '../button'
import Heading from '../heading'
import Paper from '../paper'
import TagInput from '../tag-input'
import TextInput from '../text-input'

export type FieldsData = any

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

export default ({
  newFields,
  onNewFields,
}: {
  newFields: FieldsData
  onNewFields: (newFields: FieldsData) => void | Promise<void>
}) => {
  const [showRecommendedTags, setShowRecommendedTags] = useState(false)
  const styles = useStyles()

  const setField = (fieldName: string, value: any) =>
    onNewFields({
      ...newFields,
      [fieldName]: value,
    })

  return (
    <Paper>
      <div className={styles.cols}>
        <div className={styles.col}>
          <AssetThumbnail url={newFields[AssetFieldNames.thumbnailUrl]} />
        </div>
        <div className={styles.col}>
          <Heading variant="h4">Title</Heading>
          <TextInput
            fullWidth
            value={newFields[AssetFieldNames.title]}
            onChange={(e) => setField(AssetFieldNames.title, e.target.value)}
          />
          <Heading variant="h4">Description</Heading>
          <TextInput
            fullWidth
            value={newFields[AssetFieldNames.description]}
            onChange={(e) =>
              setField(AssetFieldNames.description, e.target.value)
            }
            multiline
            rows={2}
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
        currentTags={newFields[AssetFieldNames.tags]}
        /* @ts-ignore */
        onChange={(newTags: string[]) =>
          setField(AssetFieldNames.tags, newTags)
        }
        showRecommendedTags={showRecommendedTags}
      />
    </Paper>
  )
}
