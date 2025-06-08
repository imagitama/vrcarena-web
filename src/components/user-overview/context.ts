import { createContext } from 'react'
import { User } from '../../modules/users'

const context = createContext<{ userId: string, user: User }>(undefined as any)

export default context
