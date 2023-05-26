import { useEffect, useState } from 'react'
import { handleError } from '../error-handling'
import { callFunction } from '../firebase'
import { VrchatWorld } from '../modules/vrchat-cache'

export default (worldId: string, autoHydrate = true) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isErrored, setIsErrored] = useState<boolean>(false)
  const [vrchatWorld, setVrchatWorld] = useState<VrchatWorld>()

  const hydrate = async () => {
    try {
      setIsLoading(true)
      setIsErrored(false)

      // NOTE: This function also dumps it into a cache for later retrieval
      const {
        data: { world }
      } = await callFunction('getVrchatWorldDetails', {
        worldId
      })

      setVrchatWorld(world)
      setIsLoading(false)
      setIsErrored(false)
    } catch (err) {
      setIsLoading(false)
      setIsErrored(true)

      console.error(err)
      handleError(err)
    }
  }

  useEffect(() => {
    if (!autoHydrate || !worldId) {
      return
    }
    hydrate()
  }, [worldId])

  return [isLoading, isErrored, vrchatWorld, hydrate]
}
