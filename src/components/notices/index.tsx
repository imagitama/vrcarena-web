import React from 'react'
import { makeStyles } from '@mui/styles'
import styled from '@emotion/styled'

import useDatabaseQuery, {
  OrderDirections,
  Operators,
} from '@/hooks/useDatabaseQuery'
import useNotices from '@/hooks/useNotices'
import { ViewNames, FullNotice } from '@/modules/notices'
import { mediaQueryForMobiles } from '@/media-queries'

import ErrorMessage from '@/components/error-message'
import Message from '../message'
import FormattedDate from '../formatted-date'
import Markdown from '../markdown'

const useStyles = makeStyles({
  notice: {
    marginBottom: '0.5rem',
    '&:last-child': {
      marginBottom: 0,
    },
    [mediaQueryForMobiles]: {
      marginBottom: '0.5rem',
    },
  },
})

const Date = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  opacity: 0.5;
  padding: 0.2rem 0.5rem;
`

const Notices = () => {
  const [isLoading, lastErrorCode, results] = useDatabaseQuery<FullNotice>(
    ViewNames.GetFullNotices,
    [['isvisible', Operators.EQUALS, true]],
    100,
    ['orderby', OrderDirections.ASC]
  )
  const classes = useStyles()
  const [hiddenNotices] = useNotices()

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
          <Message {...notice} hideId={notice.hideid}>
            <Markdown source={notice.message} />
            <Date>
              <small>
                <FormattedDate date={notice.createdat} />
              </small>
            </Date>
          </Message>
        </div>
      ))}
    </>
  )
}

export default Notices
