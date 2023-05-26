import React, { useCallback, useState, useEffect, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Chip from '@material-ui/core/Chip'

import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import DeleteIcon from '@material-ui/icons/Delete'
import WarningIcon from '@material-ui/icons/Warning'
import Tooltip from '@material-ui/core/Tooltip'
import AddIcon from '@material-ui/icons/Add'

import Link from '../../components/link'

import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import {
  GetFullAssetsFieldNames,
  AssetFieldNames,
  AssetCategories
} from '../../hooks/useDatabaseQuery'
import useDataStore from '../../hooks/useDataStore'
import useQueryParams from '../../hooks/useQueryParams'
import useStorage from '../../hooks/useStorage'

import * as routes from '../../routes'
import { client as supabase } from '../../supabase'
import { WEBSITE_FULL_URL } from '../../config'
import {
  getAreasForAsset,
  groupAssetsIntoAreas,
  standardAreaNames,
  standardAreas
} from '../../areas'
import accessoryAreas, {
  areaNames,
  nsfwAreas,
  nsfwAreaNames
} from '../../areas/accessory'

import Button from '../../components/button'
import TextInput from '../../components/text-input'
import FormControls from '../../components/form-controls'
import Message from '../../components/message'
import CopyButton from '../../components/copy-button'
import { handleError } from '../../error-handling'
import ErrorMessage from '../error-message'
import Paper from '../paper'
import { base64EncodeString, parseBase64String } from '../../utils'

const useStyles = makeStyles(theme => ({
  output: {
    marginTop: '1rem',
    '& *::-webkit-scrollbar': {
      width: '10px'
    },
    '& *::-webkit-scrollbar-track': {
      background: 'transparent'
    },
    '& *::-webkit-scrollbar-thumb': {
      background: '#7a7a7a',
      borderRadius: '5px'
    }
  },
  details: {
    display: 'flex',
    marginBottom: '1rem'
  },
  waitingForSelection: {
    width: '100%',
    padding: '2rem 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& span': {
      textAlign: 'center',
      fontStyle: 'italic'
    }
  },
  avatarThumbnailWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '1rem',
    justifyContent: 'center',
    '& img': {
      width: '300px',
      height: '300px'
    }
  },
  areas: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  area: {
    width: '100%',
    marginBottom: '2rem',
    position: 'relative'
  },
  areaTitle: {
    display: 'flex',
    alignItems: 'center'
  },
  name: {
    width: '100%',
    fontSize: '125%',
    marginBottom: '0.25rem',
    fontWeight: '100'
  },
  input: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  control: {
    height: '100%',
    padding: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  disabled: {
    cursor: 'default',
    opacity: '0.25'
  },
  leftButton: {},
  window: {
    width: '100%',
    height: '320px',
    overflow: 'hidden',
    overflowX: 'auto',
    position: 'relative'
  },
  assets: {
    display: 'flex',
    position: 'absolute',
    top: 0,
    left: 0,
    transition: 'all 100ms'
  },
  asset: {
    width: '300px',
    height: '300px',
    border: '2px solid #000',
    borderRadius: '3px',
    overflow: 'hidden',
    marginRight: '3px',
    position: 'relative',
    '& img': {
      width: '100%',
      height: '100%'
    }
  },
  selected: {
    borderColor: 'yellow'
  },
  small: {
    width: '150px',
    height: '150px',
    marginRight: '0.25rem',
    '& $icon': {
      padding: '0.5rem',
      fontSize: '100%'
    },
    '& $incompatibleWarning': {
      padding: '0.5rem'
    }
  },
  meta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    padding: '0.5rem',
    textShadow: '1px 1px 1px #000',
    '& a': {
      color: '#FFF'
    }
  },
  subtitle: {
    fontSize: '50%'
  },
  noResultsMessage: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: '0.5'
  },
  icons: {
    position: 'absolute',
    top: 0,
    right: 0
  },
  icon: {
    padding: '1rem',
    fontSize: '200%',
    cursor: 'pointer',
    display: 'flex',
    '& svg': {
      filter: 'drop-shadow(1px 1px 1px #000)'
    }
  },
  selectedAreas: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'start'
  },
  selectedArea: {
    padding: '0.5rem',
    margin: '0 0.5rem 0.5rem 0',
    background: 'rgb(100, 100, 100)',
    borderRadius: '3px'
  },
  selectedAssets: {
    display: 'flex'
  },
  exportWrapper: {
    marginTop: '0.5rem',
    display: 'flex',
    '& > *:first-child': {
      marginRight: '0.5rem'
    }
  },
  incompatibleWarning: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: '1rem',
    color: '#ffeb00', // not standard but yolo
    textShadow: '1px 1px 1px #000',
    '& svg': {
      filter: 'drop-shadow(1px 1px 1px #000)'
    },
    cursor: 'default'
  },
  incompatibleWarningText: {
    display: 'flex',
    alignItems: 'center'
  },
  // tags
  tags: {
    display: 'flex'
  },
  tag: {
    margin: '0 0.25rem 0.25rem 0',
    '&, &:focus': {
      background: 'none'
    }
  },
  excluded: {
    opacity: '0.5'
  },
  welcomeMessage: {
    textAlign: 'center',
    fontSize: '150%',
    display: 'flex',
    alignItems: 'center',
    '& > :first-child': {
      width: '100%'
    }
  }
}))

