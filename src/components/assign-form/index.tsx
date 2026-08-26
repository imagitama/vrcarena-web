import { useState } from 'react'

import { ViewNames, UserRoles, UserForList } from '@/modules/users'

import useDataStoreEdit from '@/hooks/useDataStoreEdit'
import useDatabaseQuery, {
  Operators,
  WhereOperators,
} from '@/hooks/useDatabaseQuery'

import Select, { MenuItem } from '@/components/select'
import LoadingIndicator from '@/components/loading-indicator'
import { SaveButton } from '@/components/button'
import ErrorMessage from '@/components/error-message'
import SuccessMessage from '@/components/success-message'
import InfoMessage from '../info-message'

interface AssignableRecord extends Record<string, any> {
  assignedto: string | null
}

const VALUE_NO_USER = '' // <input> doesn't like null

const AssignForm = ({
  id,
  metaCollectionName,
  existingAssignedTo,
  existingAssignedToUsername,
  onDone,
  onlyStaff,
}: {
  id: string
  metaCollectionName: string
  existingAssignedTo: string | null
  existingAssignedToUsername: string | null
  onDone: () => void | Promise<void>
  onlyStaff: boolean
}) => {
  const [isSaving, isSaveSuccess, lastErrorCodeSave, save] =
    useDataStoreEdit<AssignableRecord>(metaCollectionName, id)
  const [isLoading, lastErrorCodeUsers, users] = useDatabaseQuery<UserForList>(
    ViewNames.GetUsersForList,
    [
      // TODO: only do this if onlyStaff=true
      ['role', Operators.EQUALS, UserRoles.Editor],
      WhereOperators.OR,
      ['role', Operators.EQUALS, UserRoles.Admin],
    ]
  )
  const [selectedUserId, setSelectedUserId] = useState(existingAssignedTo)

  if (lastErrorCodeUsers !== null)
    return (
      <ErrorMessage errorCode={lastErrorCodeUsers}>
        Failed to load users
      </ErrorMessage>
    )

  if (!users) return <LoadingIndicator message="Loading users..." />

  const hasChanged = selectedUserId !== existingAssignedTo
  const isBusy = isLoading || isSaving

  const onClickSave = async () => {
    await save({
      assignedto: selectedUserId,
    })

    onDone()
  }

  return (
    <>
      <InfoMessage>Please only assign to yourself</InfoMessage>
      <div style={{ margin: '0.5rem 0' }}>
        <Select
          label="Select a user"
          value={selectedUserId !== null ? selectedUserId : VALUE_NO_USER}
          onChange={(e) =>
            setSelectedUserId(
              e.target.value === VALUE_NO_USER
                ? null
                : (e.target.value as string)
            )
          }
          disabled={isBusy}
          size="small"
          style={{ width: '300px' }}
          button={
            <SaveButton
              isDisabled={!hasChanged || isBusy}
              onClick={onClickSave}
            />
          }>
          <MenuItem value={VALUE_NO_USER}>No user assigned</MenuItem>
          {users.map((user) => (
            <MenuItem key={user.id} value={user.id}>
              {user.username} [{user.role}]
            </MenuItem>
          ))}
        </Select>
      </div>
      {isSaveSuccess ? (
        <SuccessMessage>
          {selectedUserId !== null
            ? 'User assigned successfully'
            : 'Assignment cleared successfully'}
        </SuccessMessage>
      ) : lastErrorCodeSave ? (
        <ErrorMessage errorCode={lastErrorCodeSave}>
          Failed to save
        </ErrorMessage>
      ) : null}
    </>
  )
}

export default AssignForm
