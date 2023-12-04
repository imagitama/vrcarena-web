import { useEffect, useRef, useState } from 'react'
import { AutocompleteOption } from '../components/autocomplete-input'
import { simpleSearchRecords } from '../data-store'
import { handleError } from '../error-handling'
import { CollectionNames, User } from '../modules/users'

const useUserTagging = (
  internalText: string
): [
  AutocompleteOption<string>[] | null,
  boolean,
  number,
  () => void,
  () => void
] => {
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<User[] | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const [atSymbolIndex, setAtSymbolIndex] = useState(-1)

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    },
    []
  )

  useEffect(() => {
    if (atSymbolIndex === -1) {
      return
    }
    if (internalText.charAt(atSymbolIndex) !== '@') {
      console.debug(
        `@ symbol at ${atSymbolIndex} no longer there - quitting mentioning`
      )
      setAtSymbolIndex(-1)
    }
  }, [internalText])

  const userNowWantsToTag = internalText.endsWith('@')

  useEffect(() => {
    if (!userNowWantsToTag) {
      return
    }

    const newAtSymbolIndex = internalText.length - 1

    console.debug(
      `########################  @ symbol is at index ${newAtSymbolIndex}`
    )

    setAtSymbolIndex(newAtSymbolIndex)
  }, [userNowWantsToTag])

  console.debug(`useUserMentioning`, atSymbolIndex, internalText)

  useEffect(() => {
    if (atSymbolIndex === -1) {
      return
    }

    if (internalText === '') {
      setAtSymbolIndex(-1)
      return
    }

    ;(() => {
      const searchTerm = internalText.substring(atSymbolIndex + 1)

      console.debug(`Search term "${searchTerm}"`)

      performSearch(searchTerm)
    })()
  }, [atSymbolIndex, internalText])

  const performSearch = async (searchTerm: string) => {
    try {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      await new Promise((resolve) => {
        timeoutRef.current = setTimeout(resolve, 250)
      })

      if (searchTerm === '') {
        console.warn('No search term - ignoring')
        return
      }

      if (searchTerm.length < 3) {
        console.warn('Search term too short - ignoring')
        return
      }

      setIsLoading(true)

      const newUsers = await simpleSearchRecords<User>(
        CollectionNames.Users,
        {
          username: `%${searchTerm}%`,
        },
        5,
        'username'
      )

      if (newUsers === null) {
        throw new Error('Search returned null results')
      }

      console.debug(`Found ${newUsers.length} users`)

      setUsers(newUsers)
      setIsLoading(false)
    } catch (err) {
      console.error(err)
      handleError(err)
      setIsLoading(false)
    }
  }

  const clearSuggestions = () => setUsers(null)

  const stopMentioningAndClear = () => {
    clearSuggestions()
    setAtSymbolIndex(-1)
  }

  const results =
    users !== null
      ? users.map((user) => ({
          label: user.username,
          data: user.id,
        }))
      : users

  return [
    results,
    isLoading,
    atSymbolIndex,
    clearSuggestions,
    stopMentioningAndClear,
  ]
}

export default useUserTagging
