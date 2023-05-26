import React from 'react'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import { makeStyles } from '@material-ui/core/styles'
import Link from '../link'

const useStyles = makeStyles({
  root: {
    width: '100%',
    height: '100%'
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

const OptionalLink = ({
  to,
  children
}: {
  to?: string
  children: React.ReactNode
}) => (to ? <Link to={to}>{children}</Link> : <>{children}</>)

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
        <OptionalLink to={url}>
          <span className={classes.text}>
            {Icon}
            <span className={classes.subtext}>{label}</span>
          </span>
        </OptionalLink>
      </CardActionArea>
    </Card>
  )
}
