import React from 'react'
import { Helmet } from 'react-helmet'

import useSupabaseView from '../../hooks/useSupabaseView'
import Heading from '../../components/heading'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import PieChart from '../../components/pie-chart'
import BarChart from '../../components/bar-chart'

function VrGameStats() {
  const [isLoading, isErrored, results] = useSupabaseView('statsVrGames')

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to find stats</ErrorMessage>
  }

  const stats = results[0]

  const chartData = [
    {
      label: 'VRChat',
      value: stats.vrchatusername,
      fill: 'darkblue',
    },
    {
      label: 'ChilloutVR',
      value: stats.chilloutvrusername,
      fill: 'darkgreen',
    },
    {
      label: 'Resonite',
      value: stats.neosvrusername,
      fill: 'darkred',
    },
  ]

  return <PieChart data={chartData} />
}

function FavSpeciesStats() {
  const [isLoading, isErrored, stats] = useSupabaseView('statsFavSpecies')

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to find stats</ErrorMessage>
  }

  const chartData = stats
    .sort((itemA, itemB) => (itemA.count > itemB.count ? -1 : 1))
    .map((item) => ({
      name: item.singularname,
      label: item.singularname,
      value: item.count,
    }))

  return <BarChart data={chartData} />
}

function AdultContentEnabledStats() {
  const [isLoading, isErrored, results] = useSupabaseView('statsAdultToggle')

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to find stats</ErrorMessage>
  }

  const stats = results[0]

  const chartData = [
    {
      label: 'Enabled',
      value: stats.enabled,
      fill: 'darkgreen',
    },
    {
      label: 'Disabled (default)',
      value: stats.total - stats.enabled,
      fill: 'darkred',
    },
  ]

  return <PieChart data={chartData} />
}

export default () => {
  return (
    <>
      <Helmet>
        <title>Site stats | VRCArena</title>
        <meta name="description" content="Stats for the site." />
      </Helmet>
      <Heading variant="h1">Stats</Heading>
      <Heading variant="h2">Users who have played which VR games</Heading>
      <p>When users sign-up they can enter their username for each platform.</p>
      <VrGameStats />
      <Heading variant="h2">Favorite Species</Heading>
      <p>Users can select a favorite species when they sign-up.</p>
      <FavSpeciesStats />
      <Heading variant="h2">Enabled adult content</Heading>
      <p>Users must opt-in to this setting.</p>
      <AdultContentEnabledStats />
    </>
  )
}
