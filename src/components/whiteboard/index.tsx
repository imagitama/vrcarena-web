import { useEffect, useRef, useState } from 'react'
import { makeStyles } from '@mui/styles'

import {
  CollectionNames,
  WhiteboardDot,
  WhiteboardRecordForUser,
} from '@/modules/whiteboard'

import useDataStoreItems from '@/hooks/useDataStoreItems'
import useDataStoreItemsSync from '@/hooks/useDataStoreItemsSync'

import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import ColorPickerButton, { Color, PURE_WHITE } from '../color-picker-button'
import useStorage from '@/hooks/useStorage'
import useUserId from '@/hooks/useUserId'
import CheckboxInput from '../checkbox-input'
import Button from '../button'
import useDataStoreItem from '@/hooks/useDataStoreItem'
import { User, CollectionNames as UsersCollectionNames } from '@/modules/users'
import WarningMessage from '../warning-message'
import FormControls from '../form-controls'
import useDataStoreEditOrCreate from '@/hooks/useDataStoreEditOrCreate'
import {
  bresenham,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  getCanvasCoords,
  getColorFromStr,
  render,
  renderNewDot,
  renderNewDots,
} from './utils'

const useStyles = makeStyles({
  root: {
    position: 'relative',
    '& canvas': {
      display: 'block',
      width: '100%',
      imageRendering: 'pixelated', // improve rendering
      background: '#000',
    },
  },
  canvasWrapper: { position: 'relative' },
  loadingIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '5px',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
})

const KEY_COLOR = 'whiteboard'

interface StorageValue {
  color: Color
}

type CheckboxInputProps = React.ComponentProps<typeof CheckboxInput>
const UsernameCheckbox = ({
  userId,
  ...checkboxProps
}: { userId: string } & CheckboxInputProps) => {
  const [, , user] = useDataStoreItem<User>(UsersCollectionNames.Users, userId)
  const myUserId = useUserId()
  return (
    <CheckboxInput
      key={userId}
      label={
        user ? (user.id === myUserId ? '(my pen)' : user.username) : 'loading'
      }
      {...checkboxProps}
    />
  )
}

let lastX: number | null = null
let lastY: number | null = null

/**
 * Each user gets their own record in the whiteboard table.
 * Renders ALL dots once on load.
 * Then uses Supabase's realtime API to subscribe to INSERTs and UPDATEs on the table,
 * and adds new dots (or forces a re-render on clear).
 *
 * TODO:
 * - do not store every single pixel ever: replace existing dots instead
 *    -> change each item in dots array to correspond to a coordinate
 */
