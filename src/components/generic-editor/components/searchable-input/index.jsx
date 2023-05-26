import React, { useState, useEffect } from 'react'

import { createRef, isRef } from '../../../../utils'
import { mapDates } from '../../../../hooks/useDatabaseQuery'

import Button from '../../../button'
import LoadingIndicator from '../../../loading-indicator'
import SearchForIdForm from '../../../search-for-id-form'

export default ({ name, onChange, value, fieldProperties }) => {
  if (!fieldProperties.collectionName) {
    throw new Error(`Needs collection name! Field ${name}`)
  }
  if (!fieldProperties.indexName) {
    throw new Error(`Needs index name! Field ${name}`)
  }
  if (!fieldProperties.fieldAsLabel) {
    throw new Error(`Needs field name to use as label! Field ${name}`)
  }
  if (!fieldProperties.renderer) {
    throw new Error(`Needs renderer! Field ${name}`)
  }

  const [isFormVisible, setIsFormVisible] = useState()
  const [valueData, setValueData] = useState(null)

  useEffect(() => {
    if (!value) {
      return
    }

    const docId = value.id

    async function main() {
      console.debug('populating', fieldProperties.collectionName, docId, value)
      setValueData({
        id: docId
      })
    }

    main()
  }, [value])

  return (
    <div
      style={{
        padding: '1rem',
        margin: '1rem 0',
        background: 'rgba(0,0,0,0.2)'
      }}>
      {value ? (
        <>
          Selected:
          <br />
          <br />
          {valueData ? (
            <fieldProperties.renderer item={valueData} />
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
          preselectedId={value ? value.id : null}
          indexName={fieldProperties.indexName}
          fieldAsLabel={fieldProperties.fieldAsLabel}
          onDone={id => {
            setIsFormVisible(false)
            onChange(createRef(fieldProperties.collectionName, id))
          }}
        />
      )}
    </div>
  )
}
