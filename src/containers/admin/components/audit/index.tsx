import React, { useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import SaveIcon from '@mui/icons-material/Save'
import {
  ViewNames,
  FullAssetWithAudit,
  AuditResultResult,
  CollectionNames,
  ArchivedReason,
  AssetMeta,
  AuditResult,
  Asset,
  SourceInfo,
} from '../../../../modules/assets'
import AssetResultsItem from '../../../../components/asset-results-item'
import Button from '../../../../components/button'
import PaginatedView, {
  RendererProps,
} from '../../../../components/paginated-view'
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
import Price from '../../../../components/price'
import HintText from '../../../../components/hint-text'
import useFirebaseFunction from '../../../../hooks/useFirebaseFunction'
import useTimer from '../../../../hooks/useTimer'
import LoadingIndicator from '../../../../components/loading-indicator'
import Dialog from '../../../../components/dialog'
import CheckboxInput from '../../../../components/checkbox-input'
import FormControls from '../../../../components/form-controls'
import NoValueLabel from '../../../../components/no-value-label'
import Tooltip from '../../../../components/tooltip'
import LoadingMessage from '../../../../components/loading-message'

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

const ArchiveButtons = ({
  assetId,
  onDone,
}: {
  assetId: string
  onDone: () => void
}) => {
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

      onDone()
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return (
    <>
      {isSaving ? (
        <LoadingMessage>Saving asset...</LoadingMessage>
      ) : lastErrorCode !== null ? (
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

const ApplyPricesButton = ({
  asset,
  onDone,
}: {
  asset: FullAssetWithAudit
  onDone: () => void
}) => {
  const [isSaving, isSaveSuccess, lastErrorCode, save] =
    useDataStoreEdit<Asset>(CollectionNames.Assets, asset.id)
  const [isConfirmShown, setIsConfirmShown] = useState(false)
  const [sourceUrlsToApply, setSourceUrlsToApply] = useState<string[]>(
    asset.auditresults
      ? asset.auditresults.map((auditResult) => auditResult.sourceurl)
      : []
  )
  const onDoneAfterDelay = useTimer(onDone)

  const mainAuditResult = asset.auditresults
    ? asset.auditresults.find(
        (auditResult) => auditResult.sourceurl === asset.sourceurl
      )
    : {
        price: null,
        pricecurrency: null,
      }

  const newMainPrice = mainAuditResult?.price || null
  const newMainPriceToSave = sourceUrlsToApply.includes(asset.sourceurl)
    ? newMainPrice
    : undefined
  const newMainPriceCurrency = mainAuditResult?.pricecurrency || null
  const newMainPriceCurrencyToSave = sourceUrlsToApply.includes(asset.sourceurl)
    ? newMainPriceCurrency
    : undefined

  const newExtraSourcesToSave =
    asset.extrasources && asset.auditresults
      ? asset.extrasources.map((sourceInfo) => {
          const match = asset.auditresults.find(
            (auditResult) => auditResult.sourceurl == sourceInfo.url
          )

          if (!match) {
            return sourceInfo
          }

          const { price, pricecurrency } = match

          return {
            ...sourceInfo,
            price,
            pricecurrency,
          }
        })
      : []

  const confirmSave = async () => {
    try {
      console.debug(`saving asset ${asset.id} prices...`)

      await save({
        price: newMainPriceToSave,
        pricecurrency: newMainPriceCurrencyToSave,
        extrasources: newExtraSourcesToSave,
      })

      onDoneAfterDelay()
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const onClickSave = () => setIsConfirmShown(true)

  const toggleSourceUrlToApply = (sourceUrl: string) =>
    setSourceUrlsToApply((currentUrls) =>
      currentUrls.includes(sourceUrl)
        ? currentUrls.filter((url) => url !== sourceUrl)
        : currentUrls.concat([sourceUrl])
    )

  const allExtraSourceUrls = Array.from(
    new Set([
      ...(asset.extrasources || []).map((sourceInfo) => sourceInfo.url),
      ...(asset.auditresults || [])
        .filter((auditResult) => auditResult.sourceurl !== asset.sourceurl)
        .map((auditResult) => auditResult.sourceurl),
    ])
  )

  return (
    <>
      {isConfirmShown && asset.auditresults ? (
        <Dialog>
          <Heading variant="h3" noTopMargin>
            New Prices
          </Heading>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>URL</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Currency</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  {asset.sourceurl} <strong>(main source)</strong>
                </TableCell>
                <TableCell>
                  {asset.price !== null ? (
                    asset.price
                  ) : (
                    <NoValueLabel>No price</NoValueLabel>
                  )}
                  {' => '}
                  <Tooltip
                    title={
                      newMainPrice === undefined
                        ? 'undefined'
                        : newMainPrice === null
                        ? 'null'
                        : newMainPrice
                    }>
                    <div>
                      {newMainPrice !== null
                        ? newMainPrice
                        : 'No price (cleared)'}
                    </div>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  {asset.pricecurrency !== null ? (
                    asset.pricecurrency
                  ) : (
                    <NoValueLabel>No currency</NoValueLabel>
                  )}
                  {' => '}
                  <Tooltip
                    title={
                      newMainPriceCurrency === undefined
                        ? 'undefined'
                        : newMainPriceCurrency === null
                        ? 'null'
                        : newMainPriceCurrency
                    }>
                    <div>
                      {newMainPriceCurrency !== null
                        ? newMainPriceCurrency
                        : 'No currency (cleared)'}
                    </div>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <CheckboxInput
                    value={sourceUrlsToApply.includes(asset.sourceurl)}
                    onChange={() => toggleSourceUrlToApply(asset.sourceurl)}
                  />
                </TableCell>
              </TableRow>
              {allExtraSourceUrls.map((sourceUrl) => {
                const auditResult = asset.auditresults?.find(
                  (auditResult) => auditResult.sourceurl === sourceUrl
                )

                const sourceInfo = asset.extrasources?.find(
                  (sourceInfo) => sourceInfo.url === sourceUrl
                )

                if (!auditResult) {
                  return (
                    <TableRow key={sourceUrl}>
                      <TableCell colSpan={999}>
                        <NoValueLabel>
                          {sourceUrl} is in the list of sources but not in the
                          last audit (was it added recently?)
                        </NoValueLabel>
                      </TableCell>
                    </TableRow>
                  )
                }

                if (!sourceInfo) {
                  return (
                    <TableRow key={sourceUrl}>
                      <TableCell colSpan={999}>
                        <NoValueLabel>
                          {sourceUrl} was in the last audit but it is no longer
                          in the list of sources (was it removed?)
                        </NoValueLabel>
                      </TableCell>
                    </TableRow>
                  )
                }

                return (
                  <TableRow key={sourceInfo.url}>
                    <TableCell>{auditResult.sourceurl}</TableCell>
                    <TableCell>
                      {sourceInfo.price !== null ? (
                        sourceInfo.price
                      ) : (
                        <NoValueLabel>No price</NoValueLabel>
                      )}
                      {' => '}
                      <Tooltip title={newMainPrice}>
                        <span>
                          {auditResult.price !== null
                            ? auditResult.price
                            : 'No price (cleared)'}
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {sourceInfo.pricecurrency !== null ? (
                        sourceInfo.pricecurrency
                      ) : (
                        <NoValueLabel>No currency</NoValueLabel>
                      )}
                      {' => '}
                      <Tooltip title={newMainPrice}>
                        <span>
                          {auditResult.pricecurrency !== null
                            ? auditResult.pricecurrency
                            : 'No currency (cleared)'}
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <CheckboxInput
                        value={sourceUrlsToApply.includes(sourceInfo.url)}
                        onChange={() => toggleSourceUrlToApply(sourceInfo.url)}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <Heading variant="h3">Result</Heading>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>URL</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Currency</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{asset.sourceurl} (main source)</TableCell>
                <TableCell>
                  {newMainPriceToSave === null
                    ? 'No price (clear)'
                    : newMainPriceToSave === undefined
                    ? 'Price unchanged'
                    : newMainPriceToSave}
                </TableCell>
                <TableCell>
                  {newMainPriceCurrencyToSave === null
                    ? 'No currency (clear)'
                    : newMainPriceCurrencyToSave === undefined
                    ? 'Currency unchanged'
                    : newMainPriceCurrencyToSave}
                </TableCell>
              </TableRow>
              {newExtraSourcesToSave.map((sourceInfo) => (
                <TableRow key={sourceInfo.url}>
                  <TableCell>{sourceInfo.url}</TableCell>
                  <TableCell>
                    {sourceInfo.price !== null
                      ? sourceInfo.price
                      : 'No price (clear)'}
                  </TableCell>
                  <TableCell>
                    {sourceInfo.pricecurrency !== null
                      ? sourceInfo.pricecurrency
                      : 'No currency (clear)'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {isSaving ? (
            <LoadingMessage>Saving...</LoadingMessage>
          ) : lastErrorCode !== null ? (
            <ErrorMessage>
              Failed to save asset (code {lastErrorCode})
            </ErrorMessage>
          ) : isSaveSuccess ? (
            <SuccessMessage>
              Asset prices saved successfully, closing and refreshing...
            </SuccessMessage>
          ) : null}
          <FormControls>
            <Button onClick={confirmSave} icon={<SaveIcon />}>
              Save
            </Button>
            &nbsp;
            <Button color="secondary" onClick={() => setIsConfirmShown(false)}>
              Cancel
            </Button>
          </FormControls>
        </Dialog>
      ) : null}
      <Button
        onClick={onClickSave}
        isDisabled={
          isSaving ||
          !asset.auditresults ||
          !asset.auditresults.find(
            (auditResult) => auditResult.result === AuditResultResult.Success
          )
        }
        size="small"
        color="primary">
        Apply Prices
      </Button>
    </>
  )
}

const RetryButton = ({
  assetId,
  onDone,
}: {
  assetId: string
  onDone: () => void
}) => {
  const [isCalling, lastErrorCode, result, call] = useFirebaseFunction<
    { assetId: string },
    { result: AuditResult[] }
  >('auditAsset')
  const onDoneAfterDelay = useTimer(onDone)

  const onClick = async () => {
    try {
      console.debug('retrying audit...')

      await call({
        assetId,
      })

      onDoneAfterDelay()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      {isCalling ? (
        <LoadingMessage>Retrying...</LoadingMessage>
      ) : lastErrorCode !== null ? (
        <ErrorMessage>Failed to retry (code {lastErrorCode})</ErrorMessage>
      ) : result && Array.isArray(result.result) ? (
        <SuccessMessage>Retry successful, refreshing view...</SuccessMessage>
      ) : null}
      <Button
        onClick={onClick}
        isDisabled={isCalling}
        color="secondary"
        size="small">
        Retry Audit
      </Button>
    </>
  )
}

const Renderer = ({ items, hydrate }: RendererProps<FullAssetWithAudit>) => {
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
        {items ? (
          items.map((asset) => {
            const allSourceUrls = Array.from(
              new Set([
                asset.sourceurl,
                ...(asset.extrasources || []).map((s) => s.url),
                ...(asset.auditresults || []).map((a) => a.sourceurl),
              ])
            )

            return (
              <TableRow key={asset.id}>
                <TableCell>
                  <AssetResultsItem asset={asset} showState />
                </TableCell>
                <TableCell>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>URL</TableCell>
                        <TableCell>Original Price</TableCell>
                        <TableCell>Audit Result</TableCell>
                        <TableCell>Latest Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allSourceUrls.map((sourceUrl) => {
                        const sourceInfo =
                          sourceUrl === asset.sourceurl
                            ? {
                                price: asset.price,
                                pricecurrency: asset.pricecurrency,
                              }
                            : asset.extrasources?.find(
                                (s) => s.url === sourceUrl
                              ) || {}

                        const auditResult = asset.auditresults?.find(
                          (a) => a.sourceurl === sourceUrl
                        )

                        return (
                          <TableRow key={sourceUrl}>
                            <TableCell>
                              <Link to={sourceUrl} inNewTab>
                                {sourceUrl}
                              </Link>
                            </TableCell>
                            <TableCell>
                              {sourceInfo.price === null ? (
                                <NoValueLabel>No price</NoValueLabel>
                              ) : sourceInfo.price !== undefined ? (
                                <Price
                                  price={sourceInfo.price}
                                  priceCurrency={sourceInfo.pricecurrency}
                                  small
                                />
                              ) : null}
                            </TableCell>
                            <TableCell>
                              {auditResult ? (
                                <StatusText
                                  positivity={getPositivityForResult(
                                    auditResult.result
                                  )}>
                                  {getLabelForResult(auditResult.result)} (
                                  {getFriendlyDate(asset.lastauditedat)})
                                </StatusText>
                              ) : asset.lastauditedat ? (
                                '(asset was audited but no data found for this URL)'
                              ) : (
                                '(no audit performed yet)'
                              )}
                            </TableCell>
                            <TableCell>
                              {auditResult && auditResult.price !== null ? (
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
                                ''
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableCell>
                <TableCell>
                  <Heading variant="h3">Archive</Heading>
                  <ArchiveButtons assetId={asset.id} onDone={hydrate} />
                  <br />
                  <br />
                  <ApplyPricesButton asset={asset} onDone={hydrate} />
                  <br />
                  <br />
                  <RetryButton assetId={asset.id} onDone={hydrate} />
                </TableCell>
              </TableRow>
            )
          })
        ) : (
          <TableRow>
            <TableCell colSpan={999}>
              <LoadingIndicator message="Loading audits..." />
            </TableCell>
          </TableRow>
        )}
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
      {
        fieldName: 'id',
        type: FilterType.Equal,
        subType: FilterSubType.Id,
        label: 'Asset ID',
      },
    ]}
    isRendererForLoading>
    {/* @ts-ignore */}
    <Renderer />
  </PaginatedView>
)

export default AdminAudit
