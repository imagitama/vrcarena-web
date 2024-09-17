import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setBannerUrls as setBannerUrlsAction } from '../modules/app'
import { RootState } from '../modules'

export default (newBannerUrl: string | null) => {
  const { bannerUrl } = useSelector(({ app: { bannerUrl } }: RootState) => ({
    bannerUrl,
  }))
  const dispatch = useDispatch()
  const setBannerUrl = (url: string) => dispatch(setBannerUrlsAction({ url }))

  useEffect(() => {
    if (!newBannerUrl) {
      return
    }
    setBannerUrl(newBannerUrl)

    return () => {
      setBannerUrl('')
    }
  }, [newBannerUrl])

  return {
    bannerUrl,
    setBannerUrl,
  }
}
