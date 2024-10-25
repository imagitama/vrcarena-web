import React, { useContext } from 'react'
import BusinessCenterIcon from '@material-ui/icons/BusinessCenter'
import CancelIcon from '@material-ui/icons/Cancel'
import DeleteIcon from '@material-ui/icons/Delete'
import CreateIcon from '@material-ui/icons/Create'

import Message from '../../../message'
import PublicEditorNotes from '../../../public-editor-notes'
import AssetOverviewContext from '../../context'
import {
  AccessStatus,
  ApprovalStatus,
  PublishStatus,
} from '../../../../modules/common'
import {
  getArchivedReasonLabel,
  getDeclinedReasonLabel,
  getDeletionReasonLabel,
} from '../../../../assets'
import ErrorMessage from '../../../error-message'
import WarningMessage from '../../../warning-message'

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
      <WarningMessage key="archived" icon={<BusinessCenterIcon />}>
        This asset has been archived to preserve links and for historical
        accuracy:{' '}
        {asset.archivedreason
          ? getArchivedReasonLabel(asset.archivedreason)
          : 'no reason specified'}
      </WarningMessage>
    )
  }

  if (asset.accessstatus === AccessStatus.Deleted) {
    messages.push(
      <ErrorMessage
        key="deleted"
        title="Deleted"
        icon={<DeleteIcon />}
        hintText="">
        This asset has been deleted:{' '}
        {asset.deletionreason
          ? getDeletionReasonLabel(asset.deletionreason)
          : 'no reason specified'}
      </ErrorMessage>
    )
  }

  if (asset.publishstatus === PublishStatus.Draft) {
    messages.push(
      <Message key="draft" icon={<CreateIcon />}>
        This asset is a draft. It is only visible to the uploader and must be
        published (click the Edit Asset button) before it can be approved and
        seen by other people.
      </Message>
    )
  }

  if (asset.approvalstatus === ApprovalStatus.Declined) {
    messages.push(
      <Message color="#1c0002" key="declined" icon={<CancelIcon />}>
        This asset has been declined for approval. It has the following issues:
        <ul style={{ marginBottom: 0 }}>
          {asset.declinedreasons.length ? (
            asset.declinedreasons.map(getDeclinedReasonLabel)
          ) : (
            <li>no reasons specified</li>
          )}
        </ul>
      </Message>
    )
  }

  return <>{messages}</>
}

export default AssetOverviewMessages
