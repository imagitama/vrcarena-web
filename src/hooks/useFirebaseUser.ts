import { useSelector } from 'react-redux'

// @ts-ignore
export default () => useSelector(({ firebase: { auth } }) => auth)
