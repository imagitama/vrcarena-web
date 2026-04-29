import { useContext, useEffect, useState } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'

import SupabaseClientContext from '@/contexts/SupabaseClient'
import { onJwtTokenChanged } from '@/supabase'

const useSupabaseClient = (): SupabaseClient => {
  const [, setCount] = useState(0) // force re-render
  const client = useContext(SupabaseClientContext)

  useEffect(() => {
    onJwtTokenChanged((newToken) => {
      setCount((currentCount) => currentCount + 1)
    })
  }, [])

  return client!!
}

export default useSupabaseClient
