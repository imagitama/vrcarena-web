import { useSelector } from 'react-redux'

export default () => useSelector(({ firebase: { auth } }) => auth.uid)
