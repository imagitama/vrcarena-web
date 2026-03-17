import { AuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../../firebase'

export async function signinWithProvider(provider: AuthProvider) {
  const result = await signInWithPopup(auth, provider)

  const user = result.user

  console.debug('Signed in with provider', { provider, user })

  return user
}
