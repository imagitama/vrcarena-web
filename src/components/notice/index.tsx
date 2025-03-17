import React from 'react'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import Markdown from '../markdown'
import Chariot from '../chariot'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2, 2),
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  leftCol: {
    flexShrink: 0,
    marginRight: '1%',
    textAlign: 'center',
    fontSize: '80%',
    '& a': {
      color: 'inherit',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
  },
  chariot: {
    width: '100px',
    height: 'auto',
  },
  rightCol: {},
  header: {
    lineHeight: 1,
    marginBottom: '8px',
  },
  message: {
    marginTop: '-8px',
    '& p:last-child': {
      marginBottom: 0,
    },
  },
  hideBtn: {
    position: 'absolute',
    padding: '0.5rem',
    top: 0,
    right: 0,
    '&:hover': {
      cursor: 'pointer',
    },
  },
  username: {
    marginTop: '0.25rem',
    width: '100%',
  },
}))

export default ({
  title,
  message,
  hide,
}: {
  title: string
  message: string
  hide?: () => void
}) => {
  const classes = useStyles()

  return (
    <Paper className={classes.root}>
      <div className={classes.leftCol}>
        <Chariot className={classes.chariot} spinOnHover />
      </div>
      <div className={classes.rightCol}>
        <Typography variant="h5" component="h3" className={classes.header}>
          {title}
        </Typography>
        <div className={classes.message}>
          <Markdown source={message} />
        </div>
        {hide ? (
          <div className={classes.hideBtn} onClick={hide}>
            <CloseIcon />
          </div>
        ) : null}
      </div>
    </Paper>
  )
}
