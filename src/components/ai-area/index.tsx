import React from 'react'
import { makeStyles } from '@mui/styles'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import Tooltip from '../tooltip'
import Link from '../link'
import { routes } from '@/routes'
import { colorAiDark, colorAiLight } from '@/themes'

const useStyles = makeStyles({
  root: {
    position: 'relative',
  },
  box: {
    padding: '1rem',
    border: `1px dashed ${colorAiLight}`,
    position: 'relative',
    overflow: 'hidden',
  },
  title: {
    fontWeight: 'bold',
    fontSize: '75%',
    color: colorAiLight,
    marginTop: '0.1rem',
    cursor: 'default',
    '& svg': {
      marginRight: '0.2rem',
    },
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
})

const AiArea = ({
  children,
  title,
  tooltip,
}: {
  children: React.ReactNode | React.ReactNode[]
  title: string
  tooltip: React.ReactNode | string
}) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <div className={classes.box}>
        <AutoAwesomeIcon className={classes.bg} />
        {children}
      </div>
      <div className={classes.title}>
        <Tooltip title={<>{tooltip} Click the text to visit our AI policy.</>}>
          <span>
            <Link to={routes.aiPolicy}>
              <AutoAwesomeIcon /> {title}
            </Link>
          </span>
        </Tooltip>
      </div>
    </div>
  )
}

export default AiArea
