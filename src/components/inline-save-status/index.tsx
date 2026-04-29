import React, { useEffect, useRef, useState } from 'react'
import { makeStyles } from '@mui/styles'

import { DataStoreErrorCode } from '@/data-store'
import MiniLoadingIndicator from '@/components/mini-loading-indicator'
import { colorPalette } from '@/config'

const useStyles = makeStyles({
  root: {
    paddingLeft: '0.5rem',
    cursor: 'default',
    fontWeight: 'bold',
  },
  success: {
    color: colorPalette.positive,
  },
  hasErrorCode: {
    color: colorPalette.negative,
  },
})

const InlineSaveStatus = <TErrorCode,>({
  isSaving,
  isSavingSuccess,
  lastErrorCode,
  clear,
}: {
  isSaving: boolean
  isSavingSuccess: boolean
  lastErrorCode: DataStoreErrorCode | null
  clear?: () => void
}) => {
  const classes = useStyles()
  const intervalRef = useRef<NodeJS.Timeout>()
  const [count, setCount] = useState<null | number>(null)

  useEffect(() => {
    if (!isSavingSuccess || !clear) {
      return
    }

    setCount(5)

    intervalRef.current = setInterval(() => {
      setCount((currentVal) => {
        if (currentVal === null) {
          return currentVal
        }

        const newVal = currentVal - 1

        if (newVal < 1) {
          clear()

          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }

          return null
        }

        return newVal
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isSavingSuccess])

  return (
    <span
      className={`${classes.root} ${isSavingSuccess ? classes.success : ''} ${
        lastErrorCode !== null ? classes.hasErrorCode : ''
      }`}>
      {' '}
      {isSaving ? (
        <MiniLoadingIndicator>Saving...</MiniLoadingIndicator>
      ) : isSavingSuccess ? (
        <>Saved{count !== null ? '.'.repeat(count) : ''}!</>
      ) : lastErrorCode !== null ? (
        <>Failed to save (code {lastErrorCode})</>
      ) : null}
    </span>
  )
}

export default InlineSaveStatus
