import React from 'react'
import useDatabaseQuery, {
  OrderDirections,
  Operators
} from '../../hooks/useDatabaseQuery'
import { makeStyles } from '@material-ui/core/styles'
import { views, NoticesFieldNames } from '../../modules/notices'
import useStorage, { keys as storageKeys } from '../../hooks/useStorage'
import { trackAction } from '../../analytics'
import Notice from '../notice'
import { write as writeStorage } from '../../utils/storage'
import ErrorMessage from '../error-message'

const useStyles = makeStyles({
  home: {
    padding: '2rem'
  },
  notice: {
    marginBottom: '1rem'
  }
})

export default ({ isHome = false }) => {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    views.getFullNotices,
    [[NoticesFieldNames.isVisible, Operators.EQUALS, true]],
    100,
    [NoticesFieldNames.orderby, OrderDirections.ASC]
  )
  const classes = useStyles()
  const [hiddenNotices] = useStorage(storageKeys.hiddenNotices, [])

  const hideNotice = hideId => {
    writeStorage(storageKeys.hiddenNotices, hiddenNotices.concat([hideId]))
    trackAction('Global', 'Click hide notice', hideId)
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load notices</ErrorMessage>
  }

  if (isLoading || !results || !results.length) {
    return null
  }

  const filterHidden = notice => !hiddenNotices.includes(notice.hideid)

  const noticesToShow = results.filter(filterHidden)

  if (!noticesToShow.length) {
    return null
  }

  return (
    <div className={isHome ? classes.home : ''}>
      {noticesToShow.map(notice => (
        <div className={classes.notice} key={notice.id}>
          <Notice {...notice} hide={() => hideNotice(notice.hideid)} />
        </div>
      ))}
    </div>
  )
}
