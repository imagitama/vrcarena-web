import React from 'react'

export default ({
  onChange,
  value,
  customProperties: { renderer: Renderer },
  databaseResult
}: {
  value: any
  onChange: (newVal: any) => void
  customProperties: {
    renderer: React.ComponentType<{ value: any, databaseResult: any, onChange: (newValue: any) => void }>
  },
  databaseResult: any
}) => (
  <Renderer
    onChange={newValue => onChange(newValue)}
    value={value}
    databaseResult={databaseResult}
  />
)
