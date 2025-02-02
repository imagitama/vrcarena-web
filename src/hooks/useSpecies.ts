import { useEffect, useState } from 'react'
import { readAllRecords } from '../data-store'
import { Species } from '../modules/species'
import { CollectionNames } from './useDatabaseQuery'
import useSupabaseClient from './useSupabaseClient'
import { handleError } from '../error-handling'

// storing this in memory so we assume the species list won't change very frequently
let knownSpecies: Species[] = []

export default (): [Species[], boolean, boolean, () => void] => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isErrored, setIsErrored] = useState<boolean>(false)
  const [results, setResults] = useState<Species[]>(knownSpecies)
  const supabase = useSupabaseClient()

  const hydrate = async () => {
    try {
      console.debug(`useSpecies.hydrate`)

      setIsLoading(true)
      setIsErrored(false)

      const results = await readAllRecords<Species>(
        supabase,
        CollectionNames.Species
      )
      knownSpecies = results

      setResults(knownSpecies)
      setIsLoading(false)
      setIsErrored(false)
    } catch (err) {
      console.error(err)
      handleError(err)
      setIsLoading(false)
      setIsErrored(true)
    }
  }

  useEffect(() => {
    if (!knownSpecies.length) {
      hydrate()
    }
  }, [])

  return [results, isLoading, isErrored, hydrate]
}
