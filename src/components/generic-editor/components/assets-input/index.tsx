import React from 'react'
import SelectAssetsForm from '../../../select-assets-form'

export default ({ onChange, value }: {
  value: string[]
  onChange: (newIds: string[]) => void
}) => {
  const onSelectAssetId = (id: string) => onChange(value.concat([id]))
  const onDeselectAssetId = (id: string) => onChange(value.filter(item => item !== id))

  return (
    <SelectAssetsForm
      selectedIds={value}
      onSelectAssetId={onSelectAssetId}
      onDeselectAssetId={onDeselectAssetId}
    />
  )
}