const TagChip = ({ tagName, ...props }) => <Chip label={tagName} {...props} />

const useAccessories = () => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getQuery = useCallback(() => {
    let query = supabase
      .from('getPublicAssets'.toLowerCase())
      .select('*')
      .eq(AssetFieldNames.category, AssetCategories.accessory)

    query =
      isAdultContentEnabled === false
        ? query.is(AssetFieldNames.isAdult, false)
        : query

    return query
  }, [isAdultContentEnabled])
  const [isLoading, isError, assets] = useDataStore(getQuery, 'wardrobe')

  if (isLoading || isError || !assets) {
    return {}
  }

  const accessoryAreasToUse = isAdultContentEnabled
    ? { ...accessoryAreas, ...nsfwAreas }
    : accessoryAreas

  const assetsByArea = groupAssetsIntoAreas(assets, accessoryAreasToUse)

  return assetsByArea
}

const sortChildrenFirst = (assetId, assets) => {
  const newAssets = [...assets]
  newAssets.sort((assetA, assetB) => {
    return assetA[AssetFieldNames.title].localeCompare(
      assetB[AssetFieldNames.title]
    )
  })
  newAssets.sort((assetA, assetB) => {
    if (isAssetAChild(assetId, assetA)) {
      if (isAssetAChild(assetId, assetB)) {
        return 0
      }

      return -1
    }
    return 1
  })
  return newAssets
}

const isAssetAChild = (assetId, asset) =>
  asset[AssetFieldNames.children] &&
  asset[AssetFieldNames.children].includes(assetId)

const filterAssetFromExcludedTags = (asset, excludedTags) => {
  if (
    !excludedTags.length ||
    !asset[AssetFieldNames.tags] ||
    !asset[AssetFieldNames.tags].length
  ) {
    return true
  }

  for (const excludedTag of excludedTags) {
    if (asset[AssetFieldNames.tags].includes(excludedTag)) {
      return false
    }
  }

  return true
}

const assetWidth = 300
const marginRight = 5

