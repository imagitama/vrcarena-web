import React, { useState } from 'react'
import { makeStyles } from '@mui/styles'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

import Button from '@/components/button'
import TextInput from '@/components/text-input'

const useStyles = makeStyles({
  root: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  control: {
    margin: '0 0.25rem 0.25rem 0',
  },
  button: {
    minWidth: '40px !important',
  },
  selected: {
    '& > *': {
      fontWeight: 'bold !important',
    },
  },
})

const MAX_PAGES = 100

const PagesNavigation = ({
  pageCount,
  currentPageNumber,
  onClickWithPageNumber,
}: {
  pageCount: number
  currentPageNumber: number
  onClickWithPageNumber: (pageNumber: number) => void
}) => {
  const classes = useStyles()
  const [textInput, setTextInput] = useState('')

  const onGoToPage = () => {
    const newPageNumber = parseInt(textInput)
    console.debug(`go to page:`, newPageNumber)
    onClickWithPageNumber(newPageNumber)
  }

  return (
    <div className={classes.root}>
      {pageCount > MAX_PAGES || true ? (
        <>
          <div className={classes.control}>{pageCount} pages</div>

          <div className={classes.control}>
            <Button
              color="primary"
              onClick={() => onClickWithPageNumber(currentPageNumber - 1)}
              size="small"
              icon={<ChevronLeftIcon />}
              iconOnly
              className={classes.button}
              isDisabled={currentPageNumber <= 1}
            />
          </div>
          <div className={classes.control}>
            <Button
              color="secondary"
              onClick={() => onClickWithPageNumber(currentPageNumber)}
              size="small"
              className={classes.button}>
              {currentPageNumber}
            </Button>
          </div>
          <div className={classes.control}>
            <Button
              color="primary"
              onClick={() => onClickWithPageNumber(currentPageNumber + 1)}
              size="small"
              icon={<ChevronRightIcon />}
              iconOnly
              className={classes.button}
              isDisabled={currentPageNumber === pageCount}
            />
          </div>
          <div className={classes.control}>
            <TextInput
              type="number"
              inputProps={{
                min: 1,
              }}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Page number"
              onKeyDown={(e) => (e.key === 'Enter' ? onGoToPage() : undefined)}
              button={<Button onClick={() => onGoToPage()}>Go To Page</Button>}
              size="small"
            />
          </div>
        </>
      ) : (
        [...Array(pageCount)].map((item, idx) => {
          const pageNumber = idx + 1
          const isSelected = pageNumber === currentPageNumber
          return (
            <div
              className={`${classes.control} ${
                isSelected ? classes.selected : ''
              }`}
              key={idx}>
              <Button
                color={isSelected ? 'primary' : 'secondary'}
                onClick={() => onClickWithPageNumber(pageNumber)}
                size="small"
                className={classes.button}>
                {pageNumber}
              </Button>
            </div>
          )
        })
      )}
    </div>
  )
}

export default PagesNavigation
