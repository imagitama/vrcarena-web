import { useEffect, useRef, useState } from 'react'
import { makeStyles } from '@mui/styles'

import {
  CollectionNames,
  WhiteboardDot,
  WhiteboardDotFields,
} from '@/modules/whiteboard'

import useDataStoreItems from '@/hooks/useDataStoreItems'
import useDataStoreItemsSync from '@/hooks/useDataStoreItemsSync'

import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import useDataStoreCreate from '@/hooks/useDataStoreCreate'
import ColorPickerButton, { Color, PURE_WHITE } from '../color-picker-button'
import useStorage from '@/hooks/useStorage'
import useUserId from '@/hooks/useUserId'
import CheckboxInput from '../checkbox-input'
import Button from '../button'
import useDataStoreItem from '@/hooks/useDataStoreItem'
import { User, CollectionNames as UsersCollectionNames } from '@/modules/users'
import WarningMessage from '../warning-message'
import { insertRecords, deleteRecordsByUser } from '@/data-store'
import useSupabaseClient from '@/hooks/useSupabaseClient'
import { FormControl } from '@mui/material'
import FormControls from '../form-controls'

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

const CANVAS_WIDTH = 256
const CANVAS_HEIGHT = 256

const render = (canvas: HTMLCanvasElement, dots: WhiteboardDot[]): void => {
  console.debug(`render`, { canvas, dots })

  const ctx = canvas.getContext('2d')
  ctx!.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  const imageData = ctx!.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT)
  const data = imageData.data

  for (const { x, y, r, g, b, a } of dots) {
    if (x < 0 || x >= CANVAS_WIDTH || y < 0 || y >= CANVAS_HEIGHT) continue
    const idx = (y * CANVAS_WIDTH + x) * 4
    data[idx] = r
    data[idx + 1] = g
    data[idx + 2] = b
    data[idx + 3] = Math.round(a * 255)
  }

  ctx!.putImageData(imageData, 0, 0)
}

const renderNewDot = (
  canvas: HTMLCanvasElement,
  { x, y, r, g, b, a }: WhiteboardDotFields
) => {
  console.debug(`renderNewDot`, { canvas, dot: { x, y, r, g, b, a } })

  const ctx = canvas.getContext('2d')
  const imageData = ctx!.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  const data = imageData.data

  const idx = (y * CANVAS_WIDTH + x) * 4
  data[idx] = r
  data[idx + 1] = g
  data[idx + 2] = b
  data[idx + 3] = Math.round(a * 255)

  ctx!.putImageData(imageData, 0, 0)
}

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

function bresenham(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  cb: (x: number, y: number) => void
) {
  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx - dy

  while (true) {
    cb(x0, y0)
    if (x0 === x1 && y0 === y1) break
    const e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x0 += sx
    }
    if (e2 < dx) {
      err += dx
      y0 += sy
    }
  }
}

function getCanvasCoords(canvas: HTMLCanvasElement, e: MouseEvent) {
  const scaleX = canvas.width / canvas.offsetWidth
  const scaleY = canvas.height / canvas.offsetHeight
  return {
    x: Math.floor(e.offsetX * scaleX),
    y: Math.floor(e.offsetY * scaleY),
  }
}

const Whiteboard = () => {
  const classes = useStyles()
  const [isLoading, lastErrorCode, dots, , hydrate] =
    useDataStoreItems<WhiteboardDot>(CollectionNames.Whiteboard, undefined, {
      limit: Number.MAX_SAFE_INTEGER,
    })
  const myUserId = useUserId()
  const [isLoadingSync, lastErrorCodeSync, newDots] =
    useDataStoreItemsSync<WhiteboardDot>(CollectionNames.Whiteboard, {
      onRecordReplacement: (newDot) => {
        const canvas = canvasRef.current
        if (canvas === null) return
        if (newDot.createdby === myUserId) return
        renderNewDot(canvas, newDot)
      },
    })
  const [, , , createDot] = useDataStoreCreate<WhiteboardDot>(
    CollectionNames.Whiteboard
  )
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [persistedData, setPersistedData] = useStorage<StorageValue>(KEY_COLOR)
  const newColorRgbaRef = useRef<Color>(
    persistedData ? persistedData.color : PURE_WHITE
  )
  const [enabledUserIds, setEnabledUserIds] = useState<string[] | false>(false)
  const [isAttemptingClear, setIsAttemptingClear] = useState(false)

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
    let queuedDots: WhiteboardDotFields[] = []

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
        const newDot: WhiteboardDotFields = {
          x,
          y,
          r: newColorRgbaRef.current.r,
          g: newColorRgbaRef.current.g,
          b: newColorRgbaRef.current.b,
          a: newColorRgbaRef.current.a,
        }
        queuedDots.push(newDot)
        renderNewDot(canvas, newDot)
      })
      lastX = x
      lastY = y
    }
    canvas.addEventListener('mousemove', onMouseMove)

    const createQueuedDots = async () => {
      console.debug(`creating queued dots...`)

      await insertRecords(
        supabaseClient,
        CollectionNames.Whiteboard,
        queuedDots
      )

      console.debug('created dots!')
      queuedDots = []
    }

    const onMouseUp = () => {
      isDrawing = false
      createQueuedDots()
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
  }, [Array.isArray(dots), isLoading])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return

    if (!Array.isArray(dots)) return

    let dotsToUse = dots

    if (enabledUserIds !== false)
      dotsToUse = dotsToUse.filter((dot) =>
        enabledUserIds.includes(dot.createdby)
      )

    render(canvas, dotsToUse)
  }, [Array.isArray(dots) ? dots.length : null, isLoading])

  const userIds = Array.isArray(dots)
    ? dots.reduce<string[]>(
        (userIds, dot) =>
          userIds.includes(dot.createdby)
            ? userIds
            : userIds.concat([dot.createdby]),
        []
      )
    : []

  const supabaseClient = useSupabaseClient()

  const clearMyPen = async () => {
    console.debug('clearing my pen...')

    await deleteRecordsByUser(
      supabaseClient,
      CollectionNames.Whiteboard,
      myUserId!
    )

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
      {!Array.isArray(dots) && <LoadingIndicator message="Loading dots..." />}
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
                ? []
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
          <br />
          <br />
          <strong>
            Other people must refresh their page to unsee your pen!
          </strong>
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
