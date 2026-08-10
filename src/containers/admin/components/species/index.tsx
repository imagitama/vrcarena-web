import React from 'react'
import Table from '@/components/responsive-table'
import TableBody from '@mui/material/TableBody'
import { TableCell } from '@/components/responsive-table'
import { TableHead } from '@/components/responsive-table'
import { TableRow } from '@/components/responsive-table'

import { getShortId } from '@/utils/formatting'
import { routes } from '@/routes'
import useDataStoreItems from '@/hooks/useDataStoreItems'
import { CollectionNames, FullSpecies, ViewNames } from '@/modules/species'

import ErrorMessage from '@/components/error-message'
import LoadingIndicator from '@/components/loading-indicator'
import NoResultsMessage from '@/components/no-results-message'
import EditorRecordManager from '@/components/editor-record-manager'
import ShortId from '@/components/short-id'
import Heading from '@/components/heading'

const View = () => {
  const [isLoading, lastErrorCode, speciesItems, , hydrate] =
    useDataStoreItems<FullSpecies>(ViewNames.GetFullSpecies, undefined, {
      orderBy: 'createdat',
    })

  if (lastErrorCode !== null)
    return (
      <ErrorMessage>Failed to load species (code {lastErrorCode})</ErrorMessage>
    )
  if (isLoading || !speciesItems)
    return <LoadingIndicator message="Loading species..." />

  return (
    <Table size="small">
      <TableHead>
        <TableCell></TableCell>
        <TableCell>Parent</TableCell>
        <TableCell>Name</TableCell>
        <TableCell>Redirect To</TableCell>
        <TableCell>Thumbnail</TableCell>
        <TableCell>Controls</TableCell>
      </TableHead>
      <TableBody>
        {speciesItems.length === 0 ? (
          <TableRow>
            <TableCell colSpan={999}>
              <NoResultsMessage>No species found</NoResultsMessage>
            </TableCell>
          </TableRow>
        ) : (
          speciesItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell title={item.id}>
                <ShortId
                  url={routes.viewSpeciesWithVar.replace(
                    ':speciesIdOrSlug',
                    item.id
                  )}>
                  {item.id}
                </ShortId>
              </TableCell>
              <TableCell label="Parent" title={item.parent || ''}>
                {item.parent
                  ? `${item.parentpluralname} (#${getShortId(item.parent)})`
                  : '-'}
              </TableCell>
              <TableCell label="Name">
                {item.singularname}
                <br />
                {item.pluralname}
              </TableCell>
              <TableCell label="Redirect To" title={item.redirectto || ''}>
                {item.redirectto
                  ? `${item.redirectto} (#${getShortId(item.redirectto)})`
                  : '-'}
              </TableCell>
              <TableCell label="Thumbnail">
                <img width="50" height="50" src={item.thumbnailurl} />
                <br />
                <small>
                  <a href={item.thumbnailsourceurl} target="_blank">
                    Source
                  </a>
                </small>
              </TableCell>
              <TableCell label="Controls">
                <EditorRecordManager
                  id={item.id}
                  metaCollectionName={CollectionNames.SpeciesMeta}
                  editUrl={routes.editSpeciesWithVar.replace(
                    ':speciesId',
                    item.id
                  )}
                  showAccessButtons
                  existingAccessStatus={item.accessstatus}
                  showApprovalButtons
                  existingApprovalStatus={item.approvalstatus}
                  showEditorNotes
                  existingEditorNotes={item.editornotes}
                  onDone={hydrate}
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

export default () => (
  <>
    <Heading variant="h1">Species</Heading>
    <View />
  </>
)
