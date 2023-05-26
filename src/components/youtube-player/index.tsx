import React from 'react'
import YouTubePlayer from 'react-player/youtube'

export default ({
  url,
  onPlay = undefined,
  width = undefined,
  height = undefined
}: {
  url: string
  onPlay?: () => void
  width?: string
  height?: string
}) => <YouTubePlayer url={url} onPlay={onPlay} width={width} height={height} />
