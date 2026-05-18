import { useState } from 'react'
import CheckIcon from '@mui/icons-material/Check'

import Button from '@/components/button'
import Heading from '@/components/heading'
import Dialog from '@/components/dialog'
import RepairAuthorsOperation from './operations/repair-authors'
import useBulkEdit from '@/hooks/useBulkEdit'
import FormControls from '../form-controls'

enum Operation {
  RepairAuthors = 'RepairAuthors',
}

const Form = ({ operation }: { operation: Operation }) => {
  switch (operation) {
    case Operation.RepairAuthors:
      return <RepairAuthorsOperation />
    default:
      return <>Unknown operation "{operation}"</>
  }
}

const BulkEditButton = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOperation, setSelectedOperation] = useState<null | Operation>(
    null
  )
  const { ids, enter, leave } = useBulkEdit()
  const isInBulkEditMode = ids !== null

  const toggleOperation = (operation: Operation) =>
    setSelectedOperation((currentVal) =>
      currentVal === operation ? null : operation
    )

  if (isInBulkEditMode) {
    return (
      <div>
        <Heading variant="h3">Bulk Edit</Heading>
        {ids ? (
          <Button onClick={() => setIsOpen(true)}>
            Bulk Edit {ids.length} assets
          </Button>
        ) : null}{' '}
        <Button color="secondary" onClick={() => leave()}>
          Cancel
        </Button>
        {isOpen && (
          <Dialog fullWidth onClose={() => setIsOpen(false)}>
            <Heading variant="h1" noMargin>
              Bulk Edit
            </Heading>
            <Heading variant="h2" noMargin>
              Operation
            </Heading>
            <div>
              <Button
                color="secondary"
                onClick={() => toggleOperation(Operation.RepairAuthors)}
                icon={
                  selectedOperation === Operation.RepairAuthors ? (
                    <CheckIcon />
                  ) : undefined
                }>
                Repair Authors
              </Button>
            </div>
            <Heading variant="h2" noMargin>
              Form
            </Heading>
            {selectedOperation !== null ? (
              <Form operation={selectedOperation} />
            ) : (
              <>Select an operation</>
            )}
            <FormControls>
              <Button color="secondary" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </FormControls>
          </Dialog>
        )}
      </div>
    )
  }

  return (
    <div>
      <Heading variant="h3">Bulk Edit</Heading>
      <Button onClick={() => enter()} color="secondary">
        Enter Bulk Edit Mode
      </Button>
    </div>
  )
}

export default BulkEditButton
