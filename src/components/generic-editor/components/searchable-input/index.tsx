import React, { useState, useEffect } from 'react'
import { SearchableEditableField } from '../../../../editable-fields'
import useDataStoreItem from '../../../../hooks/useDataStoreItem'

import Button from '../../../button'
import LoadingIndicator from '../../../loading-indicator'
import SearchForIdForm from '../../../search-for-id-form'

type SearchResult = { [prop: string]: any }

export default ({
  name,
  onChange,
  value,
  ...props
}: {
  name: string
  onChange: (id: string | null) => void
  value: any
} & SearchableEditableField<any>) => {
  if (!props.collectionName) {
    throw new Error(`Needs collection name! Field ${name}`)
  }
  if (!props.fieldAsLabel) {
    throw new Error(`Needs field name to use as label! Field ${name}`)
  }
  if (!props.renderer) {
    throw new Error(`Needs renderer! Field ${name}`)
  }

  const [isFormVisible, setIsFormVisible] = useState(false)
  const [valueData, setValueData] = useState<null | { id: string }>(null)
  const [, , existingItem] = useDataStoreItem<SearchResult>(
    props.collectionName,
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
        background: 'rgba(0,0,0,0.2)',
      }}>
      {value || existingItem ? (
        <>
          Selected:
          <br />
          <br />
          {valueData || existingItem ? (
            <props.renderer item={valueData || existingItem} />
          ) : (
            <LoadingIndicator />
          )}
          <br />
          <br />
          {!isFormVisible && (
            <div>
              <Button onClick={() => setIsFormVisible(true)}>Change</Button>{' '}
              <Button color="secondary" onClick={() => clear()}>
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
          collectionName={props.collectionName}
          fieldAsLabel={props.fieldAsLabel}
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
