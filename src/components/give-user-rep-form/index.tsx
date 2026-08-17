import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism'

import useDataStoreItems from '@/hooks/useDataStoreItems'
import {
  CollectionNames,
  RepChange,
  RepChangeFields,
  RepReason,
} from '@/modules/reputation'
import Select, { MenuItem } from '../select'
import DialogButton from '../dialog-button'
import Heading from '../heading'
import RepChangeForUser from '../rep-change-for-user'
import ErrorMessage from '../error-message'
import useDataStoreCreate from '@/hooks/useDataStoreCreate'
import { useState } from 'react'
import FormControls from '../form-controls'
import { CreateButton } from '../button'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import TextInput from '../text-input'

const SelectRepReason = ({
  value,
  onReasonAndDelta,
}: {
  value: string | undefined
  onReasonAndDelta: (reason: string, delta: number) => void
}) => {
  const [isLoading, lastErrorCode, results] = useDataStoreItems<RepReason>(
    CollectionNames.RepReasons
  )

  if (lastErrorCode !== null)
    return (
      <ErrorMessage>
        Failed to load rep reasons (code {lastErrorCode})
      </ErrorMessage>
    )

  return (
    <Select
      fullWidth
      label="Reason"
      value={value}
      onChange={(e) => {
        const newVal = e.target.value as string
        const delta = results?.find((result) => result.name === newVal)!.delta!
        onReasonAndDelta(newVal, delta)
      }}
      disabled={isLoading}>
      {results?.length ? (
        results.map((result) => (
          <MenuItem value={result.name}>
            +{result.delta} {result.name} {result.description}
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>Loading...</MenuItem>
      )}
    </Select>
  )
}

const Form = ({ userId }: { userId: string }) => {
  const [isSaving, isSuccess, lastErrorCode, create] =
    useDataStoreCreate<RepChange>(CollectionNames.RepChanges)
  const [newFields, setNewFields] = useState<Partial<RepChangeFields>>({
    userid: userId,
  })

  const updateField = (fieldName: keyof RepChangeFields, newVal: any) =>
    setNewFields((fields) => ({
      ...fields,
      [fieldName]: newVal,
    }))

  const onClickSave = async () => {
    await create(newFields)
  }

  return (
    <>
      <SelectRepReason
        value={newFields.reason}
        onReasonAndDelta={(newReason, newDelta) =>
          setNewFields({
            ...newFields,
            reason: newReason,
            delta: newDelta,
          })
        }
      />
      <TextInput
        fullWidth
        topMargin
        label="Delta"
        value={newFields.delta || ''}
        onChange={(e) => updateField('delta', e.target.value)}
      />
      <FormControls>
        <CreateButton icon={<VolunteerActivismIcon />} onClick={onClickSave}>
          Give Rep
        </CreateButton>
      </FormControls>
      {isSaving ? (
        <LoadingIndicator message="Giving user rep..." />
      ) : lastErrorCode !== null ? (
        <ErrorMessage>Failed to give rep (code {lastErrorCode})</ErrorMessage>
      ) : isSuccess ? (
        <SuccessMessage>User has been given rep successfully</SuccessMessage>
      ) : null}
    </>
  )
}

const GiveUserRepForm = ({ userId }: { userId: string }) => {
  return (
    <DialogButton
      dialog={
        <>
          <Heading variant="h1" noTopMargin>
            Rep
          </Heading>
          <RepChangeForUser userId={userId} />
          <Heading variant="h1" noTopMargin>
            Manually Add Rep
          </Heading>
          <Form userId={userId} />
        </>
      }
      size="small"
      color="secondary"
      icon={<VolunteerActivismIcon />}>
      Give Rep
    </DialogButton>
  )
}

export default GiveUserRepForm
