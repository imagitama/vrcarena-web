import React, { useState } from 'react'
import { SearchableEditableField } from '@/editable-fields'
import useDataStoreItem from '@/hooks/useDataStoreItem'

import Button from '@/components/button'
import LoadingIndicator from '@/components/loading-indicator'
import SearchForIdForm from '@/components/search-for-id-form'
import TextInput from '@/components/text-input'

type SearchResult = { [prop: string]: any }

export default ({
  editableField,
  onChange,
  value,
}: {
  editableField: SearchableEditableField<any>
  onChange: (id: string | null) => void
  value: any
}) => {
  if (!editableField.collectionName) {
    throw new Error(`Needs collection name! Field ${name}`)
  }
  if (!editableField.fieldAsLabel) {
    throw new Error(`Needs field name to use as label! Field ${name}`)
  }
  if (!editableField.renderer) {
    throw new Error(`Needs renderer! Field ${name}`)
  }

  const [isFormVisible, setIsFormVisible] = useState(false)
  const [valueData, setValueData] = useState<null | { id: string }>(null)
  const [manualEntryTextVal, setManualEntryTextVal] = useState('')
  const [, , existingItem] = useDataStoreItem<SearchResult>(
    editableField.collectionName,
    (!manualEntryTextVal && value) || false
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
            <editableField.renderer item={valueData || existingItem} />
          ) : editableField.allowManualEntry ? (
            value
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
          collectionName={editableField.collectionName}
          fieldAsLabel={editableField.fieldAsLabel}
          onClickWithIdAndDetails={(id: string, item: any) => {
            setIsFormVisible(false)
            setValueData(item)
            onChange(id)
          }}
        />
      )}
      {editableField.allowManualEntry === true && (
        <>
          <br />
          <TextInput
            label="Manual Entry"
            fullWidth
            value={manualEntryTextVal}
            onChange={(e) => setManualEntryTextVal(e.target.value)}
            button={
              <Button onClick={() => onChange(manualEntryTextVal)}>
                Use This
              </Button>
            }
          />
        </>
      )}
    </div>
  )
}