const Area = ({
  baseAssetId,
  areaName,
  assetsByArea,
  selectedAssetIds: selectedAssetIdsFromParent,
  toggleSelectAssetId
}) => {
  const classes = useStyles()
  const [selectedAssetIdx, setSelectedAssetIdx] = useState(0)
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const [excludedTags, setExcludedTags] = useState([])
  const windowRef = useRef()

  useEffect(() => {
    if (!windowRef.current) {
      return
    }

    try {
      windowRef.current.scroll({
        top: 0,
        left: selectedAssetIdx * assetWidth + marginRight,
        behavior: 'smooth'
      })
    } catch (err) {
      if (err.message.includes('scroll is not a function')) {
        // modern browsers allow you to scroll inside an Element: https://developer.mozilla.org/en-US/docs/Web/API/Element/scroll
        return
      }
      throw err
    }
  }, [selectedAssetIdx])

  const assetsInArea = assetsByArea[areaName] || []

  const prevAsset = () => setSelectedAssetIdx(currentIdx => currentIdx - 1)
  const nextAsset = () => setSelectedAssetIdx(currentIdx => currentIdx + 1)

  const selectedAssetIds = selectedAssetIdsFromParent || []

  const accessoryAreasToUse = isAdultContentEnabled
    ? { ...accessoryAreas, ...nsfwAreas }
    : accessoryAreas
  const areaInfo =
    areaName === standardAreaNames.none
      ? standardAreas[areaName]
      : accessoryAreasToUse[areaName]

  const assetsInAreaWithChildrenFirst = sortChildrenFirst(
    baseAssetId,
    assetsInArea
  )

  const assetsToRender = assetsInAreaWithChildrenFirst.filter(asset =>
    filterAssetFromExcludedTags(asset, excludedTags)
  )

  const isTherePrevAsset = selectedAssetIdx > 0
  const isThereNextAsset = selectedAssetIdx < assetsToRender.length - 1

  const includeTag = tag => {
    setExcludedTags(currentTags => currentTags.filter(item => item !== tag))
    setSelectedAssetIdx(0)
  }
  const excludeTag = tag => {
    setExcludedTags(currentTags => currentTags.concat([tag]))
    setSelectedAssetIdx(0)
  }

  if (!areaInfo) {
    return <ErrorMessage>Failed to find area "{areaName}"</ErrorMessage>
  }

  return (
    <Paper className={`${classes.area} ${classes[areaName]}`}>
      <div className={classes.areaTitle}>
        <div className={classes.name}>{areaInfo.namePlural}</div>
        <div className={classes.tags}>
          {areaInfo.tags.map(tag => {
            const isExcluded = excludedTags.includes(tag)
            return (
              <TagChip
                key={tag}
                tagName={tag}
                deleteIcon={isExcluded ? <AddIcon /> : null}
                onDelete={
                  isExcluded ? () => includeTag(tag) : () => excludeTag(tag)
                }
                className={`${classes.tag} ${
                  isExcluded ? classes.excluded : ''
                }`}
              />
            )
          })}
        </div>
      </div>
      <div className={classes.input}>
        <div
          className={`${classes.control} ${
            isTherePrevAsset ? '' : classes.disabled
          }`}
          onClick={selectedAssetIdx > 0 ? () => prevAsset() : null}>
          <ChevronLeftIcon />
        </div>
        <div className={classes.window} ref={windowRef}>
          <div className={classes.assets}>
            {assetsToRender.map(asset => {
              const isSelected = selectedAssetIds.includes(asset.id)
              return (
                <div
                  className={`${classes.asset} ${
                    isSelected ? classes.selected : ''
                  }`}
                  key={asset.id}>
                  {!isAssetAChild(baseAssetId, asset) ? (
                    <div className={classes.incompatibleWarning}>
                      <Tooltip title={incompatibleWarningMessage}>
                        <div className={classes.incompatibleWarningText}>
                          <WarningIcon />
                        </div>
                      </Tooltip>
                    </div>
                  ) : null}
                  <div className={classes.icons}>
                    <div
                      className={classes.icon}
                      onClick={() => toggleSelectAssetId(asset.id)}>
                      {isSelected ? (
                        <CheckBoxIcon />
                      ) : (
                        <CheckBoxOutlineBlankIcon />
                      )}
                    </div>
                  </div>
                  <div className={classes.meta}>
                    <Link
                      to={routes.viewAssetWithVar.replace(
                        ':assetId',
                        asset.id
                      )}>
                      <div className={classes.title}>
                        {asset[AssetFieldNames.title]}
                      </div>
                      <div className={classes.subtitle}>
                        by {asset[GetFullAssetsFieldNames.authorName]}
                      </div>
                    </Link>
                  </div>
                  <img src={asset[AssetFieldNames.thumbnailUrl]} />
                </div>
              )
            })}
          </div>
        </div>
        <div
          className={`${classes.control} ${
            isThereNextAsset ? '' : classes.disabled
          }`}
          onClick={isThereNextAsset ? () => nextAsset() : null}>
          <ChevronRightIcon />
        </div>
      </div>
    </Paper>
  )
}

