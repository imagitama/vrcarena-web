import { useEffect, useRef, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import MenuList from '@material-ui/core/MenuList'
import MenuItem from '@material-ui/core/MenuItem'

import useUserMentioning from '../../hooks/useUserMentioning'
import { AutocompleteOption } from '../autocomplete-input'
import EmojiPicker from '../emoji-picker'
import Paper from '@material-ui/core/Paper'

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
  },
  inputWrapper: {
    background: '#FFF',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    '& > *': {
      padding: theme.spacing(1),
      paddingRight: '40px',
      display: 'block',
      letterSpacing: 'normal',
      lineHeight: '1.25rem',
    },
    '& textarea': {
      // resets
      margin: 0,
      appearance: 'none',
      border: 'none',
      background: 'none',
      outline: 'none',
      width: '100%',
      position: 'relative',
      zIndex: 5,
      font: 'inherit',
      lineHeight: '1.25rem',
      color: '#000',
      padding: theme.spacing(1),
      '&:focus': {
        outline: 'none',
      },
      '&::placeholder': {
        font: 'inherit',
        opacity: '0.5',
      },
    },
  },
  display: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 4,
    overflowY: 'scroll',
    scrollbarWidth: 'none',
    '-ms-overflow-style': 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    '& div': {
      height: '1.25rem',
    },
    '& span': {
      opacity: 0,
    },
    '& em': {
      fontStyle: 'normal',
      background: theme.palette.primary.light,
      opacity: 0.5,
      position: 'relative',
      color: 'rgba(0, 0, 0, 0)',
    },
  },
  hint: {
    position: 'absolute',
    top: '100%',
    right: 0,
    fontSize: '75%',
    marginTop: '0.25rem',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  emojiPickerWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 50,
  },
  emojiPicker: {
    padding: '10px',
  },
  menu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: 100,
  },
}))

type UsernameMapping = { [username: string]: string }

const getValueForRendering = (value: string, map: UsernameMapping) => {
  const regex = /\[user:(\w+)\]/g

  value = value.replace(regex, (match, userId) => {
    const result = Object.entries(map).find(([name, id]) => id === userId)
    return result ? `@${result[0]}` : `${match}`
  })

  return value
}

const getValueForSaving = (value: string, map: UsernameMapping) => {
  let newValue = value

  for (const [username, userId] of Object.entries(map)) {
    newValue = newValue.replaceAll(`@${username}`, `[user:${userId}]`)
  }

  return newValue
}

const Output = ({ value, map }: { value: string; map: UsernameMapping }) => {
  const regex = /\[user:(\w+)\]/g
  let mentionIdx = 0

  const lines = value.split('\n')

  const elements = []

  for (const line of lines) {
    const parts = line.split(regex)

    const chunks = parts.map((part, index) => {
      // If it's an odd index, it's a user ID, so render a React element
      if (index % 2 === 1) {
        const userId = part

        const result = Object.entries(map).find(([name, id]) => id === userId)

        if (!result) {
          throw new Error(`Could not find match for ${userId}`)
        }

        mentionIdx++
        return <em>@{result[0]}</em>
      } else {
        return <span>{part}</span>
      }
    })

    elements.push(<div>{chunks}</div>)
  }

  return <>{elements}</>
}

