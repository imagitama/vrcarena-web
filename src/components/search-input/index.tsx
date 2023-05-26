import React, { useState } from 'react'
import SearchIcon from '@material-ui/icons/Search'
import Button from '../button'
import TextInput from '../text-input'

export default ({
  defaultValue = '',
  performSearch,
  onClear
}: {
  defaultValue?: string
  performSearch: (searchTerm: string) => void
  onClear?: () => void
}) => {
  const [userInput, setUserInput] = useState(defaultValue)

  return (
    <div>
      <TextInput
        value={userInput}
        onKeyDown={e => {
          // fix weird bug when rendered inside menu
          e.stopPropagation()

          if (e.key == 'Enter') {
            performSearch(userInput)
          }
        }}
        onChange={e => setUserInput(e.target.value)}
        size="small"
      />{' '}
      <Button onClick={() => performSearch(userInput)} icon={<SearchIcon />}>
        Search
      </Button>
      {onClear ? (
        <>
          {' '}
          <Button color="default" onClick={() => onClear()}>
            Clear
          </Button>
        </>
      ) : null}
    </div>
  )
}
