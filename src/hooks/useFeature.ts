import useStorage from "./useStorage"

export enum FeatureName {
  Ai = 'Ai'
}

interface FeatureDetail {
  label: string
  desc: string
}

export const featureDetails: { [featureName: string]: FeatureDetail } = {
  [FeatureName.Ai]: {
    label: 'AI',
    desc: 'If to display AI features and tools. Does not disable background AI tasks (see our AI policy).'
  }
}

const STORAGE_KEY = 'features'

export const useFeatures = () => useStorage<{ [featureName: string]: boolean }>(STORAGE_KEY, {
  [FeatureName.Ai]: false // until kinks worked out
})

const useFeature = (featureName: FeatureName): [boolean, (newVal: boolean) => void] => {
  const [enabledFeaturesByName, setEnabledFeaturesByName] = useFeatures()

  const isEnabled = !(featureName in enabledFeaturesByName) || (featureName in enabledFeaturesByName && enabledFeaturesByName[featureName] !== false)

  const setIsEnabled = (newVal: boolean) => setEnabledFeaturesByName({
    ...enabledFeaturesByName,
    [featureName]: newVal
  })

  return [
    isEnabled,
    setIsEnabled
  ]
}

export default useFeature