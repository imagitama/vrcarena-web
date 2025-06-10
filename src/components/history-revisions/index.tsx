import React from 'react'

import { HistoryEntry } from '../../modules/history'
import FormattedDate from '../formatted-date'
import Tabs from '../tabs'
import TextDiff from '../text-diff'
import NoResultsMessage from '../no-results-message'

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
  const entriesWithContent = entries.filter(
    (entry) => entry.data.changes[fieldNameToDiff]
  )

  if (!entriesWithContent) {
    return <NoResultsMessage>No useful entries found</NoResultsMessage>
  }

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

  const entryDiffsReversed = [...entryDiffs.reverse()]

  return (
    <Tabs
      horizontal
      items={entryDiffsReversed.map(
        ({ entry: { id, createdat: createdAt }, oldValue, newValue }) => ({
          name: `tab_${id}`,
          label: <FormattedDate date={createdAt} />,
          contents: (
            <>
              <TextDiff oldValue={oldValue || ''} newValue={newValue || ''} />
            </>
          ),
        })
      )}
    />
  )
}

export default HistoryRevisions
