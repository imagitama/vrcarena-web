import { useSelector } from 'react-redux'
import { RootState } from '../modules'
import { FirebaseReducer } from 'react-redux-firebase'
import { FirebaseUser } from '../firebase'

export default (): FirebaseUser =>
  useSelector<RootState, FirebaseReducer.AuthState>(
    ({ firebase: { auth } }) => auth
  )
