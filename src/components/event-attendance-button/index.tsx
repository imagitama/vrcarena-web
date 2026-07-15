import React from 'react'
import CheckIcon from '@mui/icons-material/Check'

import { handleError } from '@/error-handling'
import {
  AttendanceStatus,
  CollectionNames,
  EventAttendance,
  FullEventAttendance,
} from '@/modules/events'

import useDataStoreEdit from '@/hooks/useDataStoreEdit'
import useIsLoggedIn from '@/hooks/useIsLoggedIn'
import useDataStoreCreate from '@/hooks/useDataStoreCreate'

import ErrorMessage from '@/components/error-message'
import Button from '@/components/button'
import useDataStoreEditOrCreate from '@/hooks/useDataStoreEditOrCreate'

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
  const [isSaving, , lastErrorCode, saveOrCreate] =
    useDataStoreEditOrCreate<EventAttendance>(
      CollectionNames.EventAttendance,
      myAttendance ? myAttendance.id : false,
      {
        uniqueConstraintFields: ['event', 'createdby'], // CONSTRAINT unique_only UNIQUE (event, createdby)
      }
    )

  const currentStatus = myAttendance ? myAttendance.status : undefined

  // console.debug(`EventAttendenceButton.render`, myAttendance, lastErrorCode)

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

      await saveOrCreate(
        myAttendance
          ? {
              id: myAttendance.id,
              event: eventId,
              status: statusToSave,
            }
          : {
              event: eventId,
              status: statusToSave,
            }
      )

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