const Whiteboard = () => {
  const classes = useStyles()
  const [isLoading, lastErrorCode, whiteboardRecordsForUsers, , hydrate] =
    useDataStoreItems<WhiteboardRecordForUser>(
      CollectionNames.Whiteboard,
      undefined
    )
  const myUserId = useUserId()!

  const myRecord =
    whiteboardRecordsForUsers?.find((record) => record.id === myUserId) || null
  const myDots = myRecord ? myRecord.dots : []

  const [isLoadingSync, isSubscribing, lastErrorCodeSync, newDots] =
    useDataStoreItemsSync<WhiteboardRecordForUser>(CollectionNames.Whiteboard, {
      onUpdateInstead: (updatedRecord) => {
        const canvas = canvasRef.current
        if (canvas === null) return
        if (updatedRecord.id === myUserId) return

        if (updatedRecord.dots.length === 0) {
          hydrate()
        } else {
          const existingDots =
            whiteboardRecordsForUsers?.find(
              (record) => record.id === updatedRecord.id
            )?.dots || null
          const newDots =
            existingDots !== null
              ? updatedRecord.dots.slice(existingDots.length)
              : updatedRecord.dots

          renderNewDots(canvas, newDots)
        }
      },
      onInsertInstead: (newRecord) => {
        const canvas = canvasRef.current
        if (canvas === null) return
        if (newRecord.id === myUserId) return

        hydrate()
      },
    })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [persistedData, setPersistedData] = useStorage<StorageValue>(KEY_COLOR)
  const newColorRgbaRef = useRef<Color>(
    persistedData ? persistedData.color : getColorFromStr(myUserId)
  )
  const [enabledUserIds, setEnabledUserIds] = useState<string[] | false>(false)
  const [isAttemptingClear, setIsAttemptingClear] = useState(false)
  const [isSaving, isSuccess, lastErrorCodeSaving, save] =
    useDataStoreEditOrCreate<WhiteboardRecordForUser>(
      CollectionNames.Whiteboard,
      myUserId
    )

  const onColorPicked = (newRgba: Color) => {
    newColorRgbaRef.current = newRgba
    setPersistedData({ color: newRgba })
  }

  useEffect(() => {
    if (!enabledUserIds) return

    hydrate() // triggers re-render
  }, [JSON.stringify(enabledUserIds)])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return

    let isDrawing = false

    const onMouseDown = (e: MouseEvent) => {
      isDrawing = true
      const { x, y } = getCanvasCoords(canvas, e)
      lastX = x
      lastY = y
      onMouseMove(e)
    }
    canvas.addEventListener('mousedown', onMouseDown)

    const onMouseMove = (e: MouseEvent) => {
      if (!isDrawing) return

      const { x, y } = getCanvasCoords(canvas, e)

      bresenham(lastX!, lastY!, x, y, (x, y) => {
        const newDot: WhiteboardDot = {
          x,
          y,
          r: newColorRgbaRef.current.r,
          g: newColorRgbaRef.current.g,
          b: newColorRgbaRef.current.b,
          a: newColorRgbaRef.current.a,
          t: Date.now(),
        }
        myDots.push(newDot)
        renderNewDot(canvas, newDot)
      })
      lastX = x
      lastY = y
    }
    canvas.addEventListener('mousemove', onMouseMove)

    const onMouseUp = () => {
      isDrawing = false

      save({
        dots: myDots,
        lastmodifiedat: new Date().toISOString(),
        lastmodifiedby: myUserId,
      })
    }
    canvas.addEventListener('mouseup', onMouseUp)

    const onMouseLeave = () => {
      isDrawing = false
    }
    canvas.addEventListener('mouseleave', onMouseLeave)

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown)
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseup', onMouseUp)
      canvas.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [Array.isArray(whiteboardRecordsForUsers), isLoading])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return

    if (!Array.isArray(whiteboardRecordsForUsers)) return

    let recordsToUse = whiteboardRecordsForUsers

    if (enabledUserIds !== false)
      recordsToUse = recordsToUse.filter((record) =>
        enabledUserIds.includes(record.id)
      )

    const dotsToRender = recordsToUse.reduce<WhiteboardDot[]>(
      (dots, record) => dots.concat(record.dots),
      []
    )

    dotsToRender.sort((a, b) => (a.t ?? -Infinity) - (b.t ?? -Infinity)) // do infinity stuff to handle old dots without timestamp

    render(canvas, dotsToRender)
  }, [
    Array.isArray(whiteboardRecordsForUsers)
      ? whiteboardRecordsForUsers.length
      : null,
    isLoading,
  ])

  const userIds = Array.isArray(whiteboardRecordsForUsers)
    ? whiteboardRecordsForUsers.reduce<string[]>(
        (userIds, record) =>
          userIds.includes(record.id) ? userIds : userIds.concat([record.id]),
        []
      )
    : []

  const clearMyPen = async () => {
    console.debug('clearing my pen...')

    await save({
      dots: [],
    })

    hydrate()
  }

  return (
    <div className={classes.root}>
      <div className={classes.canvasWrapper}>
        {isLoading && <div className={classes.loadingIndicator} />}
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
      </div>
      {isLoadingSync && <LoadingIndicator message="Subscribing to dots..." />}
      {lastErrorCode !== null && (
        <ErrorMessage>Failed to load dots (code {lastErrorCode})</ErrorMessage>
      )}
      {lastErrorCodeSync !== null && (
        <ErrorMessage>
          Failed to subscribe to dots (code {lastErrorCodeSync})
        </ErrorMessage>
      )}
      {!Array.isArray(whiteboardRecordsForUsers) && (
        <LoadingIndicator message="Loading dots..." />
      )}
      {!Array.isArray(newDots) && (
        <LoadingIndicator message="Loading subscribed dots..." />
      )}
      <ColorPickerButton
        initialValue={newColorRgbaRef.current}
        onDone={onColorPicked}
      />
      <br />
      Show:
      {userIds.map((userId) => (
        <UsernameCheckbox
          key={userId}
          userId={userId}
          // checkbox props
          value={
            enabledUserIds === false ? true : enabledUserIds.includes(userId)
          }
          onChange={(newVal) =>
            setEnabledUserIds((currentIds) =>
              currentIds === false
                ? userIds.filter((id) => id !== userId)
                : newVal
                ? currentIds.concat([userId])
                : currentIds.filter((id) => id !== userId)
            )
          }
        />
      ))}
      <Button
        onClick={() => setEnabledUserIds(false)}
        color="secondary"
        size="small">
        Show All
      </Button>
      {isAttemptingClear && (
        <WarningMessage>
          Are you sure you want to clear your pen?
          <FormControls>
            <Button
              onClick={() => {
                clearMyPen()
                setIsAttemptingClear(false)
              }}>
              Clear
            </Button>{' '}
            <Button
              color="secondary"
              onClick={() => setIsAttemptingClear(false)}>
              Cancel
            </Button>
          </FormControls>
        </WarningMessage>
      )}
      <Button
        onClick={() => setIsAttemptingClear(true)}
        color="secondary"
        size="small">
        Clear My Pen
      </Button>
    </div>
  )
}

export default Whiteboard
