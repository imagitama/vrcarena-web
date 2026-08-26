import React from 'react'
import { Helmet } from '@unhead/react/helmet'
import Select, { MenuItem } from '@/components/select'
import Button from '@/components/button'
import TextInput from '@/components/text-input'

export default () => {
  return (
    <>
      <Helmet>
        <title>Development area</title>
        <meta name="description" content="Internal use." />
      </Helmet>
      <div>
        <h1>Forms</h1>
        <h2>Basic Components (Default Size)</h2>
        <Button>Click Me</Button>{' '}
        <Select label="Here We Go" button={<Button>Click Me</Button>}>
          <MenuItem value="">Nothing</MenuItem>
          <MenuItem value="Some option">Some option</MenuItem>
        </Select>{' '}
        <TextInput label="Type In Me" button={<Button>Click Me</Button>} />
        <h1>Forms</h1>
        <h2>Basic Components (Default Size)</h2>
        <Button>Click Me</Button>{' '}
        <Select label="Here We Go" button={<Button>Click Me</Button>}>
          <MenuItem value="">Nothing</MenuItem>
          <MenuItem value="Some option">Some option</MenuItem>
        </Select>{' '}
        <TextInput label="Type In Me" button={<Button>Click Me</Button>} />
      </div>
    </>
  )
}
