import { useSelector } from 'react-redux'
import { RootState } from '@/modules'
import { FirebaseUser, loggedInUser } from '@/firebase'

export default (): FirebaseUser | null => {
  // subscribe just to force a re-render
  useSelector<RootState, string | null>(({ firebase }) => firebase.userId)
  return loggedInUser
}
