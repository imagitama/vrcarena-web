import { alreadyOver18Key } from '../config'
import useStorage from './useStorage'

const useAdultContentToggle = (): [boolean, () => void] => {
  const [isOver18, setIsOver18] = useStorage<boolean>(alreadyOver18Key)

  const toggle = () => setIsOver18(!isOver18)

  return [isOver18 || false, toggle]
}

export default useAdultContentToggle
