import useStorage from './useStorage'

const storageKey = 'adult-content-gate'

const useAdultContentGate = (toggleId: string): [boolean, () => void] => {
  const [visibleIds, setVisibleIds] = useStorage<string[]>(storageKey, [])

  const isVisible = visibleIds.includes(toggleId)

  const toggle = () =>
    setVisibleIds(
      isVisible
        ? visibleIds.filter((id) => id !== toggleId)
        : visibleIds?.concat([toggleId])
    )

  return [isVisible, toggle]
}

export default useAdultContentGate
