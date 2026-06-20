import Heading from '@/components/heading'
import Rep from '@/components/rep'
import RepChangeForUser from '@/components/rep-change-for-user'
import useUserRecord from '@/hooks/useUserRecord'

const MyRep = () => {
  const [, , user] = useUserRecord()
  if (!user) return null
  return (
    <>
      <Heading variant="h3">Your Reputation</Heading>
      <Rep reputation={user.reputation} />
      <Heading variant="h3">Changes</Heading>
      <RepChangeForUser userId={user.id} />
    </>
  )
}

export default MyRep
