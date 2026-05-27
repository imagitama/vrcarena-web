import React from 'react'
import { makeStyles } from '@mui/styles'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import InfoIcon from '@mui/icons-material/Info'

import { routes } from '@/routes'
import {
  colorAiDark,
  colorAiLight,
  colorAiVeryDark,
  VRCArenaTheme,
} from '@/themes'

import Tooltip from '@/components/tooltip'
import Link from '@/components/link'
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow,
} from '@/media-queries'

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  root: {
    position: 'relative',
    padding: '1rem',
    overflow: 'hidden',
    background: colorAiVeryDark,
    borderRadius: theme.shape.borderRadius,
    [mediaQueryForTabletsOrBelow]: {
      padding: '0.5rem',
    },
    [mediaQueryForMobiles]: {
      padding: '0.25rem',
    },
  },
  infoIconWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 100,
    padding: '0.2rem',
    color: colorAiLight,
    cursor: 'default',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'right',
    '& a': {
      color: 'inherit',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'right',
    },
  },
  bg: {
    position: 'absolute',
    opacity: 0.2,
    fontSize: '600% !important',
    bottom: 0,
    right: 0,
    color: colorAiDark,
  },
}))

const AiArea = ({
  children,
  title,
  tooltip,
  showFeatureToggle = false,
}: {
  children: React.ReactNode | React.ReactNode[]
  title: string
  tooltip: React.ReactNode | string
  showFeatureToggle?: boolean
}) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <div className={classes.infoIconWrapper}>
        <Tooltip title={<>{tooltip} Click to visit our AI policy.</>}>
          <span>
            <Link to={routes.aiPolicy}>
              <InfoIcon />
            </Link>
          </span>
        </Tooltip>
      </div>
      <AutoAwesomeIcon className={classes.bg} />
      {children}
    </div>
  )
}

export default AiArea
