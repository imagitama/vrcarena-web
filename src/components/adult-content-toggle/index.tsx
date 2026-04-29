import React from 'react'
import UserPreferenceEditor from '@/components/user-preference-editor'

const AdultContentToggle = ({
  analyticsCategoryName,
}: {
  analyticsCategoryName?: string
}) => (
  <UserPreferenceEditor
    name="enabledadultcontent"
    label="I am over 18 and want to see adult content"
    defaultValue={false}
    analyticsCategoryName={analyticsCategoryName}
  />
)

export default AdultContentToggle
