import React, { useState } from 'react'
import { TaxonomyItem } from '../../taxonomy'
import SearchInput from '../search-input'
import TextInput from '../text-input'

interface GbifSearchResult {
  usageKey: number
  canonicalName: string
  scientificName: string
  rank: string // all caps
  kingdom: string
  phylum: string
  order: string
  family: string
  genus: string
  class: string
  kingdomKey: number
  phylumKey: number
  classKey: number
  orderKey: number
  familyKey: number
  genusKey: number
}

interface ApiNinjaSearchResult {
  name: string
  taxonomy: {
    kingdom: string
    phylum: string
    class: string
    order: string
    family: string
    genus: string
    scientific_name: string
  }
  locations: string[]
  characteristics: {
    common_name: string
    slogan: string
  }
}

// const mapSearchResultToItem = (searchResult: SearchResult): TaxonomyItem => ({
//   id: searchResult.scientificName.toLowerCase(),
//   parent: '',
//   rank: searchResult.rank,
//   scientificName: searchResult.scientificName,
//   canonicalName: searchResult.canonicalName,
//   description: '',
//   thumbnailUrl: '',
//   metadata: {}
// })

const mapSearchResultToItem = (
  searchResult: ApiNinjaSearchResult
): TaxonomyItem => ({
  id: searchResult.name.toLowerCase(),
  parent: '',
  rank: 'species',
  scientificName: searchResult.taxonomy.scientific_name,
  canonicalName: searchResult.characteristics.common_name,
  description: '',
  thumbnailUrl: '',
  metadata: {},
  children: []
})

const apiKey = ''

// const searchForThing = async (searchTerm: string): Promise<Item[]> => {
//   const url = `https://api.gbif.org/v1/species/match?name=${searchTerm}`

//   const response = await fetch(url, {
//     method: 'GET'
//   })

//   if (!response.ok) {
//     const text = await response.text()
//     throw new Error(
//       `Response not OK: ${response.status} ${response.statusText}\n${text}`
//     )
//   }

//   const result = await response.json()

//   console.debug(result)

//   if (result.matchType === 'NONE') {
//     throw new Error(`Response invalid:\n${JSON.stringify(result, null, '  ')}`)
//   }

//   const items = [mapSearchResultToItem(result)]

//   return items
// }

const searchForThing = async (searchTerm: string): Promise<TaxonomyItem[]> => {
  const url = `https://api.api-ninjas.com/v1/animals?name=${searchTerm}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Api-Key': apiKey
    }
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(
      `Response not OK: ${response.status} ${response.statusText}\n${text}`
    )
  }

  const results = await response.json()

  // console.debug(result)

  // if (result.matchType === 'NONE') {
  //   throw new Error(`Response invalid:\n${JSON.stringify(result, null, '  ')}`)
  // }

  const items = results.map(mapSearchResultToItem)

  return items
}

export default () => {
  const [results, setResults] = useState<TaxonomyItem[]>([])

  const performSearch = async (userInput: string) => {
    try {
      const newResults = await searchForThing(userInput)
      setResults(newResults)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      Lookup thing: <SearchInput performSearch={performSearch} />
      <hr />
      Results:
      <TextInput
        value={JSON.stringify(results, null, '  ')}
        multiline
        rows={50}
      />
    </>
  )
}
