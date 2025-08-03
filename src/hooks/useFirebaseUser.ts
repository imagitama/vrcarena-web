import { useSelector } from 'react-redux'
import { RootState } from '../modules'
import { FirebaseUser } from '../firebase'

export default (): FirebaseUser | null =>
  useSelector<RootState, FirebaseUser | null>(({ firebase }) => firebase.user)
