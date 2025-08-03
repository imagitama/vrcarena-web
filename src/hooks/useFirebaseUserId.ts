import useFirebaseUser from './useFirebaseUser'

export default (): string | null => useFirebaseUser()?.uid || null
