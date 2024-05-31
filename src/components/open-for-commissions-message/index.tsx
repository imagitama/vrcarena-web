import React from 'react'
import Markdown from '../markdown'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn'

import Button from '../button'
import * as routes from '../../routes'
import { trackAction } from '../../analytics'

const useStyles = makeStyles({
  root: {
    margin: '1rem 0',
    padding: '1rem 1rem 0',
  },
  withButton: {
    display: 'flex',
  },
  heading: {
    width: '100%',
    fontSize: '150%',
    fontWeight: 100,
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: '0.5rem',
  },
  info: {
    padding: '1rem',
    '& p:first-child': {
      marginTop: 0,
    },
    '& p:last-child': {
      marginBottom: 0,
    },
  },
})

export default ({
  info,
  showViewAuthorButton,
  authorId,
  analyticsCategory,
}: {
  info: string
  showViewAuthorButton?: boolean
  authorId: string
  analyticsCategory?: string
}) => {
  const classes = useStyles()
  return (
    <Paper
      className={`${classes.root} ${
        showViewAuthorButton ? classes.withButton : ''
      }`}>
      <div className={classes.heading}>
        <MonetizationOnIcon className={classes.icon} /> This author is open for
        commissions
      </div>
      {info && (
        <div className={classes.info}>
          <Markdown source={info} />
        </div>
      )}
      {showViewAuthorButton && (
        <Button
          url={routes.viewAuthorWithVar.replace(':authorId', authorId)}
          onClick={
            analyticsCategory
              ? () =>
                  trackAction(
                    analyticsCategory,
                    'Click view details for author commissions',
                    authorId
                  )
              : undefined
          }>
          View Details
        </Button>
      )}
    </Paper>
  )
}
