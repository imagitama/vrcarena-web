import styled from '@emotion/styled'
import CheckIcon from '@mui/icons-material/Check'
import ClearIcon from '@mui/icons-material/Clear'

import { AccessStatus, ApprovalStatus, PublishStatus } from '@/modules/common'
import {
  ArchivedReason,
  AssetActions,
  AssetForList_Editor,
  CollectionNames as AssetsCollectionNames,
  DeclinedReason,
  DeletionReason,
  FullAsset_Editor,
  getIsAssetPublic,
  getIsAssetWaitingForApproval,
} from '@/modules/assets'

import EditorBox from '@/components/editor-box'
import MetaStatus from '../meta-status'
import ApproveButton from '../approve-button'
import DeleteButton from '../delete-button'
import PublicEditorNotesForm from '../public-editor-notes-form'
import StatusText from '../status-text'
import ArchiveButton from '../archive-button'

const Row = styled.div`
  display: flex;
  margin-bottom: 0.25rem;
`
const PrimaryCell = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`
const LabelCell = styled.div`
  width: 30%;
`
const ValueCell = styled.div`
  width: 70%;
`

const AssetEditorRecordManager = ({
  id,
  asset,
  onDone,
  actions,
}: {
  id: string
  asset: AssetForList_Editor | FullAsset_Editor
  onDone: () => void
  actions: AssetActions
}) => {
  const isPublic = getIsAssetPublic(asset)
  const isWaitingForApproval = getIsAssetWaitingForApproval(asset)
  return (
    <EditorBox>
      <Row>
        <PrimaryCell>
          <StatusText positivity={isPublic ? 1 : -1}>
            {isPublic ? <CheckIcon /> : <ClearIcon />}{' '}
            {isPublic
              ? 'Visible To Everyone'
              : 'Only Visible To Staff and Creator'}
          </StatusText>
        </PrimaryCell>
      </Row>
      <Row>
        <LabelCell>
          <MetaStatus
            parentType={AssetsCollectionNames.AssetsMeta}
            parentId={id}
            status={asset.publishstatus}
            type={PublishStatus}
            action={
              asset.publishstatus === PublishStatus.Published &&
              actions.published
                ? actions.published
                : undefined
            }
          />
        </LabelCell>
        <ValueCell></ValueCell>
      </Row>
      <Row>
        <LabelCell>
          <MetaStatus
            parentType={AssetsCollectionNames.AssetsMeta}
            parentId={id}
            status={asset.approvalstatus}
            type={ApprovalStatus}
            action={
              asset.approvalstatus === ApprovalStatus.Approved &&
              actions.approved
                ? actions.approved
                : asset.approvalstatus === ApprovalStatus.AutoApproved &&
                  actions.autoapproved
                ? actions.autoapproved
                : asset.approvalstatus === ApprovalStatus.Declined &&
                  actions.declined
                ? actions.declined
                : undefined
            }
            reasonOrReasons={
              asset.approvalstatus === ApprovalStatus.Declined
                ? asset.declinedreasons || []
                : undefined
            }
          />
        </LabelCell>
        <ValueCell>
          <ApproveButton
            id={id}
            metaCollectionName={AssetsCollectionNames.AssetsMeta}
            existingApprovalStatus={asset.approvalstatus}
            existingDeclinedReasons={asset.declinedreasons}
            onDone={onDone}
            isDisabled={!isWaitingForApproval}
          />
        </ValueCell>
      </Row>
      <Row>
        <LabelCell>
          <MetaStatus
            parentType={AssetsCollectionNames.AssetsMeta}
            parentId={id}
            status={asset.accessstatus}
            type={AccessStatus}
            action={
              asset.accessstatus === AccessStatus.Deleted && actions.deleted
                ? actions.deleted
                : asset.accessstatus === AccessStatus.Archived &&
                  actions.archived
                ? actions.archived
                : undefined
            }
            reasonOrReasons={
              asset.accessstatus === AccessStatus.Archived
                ? asset.archivedreason || []
                : asset.accessstatus === AccessStatus.Deleted
                ? asset.deletionreason || []
                : undefined
            }
          />
        </LabelCell>
        <ValueCell>
          <DeleteButton
            id={id}
            metaCollectionName={AssetsCollectionNames.AssetsMeta}
            existingAccessStatus={asset.accessstatus}
            existingDeletionReason={asset.deletionreason}
            onDone={onDone}
          />
          <div style={{ marginBottom: '0.25rem' }} />
          <ArchiveButton
            id={id}
            metaCollectionName={AssetsCollectionNames.AssetsMeta}
            existingAccessStatus={asset.accessstatus}
            existingArchivedReason={asset.archivedreason}
            onDone={onDone}
          />
        </ValueCell>
      </Row>
      <Row>
        <LabelCell>Public Notes</LabelCell>
        <ValueCell>
          <PublicEditorNotesForm
            id={id}
            metaCollectionName={AssetsCollectionNames.AssetsMeta}
            existingEditorNotes={asset.editornotes}
            onDone={onDone}
          />
        </ValueCell>
      </Row>
    </EditorBox>
  )
}

export default AssetEditorRecordManager
