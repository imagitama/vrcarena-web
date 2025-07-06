// TODO: Move to utils/users.ts

import { callFunction } from './firebase'

export const saveLastLoggedInDate = (userId: string) =>
  callFunction('onLogin', { userId })
