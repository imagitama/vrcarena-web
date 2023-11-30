import React, { useEffect, useState } from 'react'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import { makeStyles } from '@material-ui/core/styles'

import { VRCFury as VrcFuryIcon } from '../../icons'
import { VrcFuryPrefabInfo } from '../../modules/assets'
import Button from '../button'
import DiscordServerMustJoinNotice from '../discord-server-must-join-notice'
import { vrcFuryOrange } from '../../config'
import { isDiscordUrl } from '../../utils'
import { CollectionNames, DiscordServer } from '../../modules/discordservers'
import { readRecordsById } from '../../data-store'
import { handleError } from '../../error-handling'
import Box from '../box'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    color: vrcFuryOrange,
    '& svg': {
      fill: vrcFuryOrange,
      width: '1rem',
      height: '1rem',
      marginRight: '0.5rem',
    },
    userSelect: 'none',
  },
  prefabs: {
    marginTop: '0.5rem',
  },
  discordNotice: {
    marginTop: '0.5rem',
  },
})

const VrcFurySettings = ({ prefabs }: { prefabs: VrcFuryPrefabInfo[] }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [discordServerDatas, setDiscordServerDatas] = useState<
    null | DiscordServer[]
  >(null)
  const classes = useStyles()

  const populateDiscordServerData = async () => {
    try {
      const ids = prefabs
        .filter((prefab) => prefab.discordServerId !== undefined)
        .map((prefab) => prefab.discordServerId || '')
      const result = await readRecordsById<DiscordServer>(
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
        <div
          className={classes.title}
          onClick={() => {
            if (discordServerDatas === null) {
              populateDiscordServerData()
            }
            setIsExpanded((currentVal) => !currentVal)
          }}>
          {prefabs.length} third-party VRCFury prefab
          {prefabs.length > 1 ? 's' : ''}{' '}
          {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </div>
        {isExpanded ? (
          <div className={classes.prefabs}>
            {prefabs.map((prefabInfo) => (
              <div key={prefabInfo.url}>
                <Button
                  url={prefabInfo.url}
                  icon={<VrcFuryIcon />}
                  color="default">
                  View {isDiscordUrl(prefabInfo.url) ? 'Discord' : 'website'}{' '}
                  prefab
                </Button>
                {prefabInfo.discordServerId && (
                  <DiscordServerMustJoinNotice
                    discordServerId={prefabInfo.discordServerId}
                    discordServerData={discordServerDatas?.find(
                      (discordServerData) =>
                        discordServerData.id === prefabInfo.discordServerId
                    )}
                    className={classes.discordNotice}
                  />
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Box>
  )
}

export default VrcFurySettings
