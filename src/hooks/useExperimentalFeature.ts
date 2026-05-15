import useStorage from "./useStorage"

export enum FeatureName {
  AiSuggestions = 'AiSuggestions'
}

export const featureDetails = {
  [FeatureName.AiSuggestions]: {
    label: 'AI Suggestions',
    desc: 'Enables a form that suggests fields by AI. See our AI policy (in the footer) for more info.'
  }
}

const STORAGE_KEY = 'experimental_features'

export const useExperimentalFeatures = () => useStorage<string[]>(STORAGE_KEY, [])

const useExperimentalFeature = (featureName: FeatureName): [boolean, (newVal: boolean) => void] => {
  const [enabledFeatures, setEnabledFeatures] = useExperimentalFeatures()

  const isEnabled = enabledFeatures.includes(featureName)

  const setIsEnabled = (newVal: boolean) => setEnabledFeatures(newVal ? enabledFeatures.concat([featureName]) : enabledFeatures.filter(name => name !== featureName))

  return [
    isEnabled,
    setIsEnabled
  ]
}

export default useExperimentalFeature