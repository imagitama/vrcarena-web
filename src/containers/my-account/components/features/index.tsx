import CheckboxInput from '@/components/checkbox-input'
import SuccessMessage from '@/components/success-message'
import useFeature, { featureDetails, FeatureName } from '@/hooks/useFeature'
import useTimer from '@/hooks/useTimer'
import { useState } from 'react'

const FeatureItem = ({ name }: { name: FeatureName }) => {
  const [isEnabled, setIsEnabled] = useFeature(name)
  const [isSaved, setIsSaved] = useState(false)
  const hideAfterDelay = useTimer(() => setIsSaved(false))

  const details = featureDetails[name]

  const onChange = () => {
    setIsEnabled(!isEnabled)
    setIsSaved(true)
    hideAfterDelay()
  }

  return (
    <div>
      {details.desc}
      <br />
      <CheckboxInput
        label={details.label}
        value={isEnabled}
        onChange={onChange}
      />
      {isSaved && <SuccessMessage>{details.label} saved!</SuccessMessage>}
    </div>
  )
}

const FeatureItems = () => {
  return (
    <>
      {Object.values(FeatureName).map((name) => (
        <FeatureItem key={name} name={name} />
      ))}
    </>
  )
}

export default FeatureItems
