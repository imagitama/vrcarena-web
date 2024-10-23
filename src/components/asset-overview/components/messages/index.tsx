import React, { useContext } from 'react'
import Message from '../../../message'
import PublicEditorNotes from '../../../public-editor-notes'
import AssetOverviewContext from '../../context'
import {
  AccessStatus,
  ApprovalStatus,
  PublishStatus,
} from '../../../../modules/common'

const AssetOverviewMessages = () => {
  const { asset, isLoading } = useContext(AssetOverviewContext)

  if (!asset || isLoading) {
    return null
  }

  const messages = []

  if (asset.editornotes) {
    messages.push(<PublicEditorNotes notes={asset.editornotes} />)
  }

  if (asset.accessstatus === AccessStatus.Archived) {
    messages.push(
      <Message key="archived">
        This asset has been archived to preserve links and for historical
        access. If this is your asset and you want it hidden forever, please
        create a new report.
      </Message>
    )
  }

  if (asset.accessstatus === AccessStatus.Deleted) {
    messages.push(
      <Message key="deleted">
        This asset has been deleted by a staff member.
      </Message>
    )
  }

  if (asset.publishstatus === PublishStatus.Draft) {
    messages.push(
      <Message key="draft">
        This asset is a draft. It is only visible to the uploader and must be
        published (click the Edit Asset button) before it can be approved and
        seen by other people.
      </Message>
    )
  }

  if (asset.approvalstatus === ApprovalStatus.Declined) {
    messages.push(
      <Message key="declined">
        This asset has been declined for approval. Please read our notes.
      </Message>
    )
  }

  return <>{messages}</>
}

export default AssetOverviewMessages
