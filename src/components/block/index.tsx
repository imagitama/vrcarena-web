import React from 'react'
import { makeStyles } from '@mui/styles'
import LazyLoad from 'react-lazyload'
import Link from '@/components/link'
import { getIsUrlAbsolute } from '@/utils'
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow,
} from '@/media-queries'
import ErrorBoundary from '@/components/error-boundary'
import { VRCArenaTheme } from '@/themes'

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  root: {
    padding: '1rem',
    marginBottom: '1rem',
    // backgroundColor: '#282828', // when rendered inside ExperimentalArea dont want big areas of green
    [mediaQueryForTabletsOrBelow]: {
      padding: '0.5rem',
    },
    [mediaQueryForMobiles]: {
      padding: '0.25rem',
    },
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    flex: '1 0 auto',
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
  border: {
    borderTop: `1px solid rgba(255,255,255,0.25)`,
    width: '100%',
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
          <div className={classes.titleWrapper}>
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
            <div className={classes.border} />
          </div>
          {children}
        </div>
      </LazyLoad>
    </ErrorBoundary>
  )
}

export default Block
