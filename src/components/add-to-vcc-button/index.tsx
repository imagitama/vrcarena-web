import React from 'react'
import Tooltip from '@material-ui/core/Tooltip'
import { makeStyles } from '@material-ui/core/styles'
import Button from '../button'
import { VRChat as VRChatIcon } from '../../icons'
import ErrorMessage from '../error-message'
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
  if (!isGitRepoUrl(vccUrl) && !isJsonUrl(vccUrl)) {
    return <ErrorMessage>Invalid VCC URL: {vccUrl}</ErrorMessage>
  }
  return (
    <Tooltip
      arrow
      title="Opens the VRChat Creator Companion and adds it"
      placement="top">
      <Button
        url={`vcc://vpm/${
          isGitRepoUrl(vccUrl) ? 'addRepo' : 'addPackage'
        }?url=${vccUrl}`}
        color="default"
        icon={<VRChatIcon className={classes.vrchatIcon} />}
        switchIconSide>
        Add {isGitRepoUrl(vccUrl) ? 'Repo' : 'Package'} To VCC
      </Button>
    </Tooltip>
  )
}

export default AddToVccButton
