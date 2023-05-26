import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'
import { makeStyles } from '@material-ui/core/styles'
import firebase from 'firebase/app'

import ErrorMessage from '../../components/error-message'
import Award from '../../components/award'
import Heading from '../../components/heading'
import LoadingIndicator from '../../components/loading-indicator'
import UserList from '../../components/user-list'
import Button from '../../components/button'

import { getNameForAwardId, allAwardIds } from '../../awards'
import useDatabaseQuery, {
  CollectionNames,
  AwardsForUsersFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'

const useStyles = makeStyles({
  title: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

function Users({ ids }) {
  const [results, setResults] = useState([])

  useEffect(() => {
    if (!ids.length) {
      return
    }

    // async function main() {
    //   try {
    //     const docs = await Promise.all(
    //       ids.map(async id =>
    //         firebase
    //           .firestore()
    //           .collection(CollectionNames.Users)
    //           .doc(id)
    //           .get()
    //       )
    //     )
    //     const docDatas = docs.map(doc => doc.data())

    //     setResults(docDatas)
    //   } catch (err) {
    //     console.error(err)
    //   }
    // }

    main()
  }, [ids.join(',')])

  if (!results.length) {
    return <LoadingIndicator />
  }

  return (
    <>
      <UserList users={results} />
    </>
  )
}

function UsersWithAward({ awardId }) {
  const isOneYearAnniversaryAwardId =
    awardId === allAwardIds['1_year_anniversary']

  const [isLoading, isError, usersWithAward] = useDatabaseQuery(
    CollectionNames.AwardsForUsers,
    isOneYearAnniversaryAwardId
      ? false
      : [[AwardsForUsersFieldNames.awards, Operators.ARRAY_CONTAINS, awardId]]
  )
  const [shouldLoadUsers, setShouldLoadUsers] = useState(false)

  useEffect(() => {
    setShouldLoadUsers(false)
  }, [awardId])

  if (isLoading) {
    return <LoadingIndicator message="Finding users with that award..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to find users with that award</ErrorMessage>
  }

  if (isOneYearAnniversaryAwardId) {
    return <>Over 2000 users have this award!</>
  }

  return (
    <>
      {usersWithAward && usersWithAward.length} users have that award{' '}
      {!shouldLoadUsers ? (
        <Button onClick={() => setShouldLoadUsers(true)}>View</Button>
      ) : (
        <Users ids={usersWithAward.map(({ id }) => id)} />
      )}
    </>
  )
}

const View = () => {
  const { awardId } = useParams()
  const classes = useStyles()

  if (!awardId) {
    return <ErrorMessage>No award ID provided</ErrorMessage>
  }

  const awardName = getNameForAwardId(awardId)

  return (
    <>
      <Helmet>
        <title>View the award "{awardName}" | VRCArena</title>
        <meta
          name="description"
          content={`View more information about the award named "${awardName}".`}
        />
      </Helmet>
      <div>
        <div className={classes.title}>
          {Object.keys(allAwardIds).map(id => (
            <Award key={id} awardId={id} isLarge={id === awardId} />
          ))}
        </div>
        <Heading variant="h2">Users with this award</Heading>
        <UsersWithAward awardId={awardId} />
      </div>
    </>
  )
}

export default () => (
  <>
    <Helmet>
      <title>View an award | VRCArena</title>
      <meta
        name="description"
        content="View more information about an award."
      />
    </Helmet>
    <View />
  </>
)
