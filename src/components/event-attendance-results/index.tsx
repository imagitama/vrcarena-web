import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CheckIcon from '@material-ui/icons/Check'
import ClearIcon from '@material-ui/icons/Clear'
import { AttendanceStatus, FullEventAttendance } from '../../modules/events'
import Avatar, { sizes } from '../avatar'
import UsernameLink from '../username-link'

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: '0.5rem',
    display: 'flex',
    flexWrap: 'wrap',
  },
  showDeclinedAttendanceBtn: {
    width: '100%',
    textAlign: 'center',
    padding: '0.25rem',
    opacity: 0.5,
    transition: '100ms all',
    fontSize: '75%',
    cursor: 'pointer',
    '&:hover': {
      opacity: 1,
    },
  },
  item: {
    margin: '0 0.5rem 0.5rem 0',
    position: 'relative',
    '& a': {
      color: 'inherit',
    },
  },
  status: {
    width: '1rem',
    height: '1rem',
    borderRadius: '100%',
    position: 'absolute',
    zIndex: 100,
    top: '100%',
    left: '100%',
    transform: 'translate(-75%, -75%)',
    background: theme.palette.background.paper,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& svg': {
      fontSize: '75%',
    },
  },
}))

interface ItemsByStatus {
  [AttendanceStatus.Accepted]: FullEventAttendance[]
  [AttendanceStatus.Maybe]: FullEventAttendance[]
  [AttendanceStatus.Declined]: FullEventAttendance[]
}

const Items = ({
  items,
  status,
}: {
  items: FullEventAttendance[]
  status: AttendanceStatus
}) => {
  const classes = useStyles()
  return (
    <>
      {items.map((item) => (
        <div key={item.id} className={classes.item}>
          <UsernameLink id={item.createdby}>
            <Avatar
              url={item.createdbyavatarurl}
              username={item.createdbyusername}
              size={sizes.TINY}
            />
            <div className={classes.status}>
              {status === AttendanceStatus.Accepted ? (
                <CheckIcon />
              ) : status === AttendanceStatus.Maybe ? (
                '?'
              ) : status === AttendanceStatus.Declined ? (
                <ClearIcon />
              ) : null}
            </div>
          </UsernameLink>
        </div>
      ))}
    </>
  )
}

const EventAttendanceResults = ({
  items,
}: {
  items: FullEventAttendance[]
}) => {
  const classes = useStyles()
  const [shouldShowDeclined, setShouldShowDeclined] = useState(false)

  const itemsByStatus: ItemsByStatus = items.reduce<ItemsByStatus>(
    (newItems, currentItem) => ({
      ...newItems,
      [currentItem.status]: newItems[currentItem.status].concat([currentItem]),
    }),
    {
      [AttendanceStatus.Accepted]: [],
      [AttendanceStatus.Maybe]: [],
      [AttendanceStatus.Declined]: [],
    }
  )

  return (
    <div className={classes.root}>
      <Items
        items={itemsByStatus[AttendanceStatus.Accepted]}
        status={AttendanceStatus.Accepted}
      />
      <Items
        items={itemsByStatus[AttendanceStatus.Maybe]}
        status={AttendanceStatus.Maybe}
      />
      {itemsByStatus[AttendanceStatus.Declined].length ? (
        shouldShowDeclined ? (
          <Items
            items={itemsByStatus[AttendanceStatus.Declined]}
            status={AttendanceStatus.Declined}
          />
        ) : (
          <span
            className={classes.showDeclinedAttendanceBtn}
            onClick={() => setShouldShowDeclined(true)}>
            Show declined attendees
          </span>
        )
      ) : null}
    </div>
  )
}

export default EventAttendanceResults
