import { CommonRecordFields } from '../data-store'
import {
  getHasPermissionForRecord,
  getHasPermissionForRoute,
} from '../permissions'
import { routes } from '../routes'
import useFirebaseUser from './useFirebaseUser'
import useUserRecord from './useUserRecord'

function usePermissions(route: string): boolean
function usePermissions<TRecord extends CommonRecordFields>(
  record: TRecord
): boolean
function usePermissions<TRecord extends CommonRecordFields = never>(
  routeOrRecord: string | TRecord
): boolean {
  const [, , user] = useUserRecord()
  const firebaseUser = useFirebaseUser()

  if (!user || !firebaseUser) {
    return false
  }

  if (routeOrRecord !== routes.myAccount && !firebaseUser.emailVerified) {
    return false
  }

  return typeof routeOrRecord === 'string'
    ? getHasPermissionForRoute(user, routeOrRecord)
    : getHasPermissionForRecord(user, routeOrRecord)
}

export default usePermissions
