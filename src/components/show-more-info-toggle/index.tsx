import React from 'react'
import UserPreferenceEditor from '../user-preference-editor'

const ShowMoreInfoToggle = ({
  analyticsCategoryName,
}: {
  analyticsCategoryName?: string
}) => (
  <UserPreferenceEditor
    name="showmoreinfo"
    label="Show more info in assets (such as price)"
    defaultValue={false}
    analyticsCategoryName={analyticsCategoryName}
  />
)

export default ShowMoreInfoToggle
