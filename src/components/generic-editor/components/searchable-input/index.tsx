import React, { useState, useEffect } from 'react'
import { SearchableProperties } from '../../../../editable-fields'
import useDataStoreItem from '../../../../hooks/useDataStoreItem'

import Button from '../../../button'
import LoadingIndicator from '../../../loading-indicator'
import SearchForIdForm from '../../../search-for-id-form'

type SearchResult = { [prop: string]: any }

export default ({
  name,
  onChange,
  value,
  searchableProperties
}: {
  name: string
  onChange: (id: string | null) => void
  value: any
  searchableProperties: SearchableProperties
}) => {
  if (!searchableProperties.collectionName) {
    throw new Error(`Needs collection name! Field ${name}`)
  }
  if (!searchableProperties.fieldAsLabel) {
    throw new Error(`Needs field name to use as label! Field ${name}`)
  }
  if (!searchableProperties.renderer) {
    throw new Error(`Needs renderer! Field ${name}`)
  }

  const [isFormVisible, setIsFormVisible] = useState(false)
  const [valueData, setValueData] = useState<null | { id: string }>(null)
  const [
    isLoadingExisting,
    isErroredLoadingExisting,
    existingItem
  ] = useDataStoreItem<SearchResult>(
    searchableProperties.collectionName,
    value || false
  )

  const clear = () => {
    onChange(null)
    setIsFormVisible(false)
    setValueData(null)
  }

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
            <searchableProperties.renderer item={valueData || existingItem} />
          ) : (
            <LoadingIndicator />
          )}
          <br />
          <br />
          {!isFormVisible && (
            <div>
              <Button onClick={() => setIsFormVisible(true)}>Change</Button>{' '}
              <Button color="default" onClick={() => clear()}>
                Clear
              </Button>
            </div>
          )}
        </>
      ) : (
        ''
      )}
      {(isFormVisible || !value) && (
        <SearchForIdForm
          collectionName={searchableProperties.collectionName}
          fieldAsLabel={searchableProperties.fieldAsLabel}
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
