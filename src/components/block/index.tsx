import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LazyLoad from 'react-lazyload'
import LoadingIndicator from '../loading-indicator'
import Link from '../link'

const useStyles = makeStyles((theme) => ({
  root: {
    border: `1px solid ${theme.palette.background.paper}`,
    borderRadius: theme.shape.borderRadius,
    padding: '1rem',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '150%',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    '& a': {
      color: 'inherit',
      display: 'flex',
      alignItems: 'center',
    },
    '&:hover $icon': {
      opacity: 1,
    },
  },
  icon: {
    opacity: 0,
    transition: 'all 100ms',
    marginLeft: '0.5rem',
    display: 'flex',
    alignItems: 'center',
  },
}))

const Block = ({
  title,
  children,
  url,
  icon: Icon,
}: {
  title?: string
  children: React.ReactNode
  url?: string
  icon?: React.ReactElement
}) => {
  const classes = useStyles()

  const titleToRender = (
    <>
      <span>{title}</span>
      {Icon && <span className={classes.icon}>{Icon}</span>}
    </>
  )

  return (
    <LazyLoad height={300} placeholder={<LoadingIndicator />}>
      <div className={classes.root}>
        <div className={classes.title}>
          {url ? <Link to={url}>{titleToRender}</Link> : titleToRender}
        </div>
        {children}
      </div>
    </LazyLoad>
  )
}

export default Block
