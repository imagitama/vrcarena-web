import React from 'react'

export default ({
  onChange,
  value,
  renderer: Renderer,
  databaseResult,
  formFields,
}: {
  value: any
  onChange: (newVal: any) => void
  renderer: React.ComponentType<{
    value: any
    databaseResult: any
    onChange: (newValue: any) => void
    formFields: any
  }>
  databaseResult: any
  formFields: any
}) => (
  <Renderer
    onChange={(newValue) => onChange(newValue)}
    value={value}
    databaseResult={databaseResult}
    formFields={formFields}
  />
)
