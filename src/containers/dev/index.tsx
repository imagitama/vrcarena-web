import React, { useState } from 'react'
import { Helmet } from '@unhead/react/helmet'
import AttachmentsForm from '@/components/attachments-form'
import { AttachmentReason } from '@/modules/attachments'

export default () => {
  const [ids, setIds] = useState<undefined | string[]>(undefined)
  return (
    <>
      <Helmet>
        <title>Development area</title>
        <meta name="description" content="Internal use." />
      </Helmet>
      <div>
        <h1>Components</h1>
        <AttachmentsForm
          reason={AttachmentReason.AssetFile}
          parentTable="assets"
          parentId="abc"
          ids={ids}
          onChange={(newIds) => setIds(newIds)}
        />
      </div>
    </>
  )
}
