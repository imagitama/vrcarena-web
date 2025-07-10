import React, { useContext } from 'react'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import CancelIcon from '@mui/icons-material/Cancel'
import DeleteIcon from '@mui/icons-material/Delete'
import CreateIcon from '@mui/icons-material/Create'

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
} from '../../../../utils/assets'
import ErrorMessage from '../../../error-message'
import WarningMessage from '../../../warning-message'
import { IndicativeAuditStatus } from '../../../../modules/assets'
import useIsEditor from '../../../../hooks/useIsEditor'
import ClearIndicativeStatusButton from '../../../clear-indicative-status-button'

const AssetOverviewMessages = () => {
  const { asset, isLoading, hydrate } = useContext(AssetOverviewContext)
  const isEditor = useIsEditor()

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
  } else if (
    asset.indicativeauditstatus &&
    asset.indicativeauditstatus !== IndicativeAuditStatus.Available
  ) {
    messages.push(
      <WarningMessage
        key="indicativeauditstatus"
        icon={<BusinessCenterIcon />}
        controls={
          isEditor
            ? [
                <ClearIndicativeStatusButton
                  assetId={asset.id}
                  onDone={hydrate}
                />,
              ]
            : null
        }>
        Our automated systems have detected this product's source goes to a
        missing (404) page or is discontinued or unavailable. Please help us by
        logging in and amending it with the correct source URL to maintain data
        integrity on the site.
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
          {asset.declinedreasons && asset.declinedreasons.length ? (
            asset.declinedreasons.map((reason) => (
              <li key={reason}>{getDeclinedReasonLabel(reason)}</li>
            ))
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
