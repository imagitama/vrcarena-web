import React, { useContext } from 'react'
import {
  AssetFieldNames,
  AssetCategories,
  AssetMetaFieldNames,
  AccessStatuses,
  PublishStatuses,
  ApprovalStatuses
} from '../../../../hooks/useDatabaseQuery'
import Link from '../../../link'
import Message from '../../../message'
import PublicEditorNotes from '../../../public-editor-notes'
import TabContext from '../../context'
import WarningMessage from '../../../warning-message'

export default () => {
  const { asset, isLoading } = useContext(TabContext)

  if (isLoading) {
    return null
  }

  const messages = []

  if (asset[AssetMetaFieldNames.editorNotes]) {
    messages.push(
      <PublicEditorNotes notes={asset[AssetMetaFieldNames.editorNotes]} />
    )
  }

  if (asset[AssetMetaFieldNames.accessStatus] === AccessStatuses.Deleted) {
    messages.push(
      <Message key="deleted">
        This asset has been deleted by a staff member.
      </Message>
    )
  }

  if (asset[AssetMetaFieldNames.publishStatus] === PublishStatuses.Draft) {
    messages.push(
      <Message key="draft">
        This asset is a draft. It is only visible to the uploader and must be
        published (click the Edit Asset button) before it can be approved and
        seen by other people.
      </Message>
    )
  }

  if (asset[AssetMetaFieldNames.approvalStatus] === ApprovalStatuses.Waiting) {
    messages.push(
      <Message key="waiting">
        This asset is being reviewed by our staff to ensure that it meets our
        guidelines and that all required fields are present.
      </Message>
    )
  }

  if (asset[AssetMetaFieldNames.approvalStatus] === ApprovalStatuses.Declined) {
    messages.push(
      <Message key="declined">
        This asset has been declined for approval. Please read the comments.
      </Message>
    )
  }

  if (
    Array.isArray(asset[AssetFieldNames.tags]) &&
    (asset[AssetFieldNames.tags].includes('mod') ||
      asset[AssetFieldNames.tags].includes('mod_required'))
  ) {
    messages.push(
      <WarningMessage key="mod">
        This asset has been marked as a "modification". VRChat has{' '}
        <Link to="https://hello.vrchat.com/blog/vrchat-security-update">
          banned all modded clients
        </Link>{' '}
        so using this mod is at your own risk.
      </WarningMessage>
    )
  }

  return <>{messages}</>
}
