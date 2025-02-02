import { SupabaseClient } from '@supabase/supabase-js'
import { createContext } from 'react'

const SupabaseClientContext = createContext<SupabaseClient | null>(null)

export default SupabaseClientContext
