import { useEffect, useState } from 'react'
import { onJwtTokenChanged, getUserId } from '../supabase'

export default (): string | null => {
  const [userId, setUserId] = useState(getUserId())

  useEffect(() => {
    const unsub = onJwtTokenChanged((token) => {
      setUserId(token ? getUserId() : null)
    })

    return () => {
      if (unsub) {
        unsub()
      }
    }
  }, [])

  return userId
}
