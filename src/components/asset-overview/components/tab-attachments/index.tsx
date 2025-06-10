import React, { useContext, useState } from 'react'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import useIsLoggedIn from '../../../../hooks/useIsLoggedIn'
import ImageGallery from '../../../image-gallery'
import Button from '../../../button'
import AttachmentEditor from '../../../attachment-editor'
import FormControls from '../../../form-controls'
import TabContext from '../../context'
import { AttachmentReason } from '../../../../modules/attachments'
import AttachmentsByParent from '../../../attachments-by-parent'
import Paper from '../../../paper'
import { CollectionNames } from '../../../../modules/assets'

const TabAttachments = () => {
  const { assetId, isLoading, hydrate } = useContext(TabContext)
  const isLoggedIn = useIsLoggedIn()
  const [isAttachmentFormVisible, setIsAttachmentFormVisible] = useState(false)

  return (
    <>
      {isLoading ? (
        <ImageGallery showLoadingCount={3} />
      ) : (
        <AttachmentsByParent
          reason={AttachmentReason.UserAdded}
          parentTable={CollectionNames.Assets}
          parentId={assetId}
          includeParents={false}
        />
      )}
      {isAttachmentFormVisible ? (
        <Paper>
          <AttachmentEditor
            reason={AttachmentReason.UserAdded}
            parentTable={CollectionNames.Assets}
            parentId={assetId}
            onDone={() => hydrate()}
          />
        </Paper>
      ) : (
        <FormControls>
          <Button
            size="large"
            icon={<AttachFileIcon />}
            onClick={() => {
              if (isLoggedIn) {
                setIsAttachmentFormVisible(true)
              }
            }}
            isDisabled={isLoading || !isLoggedIn}>
            {isLoggedIn
              ? 'Attach File or URL'
              : 'Log in to attach your file or URL'}
          </Button>
        </FormControls>
      )}
    </>
  )
}

export default TabAttachments
