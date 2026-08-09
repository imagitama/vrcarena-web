import React from 'react'
import { makeStyles } from '@mui/styles'
import { mediaQueryForMobiles } from '@/media-queries'

const useStyles = makeStyles({
  root: (props: Pick<ColumnsProps, 'oneHundredPercentMediaQuery'>) => ({
    display: 'flex',
    flexWrap: 'wrap', // mobile
    '& > *': {
      flex: '1 1 50%',
      minWidth: 0,
      [props.oneHundredPercentMediaQuery || mediaQueryForMobiles]: {
        width: '100% !important',
        flex: '1 1 100%',
      },
    },
  }),
  withPadding: {
    padding: '0.5rem',
  },
})

interface ColumnsProps {
  children: React.ReactNode
  oneHundredPercentMediaQuery?: string
  padding?: boolean
}

const Columns = ({ children, padding = false, ...props }: ColumnsProps) => {
  const classes = useStyles(props)
  return (
    <div className={`${classes.root} ${padding ? classes.withPadding : ''}`}>
      {children}
    </div>
  )
}

export default Columns
