import { useEffect, useState } from 'react'
import { readAllRecords } from '../data-store'
import { handleError } from '../error-handling'
import { Species } from '../modules/species'
import { CollectionNames } from './useDatabaseQuery'

// storing this in memory so we assume the species list won't change very frequently
let knownSpecies: Species[] = []

const hydrateAllSpecies = async () => {
  try {
    const results = await readAllRecords<Species>(CollectionNames.Species)
    knownSpecies = results
  } catch (err) {
    console.error(err)
    handleError(err)
  }
}

export default (): [Species[], boolean, boolean, () => void] => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isErrored, setIsErrored] = useState<boolean>(false)
  const [results, setResults] = useState<Species[]>(knownSpecies)

  const hydrate = async () => {
    try {
      console.debug(`useSpecies.hydrate`)

      setIsLoading(true)
      setIsErrored(false)

      await hydrateAllSpecies()

      setResults(knownSpecies)
      setIsLoading(false)
      setIsErrored(false)
    } catch (err) {
      setIsLoading(false)
      setIsErrored(true)
      console.error(err)
    }
  }

  useEffect(() => {
    if (!knownSpecies.length) {
      hydrate()
    }
  }, [])

  return [results, isLoading, isErrored, hydrate]
}
