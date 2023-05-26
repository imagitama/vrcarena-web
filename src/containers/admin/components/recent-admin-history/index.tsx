import React from 'react'
import ErrorMessage from '../../../../components/error-message'
import LoadingIndicator from '../../../../components/loading-indicator'
import Timeline from '../../../../components/timeline'
import useDatabaseQuery, {
  HistoryFieldNames,
  Operators,
  options,
  OrderDirections,
  UserAdminMetaFieldNames,
  UserRoles,
  WhereOperators
} from '../../../../hooks/useDatabaseQuery'
import { createMessage, FullHistoryEntry } from '../../../../modules/history'
import { CollectionNames as UsersCollectionNames } from '../../../../modules/users'
import { CollectionNames as CommentsCollectionNames } from '../../../../modules/comments'
import { CollectionNames as AssetsCollectionNames } from '../../../../modules/assets'
import { CollectionNames } from '../../../../data-store'

interface UserAdminMeta {
  id: string
  role: string
}

const staffMemberUserCap = 20
const limit = 25

export default () => {
  const [isLoadingEditors, isErrorLoadingStaff, staffUsers] = useDatabaseQuery<
    UserAdminMeta
  >(
    UsersCollectionNames.UsersAdminMeta,
    [
      [UserAdminMetaFieldNames.role, Operators.EQUALS, UserRoles.Editor],
      WhereOperators.OR,
      [UserAdminMetaFieldNames.role, Operators.EQUALS, UserRoles.Admin]
    ],
    {
      [options.queryName]: 'get-staff-users'
    }
  )

  if (Array.isArray(staffUsers) && staffUsers.length > staffMemberUserCap) {
    throw new Error(
      `Result should be less than the cap ${staffMemberUserCap} (got ${
        staffUsers.length
      })`
    )
  }

  const staffMemberUserIds =
    staffUsers &&
    Array.isArray(staffUsers) &&
    staffUsers.length < staffMemberUserCap
      ? staffUsers.map(({ id }) => id)
      : []

  const [isLoadingEntries, isErrorLoadingEntries, entries] = useDatabaseQuery<
    FullHistoryEntry
  >(
    'getfullhistory',
    staffMemberUserIds.length
      ? staffMemberUserIds.reduce<any[]>(
          (whereClause, userId, idx) =>
            whereClause
              .concat(idx > 0 ? [WhereOperators.OR] : [])
              .concat([
                [HistoryFieldNames.createdBy, Operators.EQUALS, userId]
              ]),
          []
        )
      : false,
    {
      [options.queryName]: 'get-full-history',
      [options.limit]: limit,
      [options.orderBy]: [HistoryFieldNames.createdAt, OrderDirections.DESC]
    }
  )

  if (isLoadingEditors || isLoadingEntries || !Array.isArray(entries)) {
    return (
      <LoadingIndicator
        message={`Loading ${
          isLoadingEditors ? 'editors' : 'entries'
        }... (takes approx 15 seconds)`}
      />
    )
  }

  if (isErrorLoadingEntries || isErrorLoadingStaff) {
    return <ErrorMessage>Failed to load</ErrorMessage>
  }

  const entriesToRender = entries.filter(
    entry =>
      // ignore asset details as they get spammy
      // TODO: maybe show them if the asset is public so we can keep track of published changes?
      entry.parenttable !== AssetsCollectionNames.Assets &&
      // ignore new comments
      entry.message !== createMessage &&
      entry.parenttable !== CommentsCollectionNames.Comments &&
      // ignore their own account edits
      (entry.parenttable !== UsersCollectionNames.Users &&
        entry.parent !== entry.createdby) &&
      // notepad isnt important
      (entry.parenttable !== CollectionNames.Pages &&
        entry.parent !== 'notepad')
  )

  return <Timeline entries={entriesToRender} />
}
