import CheckboxInput from '@/components/checkbox-input'
import useExperimentalFeature, {
  featureDetails,
  FeatureName,
} from '@/hooks/useExperimentalFeature'

const ExperimentalFeature = ({ name }: { name: FeatureName }) => {
  const [isEnabled, setIsEnabled] = useExperimentalFeature(name)

  const details = featureDetails[name]

  return (
    <div>
      {details.desc}
      <br />
      <CheckboxInput
        label={details.label}
        value={isEnabled}
        onChange={setIsEnabled}
      />
    </div>
  )
}

const ExperimentalFeatures = () => {
  return (
    <>
      {Object.values(FeatureName).map((name) => (
        <ExperimentalFeature key={name} name={name} />
      ))}
    </>
  )
}

export default ExperimentalFeatures
