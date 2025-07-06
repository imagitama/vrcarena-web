import { CommonRecordFields } from '../data-store'
import {
  getHasPermissionForRecord,
  getHasPermissionForRoute,
} from '../permissions'
import useUserRecord from './useUserRecord'

function usePermissions(route: string): boolean
function usePermissions<TRecord extends CommonRecordFields>(
  record: TRecord
): boolean
function usePermissions<TRecord extends CommonRecordFields = never>(
  routeOrRecord: string | TRecord
): boolean {
  const [, , user] = useUserRecord()

  if (!user) {
    return false
  }

  return typeof routeOrRecord === 'string'
    ? getHasPermissionForRoute(user, routeOrRecord)
    : getHasPermissionForRecord(user, routeOrRecord)
}

export default usePermissions
