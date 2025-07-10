import React from 'react'
import CheckIcon from '@mui/icons-material/Check'

import useDataStoreEdit from '../../hooks/useDataStoreEdit'
import { handleError } from '../../error-handling'
import {
  AttendanceStatus,
  CollectionNames,
  EventAttendance,
  FullEventAttendance,
} from '../../modules/events'
import ErrorMessage from '../error-message'
import Button from '../button'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'
import useDataStoreCreate from '../../hooks/useDataStoreCreate'

const EventAttendenceButton = ({
  eventId,
  myAttendance = undefined,
  onDone = undefined,
}: {
  eventId: string
  myAttendance?: FullEventAttendance
  onDone?: () => void
}) => {
  const isLoggedIn = useIsLoggedIn()
  const [isSaving, , lastErrorCode, saveOrCreate] = myAttendance
    ? useDataStoreEdit<EventAttendance>(
        CollectionNames.EventAttendance,
        myAttendance.id
      )
    : useDataStoreCreate<EventAttendance>(CollectionNames.EventAttendance)

  const currentStatus = myAttendance ? myAttendance.status : undefined

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to save your attendance (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  const onClickStatus = async (statusClickedOn: AttendanceStatus) => {
    try {
      const statusToSave =
        statusClickedOn === currentStatus
          ? AttendanceStatus.Abstain
          : statusClickedOn

      await saveOrCreate({
        event: eventId,
        status: statusToSave,
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to toggle deleted status', err)
      handleError(err)
    }
  }

  return (
    <>
      <Button
        color="secondary"
        onClick={() => onClickStatus(AttendanceStatus.Accepted)}
        icon={
          currentStatus === AttendanceStatus.Accepted ? (
            <CheckIcon />
          ) : undefined
        }
        isDisabled={!isLoggedIn || isSaving}>
        Attend
      </Button>{' '}
      <Button
        color="secondary"
        onClick={() => onClickStatus(AttendanceStatus.Maybe)}
        icon={
          currentStatus === AttendanceStatus.Maybe ? <CheckIcon /> : undefined
        }
        isDisabled={!isLoggedIn || isSaving}>
        Maybe
      </Button>{' '}
      <Button
        color="secondary"
        onClick={() => onClickStatus(AttendanceStatus.Declined)}
        icon={
          currentStatus === AttendanceStatus.Declined ? (
            <CheckIcon />
          ) : undefined
        }
        isDisabled={!isLoggedIn || isSaving}>
        Decline
      </Button>
    </>
  )
}

export default EventAttendenceButton
