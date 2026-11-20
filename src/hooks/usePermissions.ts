import { CommonRecordFields } from '@/data-store'
import {
  getHasPermissionForRecord,
  getHasPermissionForRoute,
} from '@/permissions'
import { routes } from '@/routes'
import useAccountVerification from './useAccountVerification'
import useSupabaseUser from './useSupabaseUser'
import useUserRecord from './useUserRecord'

function usePermissions(route: string): boolean
function usePermissions<TRecord extends CommonRecordFields>(
  record: TRecord
): boolean
function usePermissions<TRecord extends CommonRecordFields = never>(
  routeOrRecord: string | TRecord
): boolean {
  const [, , user] = useUserRecord()
  const supabaseUser = useSupabaseUser()
  const isVerified = useAccountVerification()

  if (!user || !supabaseUser) {
    return false
  }

  if (routeOrRecord !== routes.myAccount && isVerified === false) {
    return false
  }

  return typeof routeOrRecord === 'string'
    ? getHasPermissionForRoute(user, routeOrRecord)
    : getHasPermissionForRecord(user, routeOrRecord)
}

export default usePermissions
