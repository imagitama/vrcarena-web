import { useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { loggedInUser, onAuthStateChanged } from '@/auth'

export default (): SupabaseUser | null => {
  const [user, setUser] = useState(loggedInUser)

  // console.debug(`useSupabaseUserId`, userId)

  useEffect(() => {
    const unsub = onAuthStateChanged((isNowLoggedIn) => {
      // console.debug(`useSupabaseUserId.onAuthStateChanged`, { isNowLoggedIn })
      setUser(isNowLoggedIn ? loggedInUser : null)
    })

    return () => {
      if (unsub) {
        unsub()
      }
    }
  }, [])

  return user
}
