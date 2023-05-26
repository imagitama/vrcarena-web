import React from 'react'
import SelectAssetsForm from '../../../select-assets-form'

export default ({ onChange, value }) => {
  const onSelectAssetId = id => onChange(value.concat([id]))
  const onDeselectAssetId = id => onChange(value.filter(item => item !== id))

  return (
    <SelectAssetsForm
      selectedIds={value}
      onSelectAssetId={onSelectAssetId}
      onDeselectAssetId={onDeselectAssetId}
    />
  )
}
