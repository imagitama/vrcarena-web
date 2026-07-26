import { useState } from 'react'
import InputLabel from '@mui/material/InputLabel'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'

import { ViewNames, UserRoles, UserForList } from '@/modules/users'

import useDataStoreEdit from '@/hooks/useDataStoreEdit'
import useDatabaseQuery, {
  Operators,
  WhereOperators,
} from '@/hooks/useDatabaseQuery'

import UsernameLink from '@/components/username-link'
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

  if (lastErrorCodeSave !== null)
    return (
      <ErrorMessage>Failed to save (code {lastErrorCodeSave})</ErrorMessage>
    )
  if (lastErrorCodeUsers !== null)
    return (
      <ErrorMessage>
        Failed to load users (code {lastErrorCodeUsers})
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
        <InputLabel>Assign To</InputLabel>
        <Select
          label="Assign"
          value={selectedUserId !== null ? selectedUserId : VALUE_NO_USER}
          onChange={(e) =>
            setSelectedUserId(
              e.target.value === VALUE_NO_USER
                ? null
                : (e.target.value as string)
            )
          }
          disabled={isBusy}
          size="small">
          <MenuItem value={VALUE_NO_USER}>No user assigned</MenuItem>
          {users.map((user) => (
            <MenuItem key={user.id} value={user.id}>
              {user.username} [{user.role}]
            </MenuItem>
          ))}
        </Select>
        <SaveButton isDisabled={!hasChanged || isBusy} onClick={onClickSave} />
      </div>
      {isSaveSuccess && (
        <SuccessMessage>
          {selectedUserId !== null
            ? 'User assigned successfully'
            : 'Assignment cleared successfully'}
        </SuccessMessage>
      )}
    </>
  )
}

export default AssignForm
