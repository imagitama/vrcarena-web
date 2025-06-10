import React, { useState } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { makeStyles } from '@mui/styles'
import HelpIcon from '@mui/icons-material/Help'

import { VRCFury as VrcFuryIcon } from '../../icons'
import { VrcFuryPrefabInfo } from '../../modules/assets'
import Button from '../button'
import DiscordServerMustJoinNotice from '../discord-server-must-join-notice'
import { vrcFuryOrange } from '../../config'
import { getIsDiscordUrl } from '../../utils'
import { CollectionNames, DiscordServer } from '../../modules/discordservers'
import { readRecordsById } from '../../data-store'
import { handleError } from '../../error-handling'
import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import Box from '../box'
import Link from '../link'
import Tooltip from '../tooltip'
import useSupabaseClient from '../../hooks/useSupabaseClient'

const useStyles = makeStyles({
  root: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: vrcFuryOrange,
    '& svg': {
      fill: vrcFuryOrange,
      width: '1rem',
      height: '1rem',
      marginRight: '0.5rem',
    },
    paddingLeft: '0.25rem',
    userSelect: 'none',
  },
  prefabs: {
    marginTop: '0.5rem',
  },
  discordNotice: {
    marginTop: '0.5rem',
  },
  vrcFuryReadyIcon: {
    fontSize: '50%',
    marginLeft: '0.25rem',
  },
  clickable: {
    cursor: 'pointer',
  },
})

const vrcFuryAssetId = '21def-vrcfury'

const VrcFurySettings = ({
  prefabs,
  analyticsCategory = undefined,
  isVrcFuryReady = null,
}: {
  prefabs?: VrcFuryPrefabInfo[]
  analyticsCategory?: string
  isVrcFuryReady?: boolean | null // null for unsure, false for actually no
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [discordServerDatas, setDiscordServerDatas] = useState<
    null | DiscordServer[]
  >(null)
  const classes = useStyles()
  const supabase = useSupabaseClient()

  const populateDiscordServerData = async () => {
    try {
      if (!prefabs) {
        return
      }

      const ids = prefabs
        .filter((prefab) => prefab.discordServerId !== undefined)
        .map((prefab) => prefab.discordServerId || '')

      if (!ids.length) {
        console.warn('Could not populate Discord server data: IDs empty', {
          prefabs,
          ids,
        })
        return null
      }

      const result = await readRecordsById<DiscordServer>(
        supabase,
        CollectionNames.DiscordServers,
        ids
      )
      setDiscordServerDatas(result)
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return (
    <Box color={vrcFuryOrange} icon={<VrcFuryIcon />}>
      <div className={classes.root}>
        {isVrcFuryReady ? (
          <div className={classes.title}>
            VRCFury Ready{' '}
            <Tooltip title="The asset has a Unity prefab with VRCFury components.">
              <HelpIcon className={classes.vrcFuryReadyIcon} />
            </Tooltip>
          </div>
        ) : null}
        {prefabs ? (
          <>
            <div
              className={`${classes.title} ${classes.clickable}`}
              onClick={() => {
                if (discordServerDatas === null) {
                  populateDiscordServerData()
                }
                setIsExpanded((currentVal) => !currentVal)
                if (analyticsCategory && isExpanded === false) {
                  trackAction(analyticsCategory, 'Expand VRCFury prefabs box')
                }
              }}>
              {prefabs.length} third-party VRCFury prefab
              {prefabs.length > 1 ? 's' : ''}{' '}
              {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </div>
            {isExpanded ? (
              <>
                <Link
                  to={routes.viewAssetWithVar.replace(
                    ':assetId',
                    vrcFuryAssetId
                  )}>
                  Click here to learn about VRCFury
                </Link>
                <br />
                <div className={classes.prefabs}>
                  {prefabs.map((prefabInfo) => (
                    <div key={prefabInfo.url}>
                      <Button
                        url={prefabInfo.url}
                        icon={<VrcFuryIcon />}
                        color="secondary"
                        onClick={
                          analyticsCategory
                            ? () => {
                                trackAction(
                                  analyticsCategory,
                                  'Click view VRCFury prefab button',
                                  { url: prefabInfo.url }
                                )
                              }
                            : undefined
                        }>
                        View{' '}
                        {getIsDiscordUrl(prefabInfo.url)
                          ? 'Discord'
                          : 'website'}{' '}
                        prefab
                      </Button>
                      {prefabInfo.discordServerId && (
                        <DiscordServerMustJoinNotice
                          discordServerId={prefabInfo.discordServerId}
                          discordServerData={discordServerDatas?.find(
                            (discordServerData) =>
                              discordServerData.id ===
                              prefabInfo.discordServerId
                          )}
                          className={classes.discordNotice}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </>
        ) : null}
      </div>
    </Box>
  )
}

export default VrcFurySettings
