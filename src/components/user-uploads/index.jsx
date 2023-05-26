import React from 'react'
import { UploadItemFieldNames } from '../../hooks/useDatabaseQuery'
import ImageGallery from '../image-gallery'
import UserUploadsItem from '../user-uploads-item'

export default ({ uploads, user }) => {
  return (
    <div>
      <ImageGallery
        items={uploads.map(uploadItem => (
          <div>
            <UserUploadsItem
              key={uploadItem[UploadItemFieldNames.url]}
              uploadItem={uploadItem}
              user={user}
            />
          </div>
        ))}
        thumbnailUrls={uploads.map(
          uploadItem => uploadItem[UploadItemFieldNames.thumbnailUrl]
        )}
      />
    </div>
  )
}
