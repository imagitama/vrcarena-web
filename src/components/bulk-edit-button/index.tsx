import { useState } from 'react'
import CheckIcon from '@mui/icons-material/Check'

import Button from '@/components/button'
import Heading from '@/components/heading'
import Dialog from '@/components/dialog'
import RepairAuthorsOperation from './operations/repair-authors'
import useBulkEdit from '@/hooks/useBulkEdit'
import FormControls from '../form-controls'
import RepairAssetsOperation from './operations/repair-assets'
import ChangeSpeciesOperation from './operations/change-species'

enum Operation {
  RepairAuthors = 'RepairAuthors',
  RepairAssets = 'RepairAssets',
  ChangeSpecies = 'ChangeSpecies',
}

const Form = ({ operation }: { operation: Operation }) => {
  switch (operation) {
    case Operation.RepairAuthors:
      return <RepairAuthorsOperation />
    case Operation.RepairAssets:
      return <RepairAssetsOperation />
    case Operation.ChangeSpecies:
      return <ChangeSpeciesOperation />
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
              {/* TODO: use array for this */}
              <Button
                color="secondary"
                onClick={() => toggleOperation(Operation.RepairAuthors)}
                icon={
                  selectedOperation === Operation.RepairAuthors ? (
                    <CheckIcon />
                  ) : undefined
                }>
                Repair Authors
              </Button>{' '}
              <Button
                color="secondary"
                onClick={() => toggleOperation(Operation.RepairAssets)}
                icon={
                  selectedOperation === Operation.RepairAssets ? (
                    <CheckIcon />
                  ) : undefined
                }>
                Repair Assets
              </Button>{' '}
              <Button
                color="secondary"
                onClick={() => toggleOperation(Operation.ChangeSpecies)}
                icon={
                  selectedOperation === Operation.ChangeSpecies ? (
                    <CheckIcon />
                  ) : undefined
                }>
                Change Species
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
