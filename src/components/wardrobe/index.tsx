import React, { useCallback, useState, useEffect, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Chip, { ChipProps } from '@material-ui/core/Chip'

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
import { AssetFieldNames, AssetCategories } from '../../hooks/useDatabaseQuery'
import useDataStore from '../../hooks/useDataStore'
import useQueryParams from '../../hooks/useQueryParams'
import useStorage from '../../hooks/useStorage'

import * as routes from '../../routes'
import { client as supabase } from '../../supabase'
import { WEBSITE_FULL_URL } from '../../config'
import {
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
import { PublicAsset, RelationType } from '../../modules/assets'

const useStyles = makeStyles({
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
    fontWeight: 100
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
})

const TagChip = ({ tagName, ...props }: { tagName: string } & ChipProps) => (
  <Chip label={tagName} {...props} />
)

type AssetsByArea = { [areaName: string]: PublicAsset[] }

const useAccessories = (): AssetsByArea => {
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
  const [isLoading, isError, assets] = useDataStore<PublicAsset[]>(
    getQuery,
    'wardrobe'
  )

  if (isLoading || isError || !assets) {
    return {}
  }

  const accessoryAreasToUse = isAdultContentEnabled
    ? { ...accessoryAreas, ...nsfwAreas }
    : accessoryAreas

  const assetsByArea = groupAssetsIntoAreas(assets, accessoryAreasToUse)

  return assetsByArea
}

const sortChildrenFirst = (
  assetId: string,
  assets: PublicAsset[]
): PublicAsset[] => {
  const newAssets = [...assets]
  newAssets.sort((assetA, assetB) => {
    return assetA.title.localeCompare(assetB.title)
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

const isAssetAChild = (assetId: string, asset: PublicAsset): boolean =>
  asset.relations &&
  !!asset.relations.find(
    relation =>
      relation.type === RelationType.Parent && relation.asset === assetId
  )

const filterAssetFromExcludedTags = (
  asset: PublicAsset,
  excludedTags: string[]
): boolean => {
  if (!excludedTags.length || !asset.tags || !asset.tags.length) {
    return true
  }

  for (const excludedTag of excludedTags) {
    if (asset.tags.includes(excludedTag)) {
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
}: {
  baseAssetId: string
  areaName: string
  assetsByArea: AssetsByArea
  selectedAssetIds: string[]
  toggleSelectAssetId: (assetId: string) => void
}) => {
  const classes = useStyles()
  const [selectedAssetIdx, setSelectedAssetIdx] = useState(0)
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const [excludedTags, setExcludedTags] = useState<string[]>([])
  const windowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!windowRef.current) {
      return
    }

    try {
      const newLeft = selectedAssetIdx * assetWidth + marginRight

      console.debug(`Scrolling to ${newLeft}...`)

      windowRef.current.scroll({
        top: 0,
        left: newLeft,
        behavior: 'smooth'
      })
    } catch (err) {
      if (
        (err as Error).message &&
        (err as Error).message.includes('scroll is not a function')
      ) {
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

  const includeTag = (tag: string): void => {
    setExcludedTags(currentTags => currentTags.filter(item => item !== tag))
    setSelectedAssetIdx(0)
  }
  const excludeTag = (tag: string): void => {
    setExcludedTags(currentTags => currentTags.concat([tag]))
    setSelectedAssetIdx(0)
  }

  if (!areaInfo) {
    return <ErrorMessage>Failed to find area "{areaName}"</ErrorMessage>
  }

  return (
    <Paper
      className={`${classes.area} ${
        // @ts-ignore
        classes[areaName] ? classes[areaName] : ''
      }`}>
      <div className={classes.areaTitle}>
        <div className={classes.name}>{areaInfo.namePlural}</div>
        <div className={classes.tags}>
          {areaInfo.tags.map(tag => {
            const isExcluded = excludedTags.includes(tag)
            return (
              <TagChip
                key={tag}
                tagName={tag}
                deleteIcon={isExcluded ? <AddIcon /> : undefined}
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
          onClick={selectedAssetIdx > 0 ? () => prevAsset() : undefined}>
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
                        asset.slug || asset.id
                      )}>
                      <div>{asset.title}</div>
                      <div className={classes.subtitle}>
                        by {asset.authorname}
                      </div>
                    </Link>
                  </div>
                  <img src={asset.thumbnailurl} />
                </div>
              )
            })}
          </div>
        </div>
        <div
          className={`${classes.control} ${
            isThereNextAsset ? '' : classes.disabled
          }`}
          onClick={isThereNextAsset ? () => nextAsset() : undefined}>
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
}: {
  baseAssetId: string
  selectedAssetIdsByArea: { [areaName: string]: string[] }
  assetsByArea: AssetsByArea
  removeAssetIdFromArea: (areaName: string, assetId: string) => void
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
            <div>
              {areaName === standardAreaNames.none
                ? standardAreas[areaName].namePlural
                : accessoryAreasToUse[areaName]
                ? accessoryAreasToUse[areaName].namePlural
                : '(no area found)'}
            </div>
            <div className={classes.selectedAssets}>
              {assetIds ? (
                assetIds.map(assetId => {
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
                            asset.slug || asset.id
                          )}>
                          <div>{asset.title}</div>
                          <div className={classes.subtitle}>
                            by {asset.authorname}
                          </div>
                        </Link>
                      </div>
                      <img src={asset.thumbnailurl} />
                    </div>
                  )
                })
              ) : (
                <>Failed: assets are empty</>
              )}
            </div>
          </>
        </div>
      ))}
    </div>
  )
}

