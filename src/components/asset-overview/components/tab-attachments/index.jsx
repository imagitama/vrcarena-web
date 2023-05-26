import React, { useContext, useRef, useState } from 'react'
import AttachFileIcon from '@material-ui/icons/AttachFile'

import { getRandomInt } from '../../../../utils'
import { CollectionNames } from '../../../../hooks/useDatabaseQuery'
import useIsLoggedIn from '../../../../hooks/useIsLoggedIn'

import Attachments from '../../../attachments'
import ImageGallery from '../../../image-gallery'
import LoadingShimmer from '../../../loading-shimmer'
import Button from '../../../button'
import AttachmentForm from '../../../attachment-form'
import FormControls from '../../../form-controls'

import TabContext from '../../context'

const LoadingGallery = () => {
  // store as ref to avoid re-drawing each re-render
  const sizesRefs = useRef([
    getRandomInt(200, 300),
    getRandomInt(200, 300),
    getRandomInt(200, 300)
  ])

  return (
    <ImageGallery
      thumbnailUrls={[
        <LoadingShimmer height={sizesRefs.current[0]} />,
        <LoadingShimmer height={sizesRefs.current[1]} />,
        <LoadingShimmer height={sizesRefs.current[2]} />
      ]}
      isStatic
    />
  )
}

export default () => {
  const { assetId, isLoading, hydrate } = useContext(TabContext)
  const isLoggedIn = useIsLoggedIn()
  const [isAttachmentFormVisible, setIsAttachmentFormVisible] = useState(false)

  return (
    <>
      {isLoading ? (
        <LoadingGallery />
      ) : (
        <Attachments parentTable={CollectionNames.Assets} parentId={assetId} />
      )}
      {isAttachmentFormVisible ? (
        <>
          <AttachmentForm
            parentTable={CollectionNames.Assets}
            parentId={assetId}
            onDone={() => hydrate()}
          />
        </>
      ) : (
        <FormControls>
          <Button
            size="large"
            icon={<AttachFileIcon />}
            onClick={() =>
              isLoggedIn ? setIsAttachmentFormVisible(true) : null
            }
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
