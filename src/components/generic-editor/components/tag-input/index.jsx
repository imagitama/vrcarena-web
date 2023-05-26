import React from 'react'
import TextField from '@material-ui/core/TextField'
import TagChip from '../../../tag-chip'

const convertTextIntoTags = text => (text ? text.split('\n') : [])
const convertTagsIntoText = tags => (tags ? tags.join('\n') : '')

export default ({ onChange, value }) => {
  return (
    <>
      <span>Type 1 tag per line</span> <br />
      {value
        ? value.map(tag => <TagChip key={tag} tagName={tag} />)
        : '(no tags)'}
      <br />
      <TextField
        value={convertTagsIntoText(value)}
        onChange={e => onChange(convertTextIntoTags(e.target.value))}
        rows={10}
        multiline
      />
    </>
  )
}
