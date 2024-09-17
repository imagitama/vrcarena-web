import { useSelector } from 'react-redux'
import { RootState } from '../modules'

export default (): string => {
  const bannerUrl = useSelector(
    ({ app: { bannerUrl } }: RootState) => bannerUrl
  )
  return bannerUrl
}