const incompatibleWarningMessage =
  'This accessory has not been linked to your avatar so the author cannot guarantee it is compatible'

const SelectedAssets = ({
  baseAssetId,
  selectedAssetIdsByArea,
  assetsByArea,
  removeAssetIdFromArea
}) => {
  const classes = useStyles()
  const isAdultContentEnabled = useIsAdultContentEnabled()

  const accessoryAreasToUse = isAdultContentEnabled
    ? { ...accessoryAreas, ...nsfwAreas }
    : accessoryAreas

  const entries = Object.entries(selectedAssetIdsByArea)
  const numberOfSelectedAssets = entries.reduce(
    (tally, [, assetIds]) => tally + assetIds.length,
    0
  )

  if (numberOfSelectedAssets === 0) {
    return (
      <div className={classes.waitingForSelection}>
        <span>Select an accessory to get started</span>
      </div>
    )
  }

  return (
    <div className={classes.selectedAreas}>
      {entries.map(([areaName, assetIds]) => (
        <div key={areaName} className={classes.selectedArea}>
          <>
            <div className={classes.selectedAreaTitle}>
              {areaName === standardAreaNames.none
                ? standardAreas[areaName].namePlural
                : accessoryAreasToUse[areaName]
                ? accessoryAreasToUse[areaName].namePlural
                : '(no area found)'}
            </div>
            <div className={classes.selectedAssets}>
              {assetIds.map(assetId => {
                const assetsInArea = assetsByArea[areaName]

                if (!assetsInArea) {
                  return 'No assets in area'
                }

                const asset = assetsInArea.find(asset => asset.id === assetId)

                if (!asset) {
                  return 'No asset found'
                }

                return (
                  <div
                    className={`${classes.asset} ${classes.small}`}
                    key={assetId}>
                    {!isAssetAChild(baseAssetId, asset) ? (
                      <div className={classes.incompatibleWarning}>
                        <Tooltip title={incompatibleWarningMessage}>
                          <div className={classes.incompatibleWarningText}>
                            <WarningIcon />
                          </div>
                        </Tooltip>
                      </div>
                    ) : null}
                    <div className={classes.icons}>
                      <div
                        className={classes.icon}
                        onClick={() =>
                          removeAssetIdFromArea(areaName, asset.id)
                        }>
                        <DeleteIcon />
                      </div>
                    </div>
                    <div className={classes.meta}>
                      <Link
                        to={routes.viewAssetWithVar.replace(
                          ':assetId',
                          asset.id
                        )}>
                        <div className={classes.title}>
                          {asset[AssetFieldNames.title]}
                        </div>
                        <div className={classes.subtitle}>
                          by {asset[GetFullAssetsFieldNames.authorName]}
                        </div>
                      </Link>
                    </div>
                    <img src={asset[AssetFieldNames.thumbnailUrl]} />
                  </div>
                )
              })}
            </div>
          </>
        </div>
      ))}
    </div>
  )
}

const generateUrlFromSelectedAssetIdsByArea = (
  baseAssetId,
  selectedAssetIdsByArea
) => {
  const json = JSON.stringify(selectedAssetIdsByArea)
  const base64json = base64EncodeString(json)

  const accessorizeUrl = routes.accessorizeWithVar.replace(
    ':assetId',
    baseAssetId
  )

  const url = `${WEBSITE_FULL_URL}${accessorizeUrl}?i=${base64json}`

  return url
}

const getSelectedAssetIdsByAreaFromQueryParam = base64json => {
  const result = parseBase64String(base64json)
  return result
}

const storageKeyIsIntroMessageHidden = 'isAccessorizeIntroMessageHidden'

