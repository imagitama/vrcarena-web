import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useStorage, { keys } from '../../hooks/useStorage'
import { trackAction } from '../../analytics'
import Message from '../message'
import Button from '../button'
import './fireworks.css'

const useStyles = makeStyles({
  root: {
    position: 'relative',
    zIndex: 1
  },
  message: {
    position: 'relative'
  },
  hideBtn: {
    position: 'absolute',
    top: 0,
    right: 0
  }
})

export default ({ eventName = '', message = '' }) => {
  const [hiddenSpecialEventNames, setHiddenSpecialEventNames] = useStorage(
    keys.hiddenSpecialEventNames,
    []
  )
  const classes = useStyles()

  if (eventName && hiddenSpecialEventNames.includes(eventName)) {
    return null
  }

  const onBtnClick = () => {
    setHiddenSpecialEventNames(hiddenSpecialEventNames.concat([eventName]))
    trackAction('Global', 'Click hide fireworks button', eventName)
  }

  return (
    <>
      {message && (
        <Message className={classes.root}>
          <div className={classes.message}>
            {message}
            <div className={classes.hideBtn}>
              <Button onClick={onBtnClick}>Hide Fireworks</Button>
            </div>
          </div>
        </Message>
      )}
      <div className="fireworks">
        <div class="before" />
        <div class="after" />
      </div>
    </>
  )
}
