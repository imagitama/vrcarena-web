import { useContext, useEffect, useState } from 'react'
import SupabaseClientContext from '../contexts/SupabaseClient'
import { onJwtTokenChanged } from '../supabase'
import { SupabaseClient } from '@supabase/supabase-js'

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
