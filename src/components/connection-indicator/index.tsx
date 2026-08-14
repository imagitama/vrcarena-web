import styled from '@emotion/styled'
import CircleIcon from '@mui/icons-material/Circle'

import { colorPalette } from '@/config'
import { colorGreyedOut } from '@/themes'
import { DataStoreErrorCode } from '@/data-store'

export enum ConnectionStatus {
  Connected,
  Connecting,
  Failed,
  Idle,
}

export const getConnectionLabel = (
  status: ConnectionStatus,
  lastErrorCode?: string | null
): string => {
  if (lastErrorCode !== null && lastErrorCode !== undefined)
    return lastErrorCode
  switch (status) {
    case ConnectionStatus.Connected:
      return 'Live Updates Enabled!'
    case ConnectionStatus.Connecting:
      return 'Connecting...'
    case ConnectionStatus.Failed:
      return 'Failed To Connect'
    case ConnectionStatus.Idle:
      return 'Disconnected'
    default:
      throw new Error(`Unknown status "${status}"`)
  }
}

export const getConnectionStatusFromHookResult = (
  isSubscribing: boolean,
  isSubscribed: boolean,
  lastErrorCode: DataStoreErrorCode | null
): ConnectionStatus => {
  if (isSubscribed) return ConnectionStatus.Connected
  if (isSubscribing) return ConnectionStatus.Connecting
  if (lastErrorCode !== null) return ConnectionStatus.Failed
  return ConnectionStatus.Idle
}

const ConnectionIndicator = styled(CircleIcon)`
  font-size: 50% !important;
  color: ${({ status }: { status: ConnectionStatus | null }) =>
    status === ConnectionStatus.Connected
      ? colorPalette.positive
      : status === ConnectionStatus.Failed
      ? colorPalette.negative
      : status === ConnectionStatus.Connecting
      ? colorPalette.warning
      : colorGreyedOut};
`

export default ConnectionIndicator
