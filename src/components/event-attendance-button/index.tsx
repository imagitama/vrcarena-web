import React from 'react'
import CheckIcon from '@material-ui/icons/Check'

import useDatabaseSave from '../../hooks/useDatabaseSave'
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

const DeleteButton = ({
  eventId,
  myAttendance = undefined,
  onDone = undefined,
}: {
  eventId: string
  myAttendance?: FullEventAttendance
  onDone?: () => void
}) => {
  const isLoggedIn = useIsLoggedIn()
  const [isSaving, , isErroredSaving, saveOrCreate] =
    useDatabaseSave<EventAttendance>(
      CollectionNames.EventAttendance,
      myAttendance ? myAttendance.id : null
    )

  const currentStatus = myAttendance ? myAttendance.status : undefined

  if (isErroredSaving) {
    return <ErrorMessage>Failed to save your attendance</ErrorMessage>
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
        color="default"
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
        color="default"
        onClick={() => onClickStatus(AttendanceStatus.Maybe)}
        icon={
          currentStatus === AttendanceStatus.Maybe ? <CheckIcon /> : undefined
        }
        isDisabled={!isLoggedIn || isSaving}>
        Maybe
      </Button>{' '}
      <Button
        color="default"
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

export default DeleteButton
