import React from 'react'
import Heading from '../heading'
import Markdown from '../markdown'
import Message from '../message'

export default ({ notes }: { notes: string }) => (
  <Message key="notes">
    <Heading variant="h2" noTopMargin>
      Notes from staff
    </Heading>
    <Markdown source={notes} />
  </Message>
)
