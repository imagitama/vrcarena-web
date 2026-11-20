import { useContext } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'

import SupabaseClientContext from '@/contexts/SupabaseClient'

const useSupabaseClient = (): SupabaseClient => {
  const client = useContext(SupabaseClientContext)
  return client!!
}

export default useSupabaseClient
