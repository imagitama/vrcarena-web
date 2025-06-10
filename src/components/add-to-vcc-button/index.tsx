import React from 'react'
import Tooltip from '@mui/material/Tooltip'
import { makeStyles } from '@mui/styles'
import Button from '../button'
import { VRChat as VRChatIcon } from '../../icons'
import { isJsonUrl } from '../../utils'

const useStyles = makeStyles({
  vrchatIcon: {
    fontSize: '200%',
    display: 'flex',
    alignItems: 'center',
  },
})

const AddToVccButton = ({ vccUrl }: { vccUrl: string }) => {
  const classes = useStyles()
  return (
    <Tooltip
      arrow
      title="Opens the VRChat Creator Companion and adds it"
      placement="top">
      <Button
        url={`vcc://vpm/${
          isJsonUrl(vccUrl) ? 'addPackage' : 'addRepo'
        }?url=${vccUrl}`}
        color="secondary"
        icon={<VRChatIcon className={classes.vrchatIcon} />}
        switchIconSide>
        Add {isJsonUrl(vccUrl) ? 'Package' : 'Repo'} To VCC
      </Button>
    </Tooltip>
  )
}

export default AddToVccButton
