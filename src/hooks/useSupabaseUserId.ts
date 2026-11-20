import { useEffect, useState } from 'react'
import { getUserId, onAuthStateChanged } from '@/auth'

export default (): string | null => {
  const [userId, setUserId] = useState(getUserId())

  // console.debug(`useSupabaseUserId`, userId)

  useEffect(() => {
    const unsub = onAuthStateChanged((isNowLoggedIn) => {
      // console.debug(`useSupabaseUserId.onAuthStateChanged`, { isNowLoggedIn })
      setUserId(isNowLoggedIn ? getUserId() : null)
    })

    return () => {
      if (unsub) {
        unsub()
      }
    }
  }, [])

  return userId
}
