import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import FileResultItem from '../file-result-item'

const useStyles = makeStyles({
  root: { display: 'flex' },
  col: {
    flexDirection: 'column'
  }
})

export default ({ urls, isColumn = false }) => {
  const classes = useStyles()

  return (
    <div className={`${classes.root} ${isColumn ? classes.col : ''}`}>
      {urls.map(url => (
        <FileResultItem key={url} url={url} />
      ))}
    </div>
  )
}
