import React from 'react'
import Tooltip from '@material-ui/core/Tooltip'
import { makeStyles } from '@material-ui/core/styles'
import Button from '../button'
import { VRChat as VRChatIcon } from '../../icons'
import { isGitRepoUrl, isJsonUrl } from '../../utils'

const useStyles = makeStyles({
  vrchatIcon: {
    fontSize: '200%',
    display: 'flex',
    alignItems: 'center',
  },
})

const AddToVccButton = ({
  vccUrl,
  assetId,
}: {
  vccUrl: string
  assetId?: string
}) => {
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
        color="default"
        icon={<VRChatIcon className={classes.vrchatIcon} />}
        switchIconSide>
        Add {isJsonUrl(vccUrl) ? 'Package' : 'Repo'} To VCC
      </Button>
    </Tooltip>
  )
}

export default AddToVccButton
