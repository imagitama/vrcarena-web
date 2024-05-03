import { useSelector } from 'react-redux'
import { RootState } from '../store'

export default (): string => {
  const bannerUrl = useSelector<RootState, string>(
    ({ app: { bannerUrl } }) => bannerUrl
  )
  return bannerUrl
}
