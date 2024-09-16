import React, { useContext } from 'react'
import Message from '../../../message'
import PublicEditorNotes from '../../../public-editor-notes'
import AssetOverviewContext from '../../context'
import {
  AccessStatuses,
  ApprovalStatuses,
  PublishStatuses,
} from '../../../../hooks/useDatabaseQuery'

const AssetOverviewMessages = () => {
  const { asset, isLoading } = useContext(AssetOverviewContext)

  if (!asset || isLoading) {
    return null
  }

  const messages = []

  if (asset.editornotes) {
    messages.push(<PublicEditorNotes notes={asset.editornotes} />)
  }

  if (asset.accessstatus === AccessStatuses.Deleted) {
    messages.push(
      <Message key="deleted">
        This asset has been deleted by a staff member.
      </Message>
    )
  }

  if (asset.publishstatus === PublishStatuses.Draft) {
    messages.push(
      <Message key="draft">
        This asset is a draft. It is only visible to the uploader and must be
        published (click the Edit Asset button) before it can be approved and
        seen by other people.
      </Message>
    )
  }

  if (asset.approvalstatus === ApprovalStatuses.Declined) {
    messages.push(
      <Message key="declined">
        This asset has been declined for approval. Please read our notes.
      </Message>
    )
  }

  return <>{messages}</>
}

export default AssetOverviewMessages
