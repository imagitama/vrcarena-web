import React, { useState, useEffect } from 'react'
import useDataStoreItem from '../../../../hooks/useDataStoreItem'

import Button from '../../../button'
import LoadingIndicator from '../../../loading-indicator'
import SearchForIdForm from '../../../search-for-id-form'

export interface SearchableInputFieldProperties {
  collectionName: string
  fieldAsLabel: string
  renderer: (props: { item: any }) => React.ReactElement
}

type SearchResult = { [prop: string]: any }

export default ({
  name,
  onChange,
  value,
  fieldProperties
}: {
  name: string
  onChange: (id: string) => void
  value: any
  fieldProperties: SearchableInputFieldProperties
}) => {
  if (!fieldProperties.collectionName) {
    throw new Error(`Needs collection name! Field ${name}`)
  }
  if (!fieldProperties.fieldAsLabel) {
    throw new Error(`Needs field name to use as label! Field ${name}`)
  }
  if (!fieldProperties.renderer) {
    throw new Error(`Needs renderer! Field ${name}`)
  }

  const [isFormVisible, setIsFormVisible] = useState(false)
  const [valueData, setValueData] = useState<null | { id: string }>(null)
  const [
    isLoadingExisting,
    isErroredLoadingExisting,
    existingItem
  ] = useDataStoreItem<SearchResult>(
    fieldProperties.collectionName,
    value || false
  )

  return (
    <div
      style={{
        padding: '1rem',
        margin: '1rem 0',
        background: 'rgba(0,0,0,0.2)'
      }}>
      {value || existingItem ? (
        <>
          Selected:
          <br />
          <br />
          {valueData || existingItem ? (
            <fieldProperties.renderer item={valueData || existingItem} />
          ) : (
            <LoadingIndicator />
          )}
          <br />
          <br />
          {!isFormVisible && (
            <div>
              <Button onClick={() => setIsFormVisible(true)}>Change</Button>
            </div>
          )}
        </>
      ) : (
        ''
      )}
      {(isFormVisible || !value) && (
        <SearchForIdForm
          collectionName={fieldProperties.collectionName}
          fieldAsLabel={fieldProperties.fieldAsLabel}
          onClickWithIdAndDetails={(id: string, item: any) => {
            setIsFormVisible(false)
            setValueData(item)
            onChange(id)
          }}
        />
      )}
    </div>
  )
}
