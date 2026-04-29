import React from 'react'
import Heading from '@/components/heading'
import Markdown from '@/components/markdown'
import Message from '@/components/message'

export default ({ notes }: { notes: string }) => (
  <Message key="notes">
    <Heading variant="h2" noTopMargin>
      Notes from staff
    </Heading>
    <Markdown source={notes} />
  </Message>
)
