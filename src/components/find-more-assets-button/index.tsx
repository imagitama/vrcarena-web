import React from 'react'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import { makeStyles } from '@material-ui/core/styles'
import Link from '../link'

const useStyles = makeStyles({
  root: {
    margin: '1rem 0.5rem 0.5rem'
  },
  cardActionArea: {
    height: '100%',
    '& a': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 3rem',
      height: '100%',
      color: 'inherit'
    }
  },
  text: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    fontSize: '125%'
  },
  subtext: {
    marginTop: '1rem'
  }
})

export default ({
  icon: Icon,
  label,
  onClick = undefined,
  url = undefined
}: {
  label: string
  icon?: React.ReactElement
  onClick?: () => void
  url?: string
}) => {
  const classes = useStyles()
  return (
    <Card className={classes.root}>
      <CardActionArea onClick={onClick} className={classes.cardActionArea}>
        <Link to={url}>
          <span className={classes.text}>
            {Icon}
            <span className={classes.subtext}>{label}</span>
          </span>
        </Link>
      </CardActionArea>
    </Card>
  )
}
