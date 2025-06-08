import React, { useEffect } from 'react'
import { useParams } from 'react-router'
import { useDispatch } from 'react-redux'

import { changeSearchTerm } from '../../modules/app'
import HomeContainer from '../home'
import { parseSearchTermFromUrlPath } from '../../utils'
import { trackAction } from '../../analytics'

export default () => {
  const { searchTerm: rawSearchTerm } = useParams<{ searchTerm: string }>()
  const dispatch = useDispatch()
  const dispatchChangeSearchTerm = (newTerm: string) =>
    dispatch(changeSearchTerm(newTerm))

  useEffect(() => {
    const newSearchTerm = parseSearchTermFromUrlPath(rawSearchTerm)
    dispatchChangeSearchTerm(newSearchTerm)

    trackAction('SearchView', 'Change search term', newSearchTerm)
  }, [rawSearchTerm])

  return <HomeContainer />
}
