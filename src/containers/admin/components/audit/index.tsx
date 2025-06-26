import React, { Fragment, useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import SaveIcon from '@mui/icons-material/Save'
import HelpIcon from '@mui/icons-material/Help'

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
import useTimer from '../../../../hooks/useTimer'
import LoadingIndicator from '../../../../components/loading-indicator'
import Dialog from '../../../../components/dialog'
import FormControls from '../../../../components/form-controls'
import NoValueLabel from '../../../../components/no-value-label'
import Tooltip from '../../../../components/tooltip'
import LoadingMessage from '../../../../components/loading-message'
import { routes } from '../../../../routes'
import {
  AuditQueueItem,
  AuditQueueItemsByAsset,
  AuditResult,
  AuditResultResult,
  CollectionNames,
  QueueStatus,
  ViewNames,
} from '../../../../modules/auditqueue'
import {
  ArchivedReason,
  Asset,
  AssetMeta,
  CollectionNames as AssetsCollectionNames,
  SourceInfo,
} from '../../../../modules/assets'
import useDataStoreCreate from '../../../../hooks/useDataStoreCreate'
import useUserId from '../../../../hooks/useUserId'

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

const getPositivityForQueueStatus = (queueStatus: QueueStatus) => {
  switch (queueStatus) {
    case QueueStatus.Failed:
      return -1
    case QueueStatus.Processing:
    case QueueStatus.Queued:
      return 0
    case QueueStatus.Processed:
      return 1
    default:
      throw new Error(`Unknown queue status: ${queueStatus}`)
  }
}

const getLabelForQueueStatus = (queueStatus: QueueStatus) => {
  switch (queueStatus) {
    case QueueStatus.Failed:
      return 'Failed To Automatically Apply'
    case QueueStatus.Processing:
    case QueueStatus.Queued:
      return 'Automatically applying...'
    case QueueStatus.Processed:
      return 'Automatically Applied!'
    default:
      throw new Error(`Unknown queue status: ${queueStatus}`)
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
    useDataStoreEdit<AssetMeta>(AssetsCollectionNames.AssetsMeta, assetId)

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

const ApplyAuditButton = ({
  asset,
  queueItem,
  onDone,
}: {
  asset: Asset
  queueItem: AuditQueueItem
  onDone: () => void
}) => {
  const [isSaving, isSaveSuccess, lastErrorCode, save] =
    useDataStoreEdit<Asset>(AssetsCollectionNames.Assets, asset.id)
  const [isConfirmShown, setIsConfirmShown] = useState(false)
  const onDoneAfterDelay = useTimer(onDone)

  const isMainSource = asset.sourceurl && queueItem.url === asset.sourceurl

  const auditResult = queueItem.result

  let fieldsToSave: Partial<Asset> | null = null

  if (auditResult) {
    if (isMainSource) {
      fieldsToSave = {
        price: auditResult.price,
        pricecurrency: auditResult.pricecurrency,
      }

      if (auditResult.actualurl && auditResult.actualurl !== asset.sourceurl) {
        fieldsToSave.sourceurl = auditResult.actualurl
      }
    } else {
      const newExtraSources = (asset.extrasources || []).map((extraSource) =>
        extraSource.url === queueItem.url
          ? {
              ...extraSource,
              url: auditResult.actualurl || extraSource.url,
              price: auditResult.price,
              pricecurrency: auditResult.pricecurrency,
            }
          : extraSource
      )

      fieldsToSave = {
        extrasources: newExtraSources,
      }
    }
  }

  const confirmSave = async () => {
    try {
      console.debug(`applying audit for asset ${asset.id}...`)

      if (!fieldsToSave) {
        console.warn('cannot proceed without fields to save')
        return
      }

      await save(fieldsToSave)

      onDoneAfterDelay()
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const onClickSave = () => setIsConfirmShown(true)

  const sourceInfo: SourceInfo | undefined = isMainSource
    ? {
        url: asset.sourceurl,
        price: asset.price,
        pricecurrency: asset.pricecurrency,
        comments: '',
      }
    : asset.extrasources.find(
        (extraSource) => extraSource.url === queueItem.url
      )

  if (!sourceInfo) {
    return '(no source info)'
  }

  return (
    <>
      {isConfirmShown && auditResult ? (
        <Dialog>
          <Heading variant="h3" noTopMargin>
            New Data
          </Heading>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>URL</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Currency</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fieldsToSave && isMainSource ? (
                <TableRow>
                  <TableCell>
                    <strong>Main: </strong> {asset.sourceurl}
                    {' => '}
                    {fieldsToSave.sourceurl || '(unchanged)'}
                  </TableCell>
                  <TableCell>
                    {asset.price === null ? (
                      <NoValueLabel>No Price</NoValueLabel>
                    ) : (
                      asset.price
                    )}
                    {' => '}
                    {fieldsToSave.price === null ? (
                      <NoValueLabel>No Price</NoValueLabel>
                    ) : (
                      fieldsToSave.price
                    )}
                  </TableCell>
                  <TableCell>
                    {asset.pricecurrency === null ? (
                      <NoValueLabel>No Currency</NoValueLabel>
                    ) : (
                      asset.pricecurrency
                    )}
                    {' => '}
                    {fieldsToSave.pricecurrency === null ? (
                      <NoValueLabel>No Currency</NoValueLabel>
                    ) : (
                      fieldsToSave.pricecurrency
                    )}
                  </TableCell>
                </TableRow>
              ) : fieldsToSave ? (
                fieldsToSave.extrasources?.map((extraSourceToSave) => {
                  const currentExtraSource = asset.extrasources.find(
                    (extraSource) => extraSource.url === queueItem.url
                  )

                  if (!currentExtraSource) {
                    return (
                      <TableRow key={extraSourceToSave.url}>
                        <TableCell colSpan={999}>No source found</TableCell>
                      </TableRow>
                    )
                  }

                  return (
                    <TableRow key={extraSourceToSave.url}>
                      <TableCell>{extraSourceToSave.url}</TableCell>
                      <TableCell>
                        {currentExtraSource.price === null ? (
                          <NoValueLabel>No Price</NoValueLabel>
                        ) : (
                          currentExtraSource.price
                        )}
                        {' => '}
                        {extraSourceToSave.price === null ? (
                          <NoValueLabel>No Price</NoValueLabel>
                        ) : (
                          extraSourceToSave.price
                        )}
                      </TableCell>
                      <TableCell>
                        {currentExtraSource.pricecurrency === null ? (
                          <NoValueLabel>No Currency</NoValueLabel>
                        ) : (
                          currentExtraSource.pricecurrency
                        )}
                        {' => '}
                        {extraSourceToSave.pricecurrency === null ? (
                          <NoValueLabel>No Currency</NoValueLabel>
                        ) : (
                          extraSourceToSave.pricecurrency
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={999}>(no data)</TableCell>
                </TableRow>
              )}
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
              {fieldsToSave && isMainSource ? (
                <TableRow>
                  <TableCell>
                    <strong>Main: </strong>{' '}
                    {fieldsToSave.sourceurl || '(unchanged)'}
                  </TableCell>
                  <TableCell>{fieldsToSave.price}</TableCell>
                  <TableCell>{fieldsToSave.pricecurrency}</TableCell>
                </TableRow>
              ) : fieldsToSave ? (
                fieldsToSave.extrasources?.map((extraSourceToSave) => (
                  <TableRow key={extraSourceToSave.url}>
                    <TableCell>{extraSourceToSave.url}</TableCell>
                    <TableCell>
                      {extraSourceToSave.price !== null
                        ? extraSourceToSave.price
                        : 'No price (clear)'}
                    </TableCell>
                    <TableCell>
                      {extraSourceToSave.pricecurrency !== null
                        ? extraSourceToSave.pricecurrency
                        : 'No currency (clear)'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={999}>(no data)</TableCell>
                </TableRow>
              )}
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
              Asset saved successfully, closing and refreshing...
            </SuccessMessage>
          ) : null}
          <FormControls>
            <Button
              onClick={confirmSave}
              icon={<SaveIcon />}
              isDisabled={isSaving}>
              Save Asset
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
        size="small"
        color="primary"
        isDisabled={
          isSaving ||
          !auditResult ||
          auditResult.result !== AuditResultResult.Success
        }>
        Apply...
      </Button>
    </>
  )
}

const RetryButton = ({
  assetId,
  sourceUrl,
  onDone,
}: {
  assetId: string
  sourceUrl: string
  onDone: () => void
}) => {
  const [isCreating, isSuccess, lastErrorCode, create, clear] =
    useDataStoreCreate<AuditQueueItem>(CollectionNames.AuditQueue)
  const onDoneAfterDelay = useTimer(onDone)
  const myUserId = useUserId()

  const onClick = async () => {
    try {
      console.debug('retrying audit by inserting back into queue...')

      if (!assetId || !sourceUrl) {
        throw new Error('Missing data')
      }

      await create({
        parent: assetId,
        parenttable: AssetsCollectionNames.Assets,
        url: sourceUrl,
        queuedat: new Date(0).toISOString(), // oldest date so it gets done ASAP
        queuedby: myUserId,
      })

      onDoneAfterDelay()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      {isCreating ? (
        <LoadingMessage>Inserting back into queue...</LoadingMessage>
      ) : lastErrorCode !== null ? (
        <ErrorMessage onOkay={clear}>
          Failed to retry (code {lastErrorCode})
        </ErrorMessage>
      ) : isSuccess ? (
        <SuccessMessage>Retry successful, refreshing view...</SuccessMessage>
      ) : null}
      <Button
        onClick={onClick}
        isDisabled={isCreating}
        color="secondary"
        size="small">
        Re-Queue
      </Button>
    </>
  )
}

const getIsAnythingDifferent = (asset: any) => true

const Renderer = ({
  items,
  hydrate,
}: RendererProps<AuditQueueItemsByAsset>) => {
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
          items.map(({ asset, items }) => {
            const isAnythingDifferent = getIsAnythingDifferent(asset)

            return (
              <TableRow
                key={asset.id}
                style={{ opacity: isAnythingDifferent ? 1 : 0.5 }}>
                <TableCell>
                  <AssetResultsItem asset={asset} showState />
                </TableCell>
                <TableCell>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>URL</TableCell>
                        <TableCell>Current Price</TableCell>
                        <TableCell>Audit Result</TableCell>
                        <TableCell>Actual URL</TableCell>
                        <TableCell>Latest Price</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((queueItem) => {
                        const isMainSource = queueItem.url === asset.sourceurl

                        const sourceInfo: SourceInfo | undefined = isMainSource
                          ? {
                              url: asset.sourceurl,
                              price: asset.price,
                              pricecurrency: asset.pricecurrency,
                              comments: '',
                            }
                          : asset.extrasources.find(
                              (extraSource) => extraSource.url === queueItem.url
                            )

                        const auditResult = queueItem.result

                        if (!sourceInfo) {
                          return (
                            <TableRow key={queueItem.id}>
                              <TableCell colSpan={999}>
                                <NoValueLabel>
                                  {queueItem.url} was in the last audit but it
                                  is no longer in the list of sources (was it
                                  removed?)
                                </NoValueLabel>
                              </TableCell>
                            </TableRow>
                          )
                        }

                        return (
                          <TableRow key={queueItem.id}>
                            <TableCell>
                              {isMainSource ? <strong>Main: </strong> : null}
                              <Link to={queueItem.url} inNewTab>
                                {queueItem.url}
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
                            <TableCell
                              title={`Queued at ${queueItem.queuedat}, last modified at ${queueItem.lastmodifiedat}`}>
                              {auditResult ? (
                                <StatusText
                                  positivity={getPositivityForResult(
                                    auditResult.result
                                  )}>
                                  {getLabelForResult(auditResult.result)} (
                                  {queueItem.lastmodifiedat
                                    ? getFriendlyDate(queueItem.lastmodifiedat)
                                    : 'not audited yet'}
                                  )
                                </StatusText>
                              ) : asset.lastauditedat ? (
                                '(asset was audited but no data found for this URL)'
                              ) : (
                                '(no audit performed yet)'
                              )}
                            </TableCell>
                            <TableCell>
                              {auditResult && auditResult.actualurl ? (
                                <Link to={auditResult.actualurl} inNewTab>
                                  {auditResult.actualurl}
                                </Link>
                              ) : (
                                <NoValueLabel>Same</NoValueLabel>
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
                            <TableCell>
                              <ApplyAuditButton
                                asset={asset}
                                queueItem={queueItem}
                                onDone={hydrate}
                              />
                              {queueItem.applystatus ? (
                                <>
                                  <br />
                                  <br />
                                  <StatusText
                                    positivity={getPositivityForQueueStatus(
                                      queueItem.applystatus
                                    )}>
                                    {getLabelForQueueStatus(
                                      queueItem.applystatus
                                    )}
                                    {queueItem.applystatus ===
                                    QueueStatus.Processed ? (
                                      <Tooltip
                                        title={JSON.stringify({
                                          old: queueItem.old,
                                          new: queueItem.new,
                                        })}>
                                        <HelpIcon />
                                      </Tooltip>
                                    ) : null}
                                  </StatusText>{' '}
                                  <br />
                                </>
                              ) : null}
                              <RetryButton
                                assetId={asset.id}
                                sourceUrl={queueItem.url}
                                onDone={hydrate}
                              />
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
  <PaginatedView<AuditQueueItemsByAsset>
    viewName={ViewNames.GetAuditQueueItemsByAsset}
    urlWithPageNumberVar={routes.adminWithTabNameVarAndPageNumberVar.replace(
      ':tabName',
      'audit'
    )}
    sortOptions={[
      {
        fieldName: 'lastmodifiedat',
        label: 'Last Updated',
      },
    ]}
    defaultFieldName="lastmodifiedat"
    defaultDirection={OrderDirections.DESC}
    filters={[
      {
        fieldName: 'lastmodifiedat',
        type: FilterType.NotEqual,
        subType: FilterSubType.Null,
        label: 'Only processed',
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
