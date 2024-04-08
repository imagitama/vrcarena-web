import React, { useState } from 'react'
import Paper from '@material-ui/core/Paper'

import { HistoryEntry } from '../../modules/history'
import { CollectionNames as AssetsCollectionNames } from '../../modules/assets'
import * as routes from '../../routes'

import Link from '../../components/link'
import UsernameLink from '../username-link'
import FormattedDate from '../formatted-date'
import Button from '../button'
import Tabs from '../tabs'
import TextDiff from '../text-diff'
import NoResultsMessage from '../no-results-message'

function HistoryData({ data }: { data: any }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!data.changes) {
    return <>No data</>
  }

  return (
    <>
      {isExpanded && (
        <div style={{ font: 'monospace' }}>
          {JSON.stringify(data.changes, null, '  ')}
        </div>
      )}
      {!isExpanded && (
        <Button onClick={() => setIsExpanded((currentVal) => !currentVal)}>
          View
        </Button>
      )}
    </>
  )
}

function ParentLabel({
  parentTable,
  parentId,
}: {
  parentTable: string
  parentId: string
}) {
  const collectionName = parentTable

  if (
    collectionName === AssetsCollectionNames.Assets ||
    collectionName === AssetsCollectionNames.AssetsMeta
  ) {
    return (
      <Link to={routes.viewAssetWithVar.replace(':assetId', parentId)}>
        {parentId}
      </Link>
    )
  }

  if (parentId) {
    return <>{parentId}</>
  }

  return <>(none)</>
}

interface EntryDiff {
  entry: HistoryEntry
  oldValue: string
  newValue: string
}

const HistoryRevisions = <TData,>({
  entries,
  fieldNameToDiff,
}: {
  entries: HistoryEntry<TData>[] // sort by createdat ASC (will be reversed later)
  fieldNameToDiff: keyof TData
}) => {
  console.debug('HistoryRevisions.render.1', { entries, fieldNameToDiff })

  const entriesWithContent = entries.filter(
    (entry) => entry.data.changes[fieldNameToDiff]
  )

  if (!entriesWithContent) {
    return <NoResultsMessage>No useful entries found</NoResultsMessage>
  }

  console.debug('HistoryRevisions.render.2', { entriesWithContent })

  const entryDiffs: EntryDiff[] = entriesWithContent.reduce<EntryDiff[]>(
    (finalEntryDiffs, entry, idx) =>
      finalEntryDiffs.concat([
        {
          entry,
          oldValue: idx === 0 ? '' : finalEntryDiffs[idx - 1].newValue,
          newValue: entry.data.changes[fieldNameToDiff] as unknown as string, // assume whatever field you want to diff is a string
        },
      ]),
    []
  )

  console.debug('HistoryRevisions.render.3', { entryDiffs })

  const entryDiffsReversed = [...entryDiffs.reverse()]

  return (
    <Tabs
      horizontal
      items={entryDiffsReversed.map(
        ({
          entry: {
            id,
            message,
            parent,
            parenttable: parentTable,
            data,
            createdat: createdAt,
            createdby: createdBy,
          },
          oldValue,
          newValue,
        }) => ({
          name: `tab_${id}`,
          label: <FormattedDate date={createdAt} />,
          contents: (
            <>
              <TextDiff oldValue={oldValue} newValue={newValue} />
            </>
          ),
        })
      )}
    />
  )
}

export default HistoryRevisions
