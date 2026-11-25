import ErrorMessage from '../error-message'

const FeatureUnavailableMessage = ({ name }: { name?: string }) => {
  return (
    <ErrorMessage title={`${name || 'Feature'} Unavailable`}>
      Recently we have switched to a new backend. Some features like this one
      still need to be migrated. If this feature is important to you, please
      join our Discord server and request it be prioritized.
    </ErrorMessage>
  )
}

export default FeatureUnavailableMessage
