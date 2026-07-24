import React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import ErrorMessage from '@/components/error-message'
import LoadingIndicator from '@/components/loading-indicator'
import useDataStoreItems from '@/hooks/useDataStoreItems'
import { CollectionNames, FullSpecies, ViewNames } from '@/modules/species'
import NoResultsMessage from '@/components/no-results-message'
import { getShortId } from '@/utils/formatting'
import EditorRecordManager from '@/components/editor-record-manager'
import Button from '@/components/button'
import { Edit as EditIcon } from '@/icons'
import { routes } from '@/routes'
import Link from '@/components/link'

const AdminSpecies = () => {
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
        <TableCell>Name (singular)</TableCell>
        <TableCell>Name (plural)</TableCell>
        <TableCell>Redirect To</TableCell>
        <TableCell>Thumbnail</TableCell>
        <TableCell></TableCell>
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
                <Link
                  to={routes.viewSpeciesWithVar.replace(
                    ':speciesIdOrSlug',
                    item.id
                  )}>
                  #{getShortId(item.id)}
                </Link>
              </TableCell>
              <TableCell title={item.parent || ''}>
                {item.parent
                  ? `${item.parentpluralname} (#${getShortId(item.parent)})`
                  : '-'}
              </TableCell>
              <TableCell>{item.singularname}</TableCell>
              <TableCell>{item.pluralname}</TableCell>
              <TableCell title={item.redirectto || ''}>
                {item.redirectto
                  ? `${item.redirectto} (#${getShortId(item.redirectto)})`
                  : '-'}
              </TableCell>
              <TableCell>
                <img width="50" height="50" src={item.thumbnailurl} />
                <br />
                <small>
                  <a href={item.thumbnailsourceurl} target="_blank">
                    Source
                  </a>
                </small>
              </TableCell>
              <TableCell>
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

export default AdminSpecies
