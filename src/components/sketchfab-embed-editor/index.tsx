import React, { useState } from 'react'
import { makeStyles } from '@mui/styles'
import SaveIcon from '@mui/icons-material/Save'

import Paper from '../paper'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Button from '../button'
import TextInput from '../text-input'
import SketchfabEmbed from '../sketchfab-embed'

import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { Asset, CollectionNames } from '../../modules/assets'
import useDataStoreEdit from '../../hooks/useDataStoreEdit'

const useStyles = makeStyles({
  root: {
    margin: '1rem 0',
  },
  textInput: {
    width: '100%',
    marginBottom: '0.5rem',
  },
  btns: {
    textAlign: 'center',
    marginTop: '1rem',
  },
})

export default ({
  assetId,
  onDone,
  existingUrl = undefined,
  overrideSave = undefined,
}: {
  assetId: string | null
  onDone: () => void
  existingUrl?: string
  overrideSave?: (newUrl: string) => void
}) => {
  const [textFieldVal, setTextFieldVal] = useState(existingUrl || '')
  const [embedUrl, setEmbedUrl] = useState('')
  const [isSaving, , lastErrorCode, save] = useDataStoreEdit<Asset>(
    CollectionNames.Assets,
    assetId || false
  )
  const classes = useStyles()

  const onSaveBtnClick = async () => {
    try {
      if (overrideSave) {
        overrideSave(embedUrl)
        onDone()
        return
      }

      trackAction('ViewAsset', 'Click save sketchfab embed button', assetId)

      await save({
        sketchfabembedurl: embedUrl,
      })

      onDone()
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const onApplyBtnClick = () => setEmbedUrl(textFieldVal)

  if (isSaving) {
    return <LoadingIndicator message="Saving asset..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to save asset (code {lastErrorCode})</ErrorMessage>
    )
  }

  return (
    <Paper className={classes.root}>
      <ol>
        <li>
          View your Sketchfab model and above the Triangles and Vertices count
          click the Embed button
        </li>
        <li>Check any options you want for your embed</li>
        <li>Select "iframe" as the format and copy the HTML code</li>
        <li>
          In Notepad find the URL of the iframe (the "src" attribute) and copy
          it into the text field below
        </li>
        <li>Click Apply to preview then click Save</li>
      </ol>
      <TextInput
        onChange={(e) => setTextFieldVal(e.target.value)}
        className={classes.textInput}
      />{' '}
      <Button onClick={onApplyBtnClick} color="secondary">
        Apply
      </Button>
      <br />
      {embedUrl && <SketchfabEmbed url={embedUrl} />}
      <div className={classes.btns}>
        <Button onClick={onSaveBtnClick} icon={<SaveIcon />}>
          Save
        </Button>
      </div>
    </Paper>
  )
}
