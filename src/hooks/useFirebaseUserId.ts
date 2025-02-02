import { useSelector } from 'react-redux'

export default (): string | null =>
  useSelector(({ firebase: { auth } }: any) => auth.uid)
