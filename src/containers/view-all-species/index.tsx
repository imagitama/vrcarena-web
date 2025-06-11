import React from 'react'
import { Helmet } from 'react-helmet'
import SpeciesBrowser from '../../components/species-browser'

const description =
  'Avatars in VR social games can be grouped into different species. Here is a list of all species that we know about in VR social games from Avalis to Dutch Angel Dragons to Digimon.'

export default () => (
  <>
    <Helmet>
      <title>View all species | VRCArena</title>
      <meta name="description" content={description} />
    </Helmet>
    <SpeciesBrowser />
  </>
)
