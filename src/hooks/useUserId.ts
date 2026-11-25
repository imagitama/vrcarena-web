import useUserRecord from './useUserRecord'

export default (): string | null => {
  const [, , user] = useUserRecord()
  return user?.id || null
}
