import React, { useRef, useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import ErrorMessage from '../../components/error-message'
import Paper from '../../components/paper'
import useDataStoreItems from '../../hooks/useDataStoreItems'
import FormattedDate from '../../components/formatted-date'
import Button from '../../components/button'
import useInterval from '../../hooks/useInterval'
import useIsEditor from '../../hooks/useIsEditor'
import NoPermissionMessage from '../../components/no-permission-message'
import { callFunction } from '../../firebase'

interface ImageAtlasCell {
  id: string
  atlasidx: number
  posx: number
  posy: number
}

const atlasSize = 2000 // max width allowed by VRC
const cellSize = 500 // 500 for authors, 200 for asset thumbnails
const division = 4
const baseUrl = ''

const AssetThumbnailAtlasses = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [, lastErrorCode, results, , hydrate] =
    useDataStoreItems<ImageAtlasCell>('authorpromoatlas', undefined, {
      queryName: 'get-atlasses',
    })

  useInterval(hydrate, 2000)

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to load atlasses (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  const resultsByIndexInArray = Array.isArray(results)
    ? results.reduce<ImageAtlasCell[][]>((arr, cell) => {
        const newArr = [...arr]
        if (newArr[cell.atlasidx]) {
          newArr[cell.atlasidx].push(cell)
        } else {
          newArr[cell.atlasidx] = [cell]
        }
        return newArr
      }, [])
    : []

  return (
    <Paper>
      <Button onClick={() => setIsExpanded((currentVal) => !currentVal)}>
        Expand {Array.isArray(results) ? results.length : '-'}
        atlasses
      </Button>{' '}
      <FormattedDate date={new Date()} isRelative={false} />
      {isExpanded && (
        <>
          {resultsByIndexInArray.map((cells, atlasIdx) => (
            <div
              style={{
                width: `${atlasSize / division}px`,
                height: `${atlasSize / division}px`,
                position: 'relative',
              }}>
              <img
                style={{ width: '100%', height: '100%', display: 'block' }}
                src={`${baseUrl}/atlas-${atlasIdx}.webp?cachebreaker=${Date.now()}`}
              />
              {cells.map((cell) => (
                <div
                  style={{
                    width: `${cellSize / division}px`,
                    height: `${cellSize / division}px`,
                    position: 'absolute',
                    top: `${cell.posy / division}px`,
                    left: `${cell.posx / division}px`,
                    outline: '1px dashed red',
                    fontSize: '50%',
                    color: 'red',
                  }}>
                  {cell.id}
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </Paper>
  )
}

interface ImageAtlasQueuedItem {
  id: string
  tablename: string
  bucketname: string
  itemid: string
  imageurl: string
  width: number
  queuedat: string
}

const ImageAtlasQueue = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [, lastErrorCode, results, , hydrate] =
    useDataStoreItems<ImageAtlasQueuedItem>('imageatlasqueue', undefined, {
      queryName: 'get-queue',
      orderBy: 'queuedat',
    })

  useInterval(hydrate, 2000)

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to load image atlas queue (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  return (
    <Paper>
      <Button onClick={() => setIsExpanded((currentVal) => !currentVal)}>
        Expand {Array.isArray(results) ? results.length : '-'} queued items
      </Button>{' '}
      <FormattedDate date={new Date()} isRelative={false} />{' '}
      <Button
        onClick={async () => {
          try {
            await callFunction('manuallyActionImageAtlasQueue')
          } catch (err) {
            console.error(err)
          }
        }}>
        Action
      </Button>
      {isExpanded && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Table</TableCell>
              <TableCell>Bucket</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Width</TableCell>
              <TableCell>Queued At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(results)
              ? results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>{result.id}</TableCell>
                    <TableCell>{result.tablename}</TableCell>
                    <TableCell>{result.bucketname}</TableCell>
                    <TableCell>
                      <img src={result.imageurl} width="100" />
                    </TableCell>
                    <TableCell>{result.width}</TableCell>
                    <TableCell>
                      <FormattedDate date={result.queuedat} />
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      )}
    </Paper>
  )
}

const ImageAtlasContainer = () => {
  const isEditor = useIsEditor()

  if (!isEditor) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <AssetThumbnailAtlasses />
      <ImageAtlasQueue />
    </>
  )
}

export default ImageAtlasContainer
