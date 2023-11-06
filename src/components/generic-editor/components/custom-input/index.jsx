import React from 'react'

export default ({
  onChange,
  value,
  customProperties: { renderer: Renderer },
  databaseResult
}) => (
  <Renderer
    onChange={newValue => onChange(newValue)}
    value={value}
    databaseResult={databaseResult}
  />
)