const MentionsInput = ({
  value,
  onChange,
  isDisabled = false,
}: {
  value: string
  onChange: (newValue: string) => void
  isDisabled?: boolean
}) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const classes = useStyles()
  const [
    userSuggestions,
    isLoadingUserSuggestions,
    atSymbolIndexInText,
    clearSuggestions,
    stopMentioningAndClear,
  ] = useUserMentioning(value)
  const usernameMapping = useRef<UsernameMapping>({})
  const outputRef = useRef<HTMLDivElement>(null)
  const [selectedSuggestionIdx, setSelectedSuggestionIdx] = useState<number>(0)

  useEffect(() => {
    setSelectedSuggestionIdx(0)
  }, [userSuggestions && userSuggestions.length])

  const onSelectUserSuggestion = (option: AutocompleteOption<string>) => {
    console.debug(`User selected option ${option.data} "${option.label}"`)

    stopMentioningAndClear()

    usernameMapping.current[option.label] = option.data

    const newInternalText = `${value.substring(0, atSymbolIndexInText)}[user:${
      option.data
    }] `

    onChange(newInternalText)
  }

  const onChangeCustom = (newText: string) => {
    const newInternalText = getValueForSaving(newText, usernameMapping.current)

    onChange(newInternalText)
  }

  const valueForTextarea = getValueForRendering(value, usernameMapping.current)

  const onScroll = (event: any) => {
    outputRef.current!.scrollTop = event.target.scrollTop
  }

  const onKeyDown: React.KeyboardEventHandler = (e) => {
    if (!userSuggestions || !userSuggestions.length) {
      return
    }

    if (e.key === 'Escape') {
      clearSuggestions()
      e.preventDefault()
    } else if (e.key === 'ArrowDown') {
      setSelectedSuggestionIdx((currentVal) =>
        userSuggestions && currentVal < userSuggestions.length - 1
          ? currentVal + 1
          : currentVal
      )
      e.preventDefault()
    } else if (e.key === 'ArrowUp') {
      setSelectedSuggestionIdx((currentVal) =>
        userSuggestions && currentVal > 0 ? currentVal - 1 : 0
      )
      e.preventDefault()
    } else if (e.key === 'Enter') {
      onSelectUserSuggestion(userSuggestions[selectedSuggestionIdx])
      e.preventDefault()
    }
  }

  return (
    <div className={classes.root} ref={rootRef}>
      <div className={classes.inputWrapper}>
        <textarea
          onChange={(e) => onChangeCustom(e.target.value)}
          value={valueForTextarea}
          onScroll={onScroll}
          placeholder="Type anything"
          disabled={isDisabled}
          onKeyDown={onKeyDown}
        />
        <div className={classes.display} ref={outputRef}>
          <Output value={value} map={usernameMapping.current} />
        </div>
      </div>
      <div className={classes.emojiPickerWrapper}>
        <EmojiPicker
          onSelectEmoji={(emoji) => onChange(`${value}${emoji}`)}
          className={classes.emojiPicker}
        />
      </div>
      <div className={classes.hint}>
        {isLoadingUserSuggestions
          ? 'Searching...'
          : atSymbolIndexInText !== -1 && userSuggestions === null
          ? 'Keep typing...'
          : 'Type @ and at least 3 characters to mention someone'}
      </div>
      {userSuggestions !== null && userSuggestions.length > 0 && (
        <MenuList
          className={classes.menu}
          autoFocus={false}
          // anchorEl={outputRef.current}
          // getContentAnchorEl={null}
          // anchorOrigin={{
          //   vertical: 'bottom',
          //   horizontal: 'left',
          // }}
          // transformOrigin={{
          //   vertical: 'top',
          //   horizontal: 'left',
          // }}
          // BackdropProps={{
          //   invisible: true,
          // }}
          // disableAutoFocus={true}
          // hideBackdrop={true}
          // autoFocus={false}
          // open={userSuggestions !== null && userSuggestions.length > 0}
          // onClose={() => clearSuggestions()}
        >
          <Paper>
            {userSuggestions &&
              userSuggestions.length &&
              userSuggestions.map((userSuggestion, idx) => (
                <MenuItem
                  key={userSuggestion.data}
                  value={userSuggestion.data}
                  onClick={() => onSelectUserSuggestion(userSuggestion)}
                  selected={idx === selectedSuggestionIdx}>
                  {userSuggestion.label}
                </MenuItem>
              ))}
          </Paper>
        </MenuList>
      )}
    </div>
  )
}

export default MentionsInput