const IntroMessage = () => {
  const [, setIsIntroMessageHidden] = useStorage(storageKeyIsIntroMessageHidden)
  const classes = useStyles()

  return (
    <Message>
      <div className={classes.welcomeMessage}>
        <div>
          Use this tool to choose accessories for your avatar then share it with
          your friends
        </div>
        <Button onClick={() => setIsIntroMessageHidden(true)}>Hide</Button>
      </div>
    </Message>
  )
}

export default ({ assetId, baseAsset, showThumbnail = true }) => {
  const assetsByArea = useAccessories(assetId)
  const classes = useStyles()
  const [selectedAssetIdsByArea, setSelectedAssetIdsByArea] = useState({})
  const [exportedUrl, setExportedUrl] = useState('')
  const queryParams = useQueryParams()
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const [isIntroMessageHidden] = useStorage(storageKeyIsIntroMessageHidden)
  const [isError, setIsError] = useState(false)

  const showIntroMessage = !isIntroMessageHidden

  const toggleSelectAssetIdByArea = (areaName, assetId) => {
    setSelectedAssetIdsByArea(currentVal => {
      const newVal = { ...currentVal }

      if (!(areaName in newVal)) {
        newVal[areaName] = []
      }

      if (newVal[areaName].includes(assetId)) {
        newVal[areaName] = newVal[areaName].filter(id => id !== assetId)
      } else {
        newVal[areaName] = newVal[areaName].concat([assetId])
      }

      return newVal
    })
    exportUrl()
  }

  const removeAssetIdFromArea = (areaName, assetId) => {
    setSelectedAssetIdsByArea(currentVal => ({
      ...currentVal,
      [areaName]: currentVal[areaName].filter(id => id !== assetId)
    }))
    exportUrl()
  }

  const exportUrl = () => {
    const url = generateUrlFromSelectedAssetIdsByArea(
      assetId,
      selectedAssetIdsByArea
    )
    setExportedUrl(url)
  }

  useEffect(() => {
    const importValue = queryParams.get('i')

    if (!importValue) {
      return
    }

    try {
      setIsError(false)
      const parsedResult = getSelectedAssetIdsByAreaFromQueryParam(importValue)
      setSelectedAssetIdsByArea(parsedResult)
      setExportedUrl(
        generateUrlFromSelectedAssetIdsByArea(assetId, parsedResult)
      )
    } catch (err) {
      setIsError(true)
      console.error(err)
      handleError(err)
    }
  }, [])

  const areaNamesToUse = isAdultContentEnabled
    ? { ...areaNames, ...nsfwAreaNames }
    : areaNames

  return (
    <div className={classes.root}>
      <div>
        {isError ? (
          <ErrorMessage>
            An error occurred trying to load that warddrobe. Please try again.
          </ErrorMessage>
        ) : null}
        {showIntroMessage ? <IntroMessage /> : null}
        <FormControls>
          <div className={classes.exportWrapper}>
            <TextInput
              value={
                exportedUrl ||
                'Select an accessory to generate a unique URL to share with your friends'
              }
              size="small"
              fullWidth
              disabled={!exportUrl}
            />{' '}
            <CopyButton text={exportUrl} />
          </div>
        </FormControls>
      </div>
      <div className={classes.output}>
        <div className={classes.details}>
          {showThumbnail ? (
            <div className={classes.avatarThumbnailWrapper}>
              <img src={baseAsset[AssetFieldNames.thumbnailUrl]} />
            </div>
          ) : null}
          <SelectedAssets
            baseAssetId={assetId}
            selectedAssetIdsByArea={selectedAssetIdsByArea}
            assetsByArea={assetsByArea}
            removeAssetIdFromArea={removeAssetIdFromArea}
          />
        </div>
        <div className={classes.areas}>
          {Object.entries(areaNamesToUse).map(([areaName]) => (
            <Area
              key={areaName}
              baseAssetId={assetId}
              areaName={areaName}
              assetsByArea={assetsByArea}
              baseAsset={baseAsset}
              selectedAssetIds={selectedAssetIdsByArea[areaName]}
              toggleSelectAssetId={assetId =>
                toggleSelectAssetIdByArea(areaName, assetId)
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}
