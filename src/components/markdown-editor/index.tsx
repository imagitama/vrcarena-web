import React, { useState } from 'react'
import TextField from '@mui/material/TextField'
import { makeStyles } from '@mui/styles'
import Tab from '@mui/material/Tab'

import Paper from '../paper'
import Markdown from '../markdown'
import ImageUploader from '../image-uploader'
import Button from '../button'
import { bucketNames } from '../../file-uploading'
import Tabs from '../tabs'

const useStyles = makeStyles({
  input: {
    width: '100%',
    marginBottom: '1rem',
  },
  controls: {
    textAlign: 'center',
  },
  root: {
    display: 'flex',
  },
  col: {
    width: '50%',
    padding: '1rem',
    height: '100vh',
    '&:last-child > *': {
      height: '100%',
      overflow: 'auto',
    },
  },
})

export default ({
  content = '',
  onChange,
  isDisabled = false,
  allowImages = true,
}: {
  content: string
  onChange: (newText: string) => void
  isDisabled?: boolean
  allowImages?: boolean
}) => {
  const classes = useStyles()
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false)

  // TODO: Insert where cursor is
  const addToMarkdown = (txt: string) => {
    const newContent = (content ? content : '') + `\n\n${txt}`
    onChange(newContent)
  }

  const onImageUploadedWithUrl = (urls: string[]) => {
    addToMarkdown(
      `:::image{url="${urls[0]}"}
This is a caption
:::`
    )
    setIsImageEditorOpen(false)
  }

  const onClickAddButtonWithUrl = () =>
    addToMarkdown(
      `:::button{url="https://www.google.com"}
  Click me!
:::`
    )

  const onClickAddButtonWithAsset = () =>
    addToMarkdown(
      `:::button{asset=sLtMXTewSFWGvmJ8WST8}
  Click me!
:::`
    )

  const onClickAddWarning = () =>
    addToMarkdown(
      `:::warning
  This is a warning
:::`
    )

  const onClickAddInfo = () =>
    addToMarkdown(
      `:::info
  This is some info
:::`
    )

  const onClickAddTab = () =>
    addToMarkdown(
      `:::tab
  Tab A
:::`
    )

  const onClickAddTabContents = () =>
    addToMarkdown(
      `:::tabContents
  Contents of my tab.
:::`
    )

  const onClickAddImage = () =>
    setIsImageEditorOpen((currentVal) => !currentVal)

  return (
    <Tabs
      items={[
        {
          name: 'editor',
          label: 'Editor',
          contents: (
            <>
              <TextField
                value={content}
                onChange={(e) => onChange(e.target.value)}
                multiline
                minRows={75}
                maxRows={25}
                className={classes.input}
                variant="outlined"
                disabled={isDisabled}
              />
              <Button
                size="small"
                color="secondary"
                onClick={onClickAddButtonWithUrl}>
                Button (URL)
              </Button>{' '}
              <Button
                size="small"
                color="secondary"
                onClick={onClickAddButtonWithAsset}>
                Button (asset)
              </Button>{' '}
              <Button size="small" color="secondary" onClick={onClickAddInfo}>
                Info
              </Button>{' '}
              <Button
                size="small"
                color="secondary"
                onClick={onClickAddWarning}>
                Warning
              </Button>{' '}
              {allowImages && (
                <Button
                  size="small"
                  color="secondary"
                  onClick={onClickAddImage}>
                  Image
                </Button>
              )}{' '}
              <Button size="small" color="secondary" onClick={onClickAddTab}>
                Tab
              </Button>{' '}
              <Button
                size="small"
                color="secondary"
                onClick={onClickAddTabContents}>
                Tab contents
              </Button>{' '}
              {isImageEditorOpen ? (
                <>
                  <br />
                  <br />
                  <ImageUploader
                    // TODO: Better bucket
                    bucketName={bucketNames.attachments}
                    onDone={onImageUploadedWithUrl}
                    // TODO: Better path
                    directoryPath="pages"
                  />
                </>
              ) : null}
            </>
          ),
        },
        {
          name: 'preview',
          label: 'Preview',
          contents: <Markdown source={content} />,
        },
      ]}
    />
  )
}
