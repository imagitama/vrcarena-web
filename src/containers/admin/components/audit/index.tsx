import React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import {
  ViewNames,
  FullAssetWithAudit,
  AuditResultResult,
  CollectionNames,
  ArchivedReason,
  AssetMeta,
} from '../../../../modules/assets'
import AssetResultsItem from '../../../../components/asset-results-item'
import Button from '../../../../components/button'
import PaginatedView from '../../../../components/paginated-view'
import { OrderDirections } from '../../../../hooks/useDatabaseQuery'
import { FilterSubType, FilterType } from '../../../../filters'
import StatusText from '../../../../components/status-text'
import useDataStoreEdit from '../../../../hooks/useDataStoreEdit'
import { handleError } from '../../../../error-handling'
import { AccessStatus } from '../../../../modules/common'
import SuccessMessage from '../../../../components/success-message'
import ErrorMessage from '../../../../components/error-message'
import Heading from '../../../../components/heading'
import { getFriendlyDate } from '../../../../utils/dates'
import Link from '../../../../components/link'
import InfoMessage from '../../../../components/info-message'
import Price from '../../../../components/price'
import HintText from '../../../../components/hint-text'

const getPositivityForResult = (result: AuditResultResult) => {
  switch (result) {
    case AuditResultResult.Failed:
      return -1
    case AuditResultResult.Missing:
      return -1
    case AuditResultResult.Unavailable:
      return 0
    case AuditResultResult.Success:
      return 1
    default:
      throw new Error(`Unknown result: ${result}`)
  }
}

const getLabelForResult = (result: AuditResultResult) => {
  switch (result) {
    case AuditResultResult.Failed:
      return 'Failed To Audit'
    case AuditResultResult.Missing:
      return 'Success - Store Page Missing'
    case AuditResultResult.Unavailable:
      return 'Success - Product Discontinued/Unavailable'
    case AuditResultResult.Success:
      return 'Success - Available'
    default:
      throw new Error(`Unknown result: ${result}`)
  }
}

const ArchiveButtons = ({ assetId }: { assetId: string }) => {
  const [isSaving, isSaveSuccess, lastErrorCode, save] =
    useDataStoreEdit<AssetMeta>(CollectionNames.AssetsMeta, assetId)

  const archive = async (reason: ArchivedReason) => {
    try {
      console.debug(
        `setting asset ${assetId} to "${AccessStatus.Archived}" reason "${reason}"...`
      )
      await save({
        accessstatus: AccessStatus.Archived,
        archivedreason: reason,
      })
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return (
    <>
      <Heading variant="h3">Archive</Heading>
      {lastErrorCode !== null ? (
        <ErrorMessage>Failed to save asset (code {lastErrorCode})</ErrorMessage>
      ) : isSaveSuccess ? (
        <SuccessMessage>Asset archived successfully</SuccessMessage>
      ) : null}
      <Button
        onClick={() => archive(ArchivedReason.product_missing)}
        isDisabled={isSaving}
        size="small"
        color="tertiary">
        Missing (404)
      </Button>
      <br />
      <br />
      <Button
        onClick={() => archive(ArchivedReason.product_discontinued)}
        isDisabled={isSaving}
        size="small"
        color="tertiary">
        Discontinued or Unavailable
      </Button>
      <br />
      <br />
      <HintText>
        *please verify the source is still the same in case someone manually
        <br />
        repaired the source (eg. if the author moved from Gumroad to Jinxxy)
      </HintText>
    </>
  )
}

const Renderer = ({ items }: { items?: FullAssetWithAudit[] }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Asset</TableCell>
          <TableCell>Audit Result</TableCell>
          <TableCell>Controls</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items!.map((asset) => (
          <TableRow key={asset.id}>
            <TableCell>
              <AssetResultsItem asset={asset} showState />
            </TableCell>
            <TableCell>
              {asset.auditresults ? (
                <Table>
                  <TableBody>
                    {asset.auditresults.map((auditResult) => (
                      <TableRow key={auditResult.sourceurl}>
                        <TableCell>
                          <Link to={auditResult.sourceurl} inNewTab>
                            {auditResult.sourceurl}
                          </Link>{' '}
                          <StatusText
                            positivity={getPositivityForResult(
                              auditResult.result
                            )}>
                            {getLabelForResult(auditResult.result)} (
                            {getFriendlyDate(asset.lastauditedat)})
                          </StatusText>
                          {auditResult.price ? (
                            <>
                              <Price
                                price={auditResult.price}
                                priceCurrency={auditResult.pricecurrency}
                                small
                              />
                              {auditResult.pricecurrency ? (
                                ''
                              ) : (
                                <StatusText positivity={-1}>
                                  (no currency detected)
                                </StatusText>
                              )}
                            </>
                          ) : (
                            '(no price found)'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : asset.lastauditedat ? (
                '(audit performed but no data recorded)'
              ) : (
                '(no audit performed yet)'
              )}
            </TableCell>
            <TableCell>
              <ArchiveButtons assetId={asset.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const AdminAudit = () => (
  <PaginatedView<FullAssetWithAudit>
    viewName={ViewNames.GetFullAssetsWithAudit}
    sortOptions={[
      {
        fieldName: 'lastauditedat',
        label: 'Audited At',
      },
    ]}
    defaultFieldName="lastauditedat"
    defaultDirection={OrderDirections.ASC}
    filters={[
      {
        fieldName: 'lastauditedat',
        type: FilterType.NotEqual,
        subType: FilterSubType.Null,
        label: 'Only audited',
        defaultActive: true,
      },
    ]}>
    <Renderer />
  </PaginatedView>
)

export default AdminAudit
