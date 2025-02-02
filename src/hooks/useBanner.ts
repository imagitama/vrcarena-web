import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setBannerUrls as setBannerUrlsAction } from '../modules/app'

export default (
  newBannerUrl?: string | null
): {
  bannerUrl: string
  setBannerUrl: (newUrl: string) => void
} => {
  const { bannerUrl } = useSelector(({ app: { bannerUrl } }: any) => ({
    bannerUrl,
  }))
  const dispatch = useDispatch()
  const setBannerUrl = (newUrl: string) =>
    dispatch(setBannerUrlsAction({ url: newUrl }))

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