const generateUrlFromSelectedAssetIdsByArea = (
  baseAssetId: string,
  selectedAssetIdsByArea: { [areaName: string]: string[] }
): string => {
  const json = JSON.stringify(selectedAssetIdsByArea)
  const base64json = base64EncodeString(json)

  const accessorizeUrl = routes.accessorizeWithVar.replace(
    ':assetId',
    baseAssetId
  )

  const url = `${WEBSITE_FULL_URL}${accessorizeUrl}?i=${base64json}`

  console.debug(`generated URL ${url} from selected asset IDs ${json}`)

  return url
}

type AssetIdsByArea = { [areaName: string]: string[] }

const getSelectedAssetIdsByAreaFromQueryParam = (
  base64json: string
): AssetIdsByArea => {
  const json = parseBase64String(base64json)
  const result = JSON.parse(json)
  console.debug(`parsed ${json} from base64`)
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

export default ({
  assetId,
  baseAsset,
  showThumbnail = true
}: {
  assetId: string
  baseAsset: PublicAsset
  showThumbnail?: boolean
}) => {
  const assetsByArea = useAccessories()
  const classes = useStyles()
  const [selectedAssetIdsByArea, setSelectedAssetIdsByArea] = useState<
    AssetIdsByArea
  >({})
  const [exportedUrl, setExportedUrl] = useState('')
  const queryParams = useQueryParams()
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const [isIntroMessageHidden] = useStorage(storageKeyIsIntroMessageHidden)
  const [isError, setIsError] = useState(false)

  const showIntroMessage = !isIntroMessageHidden

  const toggleSelectAssetIdByArea = (areaName: string, assetId: string) => {
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

      hydrateExportedUrl(newVal)

      return newVal
    })
  }

  const removeAssetIdFromArea = (areaName: string, assetId: string) => {
    setSelectedAssetIdsByArea(currentVal => {
      const newVal = {
        ...currentVal,
        [areaName]: currentVal[areaName].filter(id => id !== assetId)
      }

      hydrateExportedUrl(newVal)

      return newVal
    })
  }

  const hydrateExportedUrl = (
    overrideSelectedAssetIdsByArea?: AssetIdsByArea
  ) => {
    const url = generateUrlFromSelectedAssetIdsByArea(
      assetId,
      overrideSelectedAssetIdsByArea || selectedAssetIdsByArea
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
    <div>
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
              isDisabled={!exportedUrl}
            />{' '}
            <CopyButton text={exportedUrl} />
          </div>
        </FormControls>
      </div>
      <div className={classes.output}>
        <div className={classes.details}>
          {showThumbnail ? (
            <div className={classes.avatarThumbnailWrapper}>
              <img src={baseAsset.thumbnailurl} />
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
              selectedAssetIds={
                selectedAssetIdsByArea[areaName]
                  ? selectedAssetIdsByArea[areaName]
                  : []
              }
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
