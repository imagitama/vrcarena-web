import React from 'react'
import useDatabaseQuery, {
  OrderDirections,
  Operators,
} from '../../hooks/useDatabaseQuery'
import { makeStyles } from '@mui/styles'
import { ViewNames, FullNotice } from '../../modules/notices'
import Notice from '../notice'
import ErrorMessage from '../error-message'
import { mediaQueryForMobiles } from '../../media-queries'
import useNotices from '../../hooks/useNotices'

const useStyles = makeStyles({
  notice: {
    marginBottom: '1rem',
    [mediaQueryForMobiles]: {
      marginBottom: '0.5rem',
    },
  },
})

const Notices = () => {
  const [isLoading, lastErrorCode, results] = useDatabaseQuery<FullNotice>(
    ViewNames.GetFullNotices,
    [['isvisible', Operators.EQUALS, true]],
    100,
    ['orderby', OrderDirections.ASC]
  )
  const classes = useStyles()
  const [hiddenNotices, hideNoticeById] = useNotices()

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load notices (code {lastErrorCode})</ErrorMessage>
    )
  }

  if (isLoading || !results || !results.length) {
    return null
  }

  const noticesToShow = results.filter(
    (notice) => !hiddenNotices.includes(notice.hideid)
  )

  if (!noticesToShow.length) {
    return null
  }

  return (
    <>
      {noticesToShow.map((notice) => (
        <div className={classes.notice} key={notice.id}>
          <Notice {...notice} hide={() => hideNoticeById(notice.hideid)} />
        </div>
      ))}
    </>
  )
}

export default Notices
