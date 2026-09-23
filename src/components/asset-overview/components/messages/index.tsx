import React, { useContext } from 'react'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import DeleteIcon from '@mui/icons-material/Delete'
import CreateIcon from '@mui/icons-material/Create'

import {
  IndicativeAuditStatus,
  CollectionNames as AssetsCollectionNames,
} from '@/modules/assets'
import {
  ViewNames as AmendmentsViewNames,
  AmendmentWithMeta,
} from '@/modules/amendments'
import {
  ViewNames as SubEditorResponsesViewNames,
  FullSubEditorResponse,
} from '@/modules/subeditorresponses'
import { AccessStatus, ApprovalStatus, PublishStatus } from '@/modules/common'
import {
  getArchivedReasonLabel,
  getDeclinedReasonLabel,
  getDeletionReasonLabel,
} from '@/utils/assets'
import {
  Decline as DeclineIcon,
  Queue as QueueIcon,
  SubEditor as SubEditorIcon,
} from '@/icons'
import { capitalize } from '@/utils'
import { routes } from '@/routes'

import useIsEditor from '@/hooks/useIsEditor'
import useUserId from '@/hooks/useUserId'
import useDatabaseQuery, {
  Operators,
  OrderDirections,
} from '@/hooks/useDatabaseQuery'

import Message from '@/components/message'
import PublicEditorNotes from '@/components/public-editor-notes'
import ErrorMessage from '@/components/error-message'
import WarningMessage from '@/components/warning-message'
import ClearIndicativeStatusButton from '@/components/clear-indicative-status-button'
import {
  ResponsiveTable as Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@/components/responsive-table'
import FormattedDate from '@/components/formatted-date'
import StatusText, {
  getPositivityForAccessStatus,
  getPositivityForApprovalStatus,
} from '@/components/status-text'
import ShortId from '@/components/short-id'
import SubEditorResults from '@/components/sub-editor-results'

import AssetOverviewContext from '../../context'

const useActiveAmendmentsForAsset = (assetId: string): AmendmentWithMeta[] => {
  const myUserId = useUserId()
  const [, , results] = useDatabaseQuery<AmendmentWithMeta>(
    AmendmentsViewNames.GetAmendmentsForList,
    myUserId
      ? [
          ['parent', Operators.EQUALS, assetId],
          ['parenttable', Operators.EQUALS, AssetsCollectionNames.Assets],
          ['approvalstatus', Operators.EQUALS, 'waiting'],
          ['accessstatus', Operators.EQUALS, 'public'],
          ['createdby', Operators.EQUALS, myUserId],
        ]
      : false,
    {
      orderBy: ['createdat', OrderDirections.DESC],
    }
  )

  return results || []
}

const useSubEditorResponsesForAsset = (
  assetId: string | false,
  cacheKey?: string
): FullSubEditorResponse[] => {
  const [, , results] = useDatabaseQuery<FullSubEditorResponse>(
    SubEditorResponsesViewNames.GetFullSubEditorResponses,
    [
      ['parenttable', Operators.EQUALS, AssetsCollectionNames.Assets],
      ['parentid', Operators.EQUALS, assetId],
    ],
    {
      cacheKey,
      orderBy: ['createdat', OrderDirections.DESC],
    }
  )

  return results || []
}

const AssetOverviewMessages = () => {
  const { assetId, asset, isLoading, hydrate, cacheKey } =
    useContext(AssetOverviewContext)

  const isEditor = useIsEditor()
  const activeAmendmentsForAsset = useActiveAmendmentsForAsset(assetId)
  const subEditorResponsesForAsset = useSubEditorResponsesForAsset(
    asset && asset.approvalstatus === ApprovalStatus.Waiting ? asset.id : false,
    cacheKey
  )

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
  } else {
    switch (asset.approvalstatus) {
      case ApprovalStatus.Quarantined:
        messages.push(
          <Message color="#1c0002" key="declined" icon={<DeclineIcon />}>
            This asset is currently being reviewed by our staff.
          </Message>
        )
        break
      case ApprovalStatus.Declined:
        messages.push(
          <Message color="#1c0002" key="declined" icon={<DeclineIcon />}>
            This asset has been declined by our staff. It has the following
            issues:
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
        break
      case ApprovalStatus.Waiting:
        messages.push(
          <Message icon={<QueueIcon />}>
            This asset is waiting in the approval queue. If it has been longer
            than 48 hours please open a support ticket or ask in our Discord
            server.
          </Message>
        )
    }
  }

  if (activeAmendmentsForAsset.length) {
    messages.push(
      <Message>
        You have {activeAmendmentsForAsset.length} active amendments for this
        asset:
        <Table>
          <TableHead></TableHead>
          <TableBody>
            {activeAmendmentsForAsset.map((amendment) => (
              <TableRow key={amendment.id}>
                <TableCell>
                  <ShortId
                    url={routes.viewAmendmentWithVar.replace(
                      ':amendmentId',
                      amendment.id
                    )}>
                    {amendment.id}
                  </ShortId>
                </TableCell>
                <TableCell>
                  <StatusText
                    positivity={getPositivityForAccessStatus(
                      amendment.accessstatus
                    )}>
                    {capitalize(amendment.accessstatus)}
                  </StatusText>
                </TableCell>
                <TableCell>
                  <StatusText
                    positivity={getPositivityForApprovalStatus(
                      amendment.approvalstatus
                    )}>
                    {capitalize(amendment.approvalstatus)}
                  </StatusText>
                </TableCell>
                <TableCell>
                  <FormattedDate date={amendment.createdat} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Message>
    )
  }

  if (subEditorResponsesForAsset.length) {
    messages.push(
      <Message icon={<SubEditorIcon />}>
        There are {subEditorResponsesForAsset.length} community responses for
        this asset:
        <SubEditorResults
          items={subEditorResponsesForAsset}
          showParents={false}
        />
      </Message>
    )
  }

  return <>{messages}</>
}

export default AssetOverviewMessages
