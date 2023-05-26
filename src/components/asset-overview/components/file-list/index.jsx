import React from 'react'
import FileResult from '../file-result'

export default ({ assetId, fileUrls }) => {
  if (!fileUrls.length) {
    return 'None found'
  }
  return fileUrls.map(fileUrl => (
    <FileResult key={fileUrl} assetId={assetId} url={fileUrl} />
  ))
}
