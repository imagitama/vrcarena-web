import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setBannerUrls as setBannerUrlsAction } from '../modules/app'

export default newBannerUrl => {
  const { bannerUrl } = useSelector(({ app: { bannerUrl } }) => ({
    bannerUrl
  }))
  const dispatch = useDispatch()
  const setBannerUrl = url => dispatch(setBannerUrlsAction({ url }))

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
    setBannerUrl
  }
}
