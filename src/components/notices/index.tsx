import React from 'react'
import useDatabaseQuery, {
  OrderDirections,
  Operators,
} from '../../hooks/useDatabaseQuery'
import { makeStyles } from '@material-ui/core/styles'
import { ViewNames, FullNotice } from '../../modules/notices'
import Notice from '../notice'
import ErrorMessage from '../error-message'
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow,
} from '../../media-queries'
import useNotices from '../../hooks/useNotices'

const useStyles = makeStyles({
  home: {
    with: '100vw',
    padding: '2rem',
    [mediaQueryForTabletsOrBelow]: {
      padding: '1rem',
    },
    [mediaQueryForMobiles]: {
      padding: '0.5rem',
    },
  },
  notice: {
    marginBottom: '1rem',
    [mediaQueryForMobiles]: {
      marginBottom: '0.5rem',
    },
  },
})

const Notices = ({ isHome = false }: { isHome: boolean }) => {
  const [isLoading, isErrored, results] = useDatabaseQuery<FullNotice>(
    ViewNames.GetFullNotices,
    [['isvisible', Operators.EQUALS, true]],
    100,
    ['orderby', OrderDirections.ASC]
  )
  const classes = useStyles()
  const [hiddenNotices, hideNoticeById] = useNotices()

  if (isErrored) {
    return <ErrorMessage>Failed to load notices</ErrorMessage>
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
    <div className={isHome ? classes.home : ''}>
      {noticesToShow.map((notice) => (
        <div className={classes.notice} key={notice.id}>
          <Notice {...notice} hide={() => hideNoticeById(notice.hideid)} />
        </div>
      ))}
    </div>
  )
}

export default Notices
