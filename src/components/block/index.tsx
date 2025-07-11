import React from 'react'
import { makeStyles } from '@mui/styles'
import LazyLoad from 'react-lazyload'
import Link from '../link'
import { getIsUrlAbsolute } from '../../utils'
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow,
} from '../../media-queries'
import ErrorBoundary from '../error-boundary'
import { VRCArenaTheme } from '../../themes'

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  root: {
    border: `1px solid ${theme.palette.background.paper}`,
    borderRadius: theme.shape.borderRadius,
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: '#282828', // when rendered inside ExperimentalArea dont want big areas of green
    [mediaQueryForTabletsOrBelow]: {
      padding: '0.5rem',
    },
    [mediaQueryForMobiles]: {
      padding: '0.25rem',
    },
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
    [mediaQueryForMobiles]: {
      padding: '0.25rem',
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
  className,
}: {
  title?: string
  children: React.ReactNode
  url?: string
  icon?: React.ReactElement
  className?: string
}) => {
  const classes = useStyles()

  const titleToRender = (
    <>
      <span>{title}</span>
      {Icon && <span className={classes.icon}>{Icon}</span>}
    </>
  )

  return (
    <ErrorBoundary>
      <LazyLoad>
        <div className={`${classes.root} ${className}`}>
          <div className={classes.title}>
            {url ? (
              getIsUrlAbsolute(url) ? (
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {titleToRender}
                </a>
              ) : (
                <Link to={url}>{titleToRender}</Link>
              )
            ) : (
              titleToRender
            )}
          </div>
          {children}
        </div>
      </LazyLoad>
    </ErrorBoundary>
  )
}

export default Block
