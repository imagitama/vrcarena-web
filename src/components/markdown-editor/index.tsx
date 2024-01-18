import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'

import Paper from '../paper'
import Markdown from '../markdown'
import ImageUploader from '../firebase-image-uploader'
import Button from '../button'

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
  },
})

export default ({
  content = '',
  onChange,
}: {
  content: string
  onChange: (newText: string) => void
}) => {
  const classes = useStyles()
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false)

  // TODO: Insert where cursor is
  const addToMarkdown = (txt: string) => {
    const newContent = (content ? content : '') + `\n\n${txt}`
    onChange(newContent)
  }

  const onImageUploadedWithUrl = (url: string) => {
    addToMarkdown(
      `:::image{url="${url}"}
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
    <div className={classes.root}>
      <div className={classes.col}>
        <Paper>
          <TextField
            value={content}
            onChange={(e) => onChange(e.target.value)}
            multiline
            rows={75}
            rowsMax={25}
            className={classes.input}
            variant="outlined"
          />
          <Button
            size="small"
            color="default"
            onClick={onClickAddButtonWithUrl}>
            Button (URL)
          </Button>{' '}
          <Button
            size="small"
            color="default"
            onClick={onClickAddButtonWithAsset}>
            Button (asset)
          </Button>{' '}
          <Button size="small" color="default" onClick={onClickAddInfo}>
            Info
          </Button>{' '}
          <Button size="small" color="default" onClick={onClickAddWarning}>
            Warning
          </Button>{' '}
          <Button size="small" color="default" onClick={onClickAddImage}>
            Image
          </Button>{' '}
          <Button size="small" color="default" onClick={onClickAddTab}>
            Tab
          </Button>{' '}
          <Button size="small" color="default" onClick={onClickAddTabContents}>
            Tab contents
          </Button>{' '}
        </Paper>
        {isImageEditorOpen ? (
          <>
            <br />
            <br />
            <ImageUploader
              onUploadedWithUrl={onImageUploadedWithUrl}
              directoryPath="pages"
            />
          </>
        ) : null}
      </div>
      <div className={classes.col}>
        <Markdown source={content} />
      </div>
    </div>
  )
}
