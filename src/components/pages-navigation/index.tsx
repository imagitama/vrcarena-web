import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '../button'

const useStyles = makeStyles({
  root: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  control: {
    margin: '0 0.25rem 0.25rem 0'
  },
  button: {
    minWidth: '40px'
  },
  selected: {
    fontWeight: 'bold'
  }
})

export default ({
  pageCount,
  currentPageNumber,
  onClickWithPageNumber
}: {
  pageCount: number
  currentPageNumber: number
  onClickWithPageNumber: (pageNumber: number) => void
}) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      {[...Array(pageCount)].map((item, idx) => {
        const pageNumber = idx + 1
        const isSelected = pageNumber === currentPageNumber
        return (
          <div
            className={`${classes.control} ${
              isSelected ? classes.selected : ''
            }`}
            key={idx}>
            <Button
              color={isSelected ? 'default' : 'primary'}
              onClick={() => onClickWithPageNumber(pageNumber)}
              size="small"
              className={classes.button}>
              {pageNumber}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
