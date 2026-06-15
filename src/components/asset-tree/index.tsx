import styled from '@emotion/styled'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import LinkIcon from '@mui/icons-material/Link'

import {
  Asset,
  AssetCategory,
  FullAsset,
  GetMentionsResult,
  Relation,
  RelationType,
  ViewNames,
} from '@/modules/assets'
import { routes } from '@/routes'
import { mediaQueryForTabletsOrBelow } from '@/media-queries'
import { VRCArenaTheme } from '@/themes'

import useIsAdultContentEnabled from '@/hooks/useIsAdultContentEnabled'
import useDatabaseQuery, { Operators } from '@/hooks/useDatabaseQuery'

import AssetResultsItem from '@/components/asset-results-item'
import ErrorMessage from '@/components/error-message'
import LoadingIndicator from '@/components/loading-indicator'
import Link from '@/components/link'
import { TabName } from '@/components/asset-overview/tabs'
import Button from '@/components/button'
import AssetsByArea from '@/components/assets-by-area'

const Root = styled.div``
const Items = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
`

// const HorizontalLine = styled.div`
//   position: absolute;
//   top: 0.5rem;
//   left: calc(50px + 1rem);
//   height: 2px;
//   background-color: #737373;
// `

const VerticalLineWrapper = styled.div`
  position: absolute;
  top: 0px;
  width: 100%;
  display: flex;
  justify-content: center;
  & span {
    color: #737373;
    text-transform: uppercase;
    font-size: 75%;
  }
`

const VerticalLine = styled.div`
  width: 2px;
  height: 1rem;
  position: absolute;
  top: 0;
  left: 50%;
  background: linear-gradient(
    ${({ bottom }) => (bottom ? '180deg' : '0deg')},
    #737373 50%,
    rgba(255, 255, 255, 0) 100%
  );
  ${({ bottom }: { bottom?: boolean }) =>
    bottom ? `top: auto; bottom: -1rem;` : undefined}
`

const Connector = styled.div`
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  margin-left: ${({ flip }: { flip?: boolean }) => (flip ? `0` : '-1rem')};
  border-radius: 0
    ${({ theme }) => (theme as VRCArenaTheme).shape.borderRadius * 2}px 0 0;
  z-index: -5;
  position: absolute;
  left: 50%;
  top: 0;
  border: 2px solid #737373;
  border-bottom: none;
  border-left: none;
  ${({ flip }: { flip?: boolean }) =>
    flip ? `transform: scaleX(-1);` : undefined}
`

const Item = styled.div`
  width: 100px; /* align with tiny asset-results-item */
  position: relative;
  margin: 0.5rem;
  padding-top: 1rem;
  [${mediaQueryForTabletsOrBelow}]: {
    margin: 0.25rem;
  }
`
const ParentItem = styled(Item)`
  padding-top: 0;
  margin-bottom: 0;
`
const PrimaryItem = styled(Item)`
  margin-top: 0;
  width: auto; /* align with tiny asset-results-item */
`

const ShowMoreCard = styled(Card)`
  height: 100%;
  & > a {
    color: inherit;
  }
`
const ShowMoreCardActionArea = styled(CardActionArea)`
  width: 100%;
  height: 100%;
  padding: 0.5rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ParentOverviewWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const ParentOverview = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.25); /* TODO: use theme */
  border-radius: ${({ theme }) =>
    (theme as VRCArenaTheme).shape.borderRadius}px;
  padding: 0.5rem;
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  > *:nth-child(1) {
    margin: 0 1rem;
  }
`

const Children = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
`

type RelationAndAsset = [Relation, Asset]

export const FullAssetTree = ({ activeAsset }: { activeAsset: FullAsset }) => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const [isLoading, lastErrorCode, results] =
    useDatabaseQuery<GetMentionsResult>(ViewNames.GetMentions, [
      ['assetid', Operators.EQUALS, activeAsset.id],
    ])

  if (lastErrorCode !== null) {
    return <ErrorMessage>Failed to load mentions: {lastErrorCode}</ErrorMessage>
  }

  if (isLoading || !results) {
    return <LoadingIndicator message="Loading all relations..." />
  }

  return (
    <>
      <ParentOverviewWrapper>
        <ParentOverview>
          Viewing relations for
          <AssetResultsItem asset={activeAsset} isTiny />
          <Button
            url={routes.viewAssetWithVar.replace(':assetId', activeAsset.id)}
            color="secondary"
            hollow={false}>
            Return To Asset
          </Button>
        </ParentOverview>
      </ParentOverviewWrapper>
      {Object.values(AssetCategory).map((category) => (
        <>
          <AssetsByArea
            assets={results
              .filter((result) => result.assetdata.category === category)
              .filter(
                (result) =>
                  result.assetdata.isadult !== true || isAdultContentEnabled
              )
              .map((result) => result.assetdata)}
            categoryName={category}
          />
        </>
      ))}
    </>
  )
}

const AssetTree = ({ activeAsset }: { activeAsset: FullAsset }) => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const {
    mentionsdata: mentionsIncludingAdult,
    mentionstotal: mentionsTotal,
    relations: activeAssetRelations,
    relationsdata: relationsData,
  } = activeAsset

  const mentions = !isAdultContentEnabled
    ? mentionsIncludingAdult.filter((mention) => mention.asset.isadult !== true)
    : mentionsIncludingAdult

  const activeAssetRelationAssets: RelationAndAsset[] =
    activeAssetRelations?.reduce<RelationAndAsset[]>((children, relation) => {
      const asset = relationsData.find((asset) => asset.id === relation.asset)

      if (asset) {
        return children.concat([[relation, asset]])
      }

      return children
    }, []) || []

  const parents = activeAssetRelationAssets.filter(
    ([relation]) => relation.type === RelationType.Parent
  )
  const nonParents = mentions
    .filter((mention) => mention.relation.type === RelationType.Parent)
    .map<RelationAndAsset>((mention) => [mention.relation, mention.asset])

  // const shownItemsCount = Math.min(nonParents.length, 5)

  return (
    <Root>
      {parents.length ? (
        <Items>
          {parents.map(([relation, asset]) => (
            <ParentItem key={relation.asset}>
              <AssetResultsItem asset={asset} isTiny />
            </ParentItem>
          ))}
        </Items>
      ) : null}
      <Items>
        <PrimaryItem style={{ paddingTop: parents.length ? undefined : 0 }}>
          {parents.length > 0 && <VerticalLine />}
          <AssetResultsItem asset={activeAsset} />
          {nonParents.length > 0 && <VerticalLine bottom />}
        </PrimaryItem>
      </Items>
      {nonParents.length ? (
        <Children>
          <Items>
            {/* <HorizontalLine
              style={{
                width: `calc(${(shownItemsCount - 1) * 100}px + ${
                  (shownItemsCount - 1) * 1
                }rem - 1rem)`,
              }}
            /> */}
            {nonParents.slice(0, 5).map(([relation, asset], index) => (
              <Item key={relation.asset}>
                {/* {index === 0 ? <Connector flip /> : null} */}
                {/* {index === shownItemsCount - 1 ? (
                  <Connector />
                ) : index > 0 ? (
                  <VerticalLine />
                ) : null} */}
                {/* <VerticalLineWrapper>
                  <span>
                    <LinkIcon /> {relation.type}
                  </span>
                  <VerticalLine />
                </VerticalLineWrapper> */}
                <VerticalLine />
                <AssetResultsItem
                  asset={asset}
                  isTiny
                  showCategory={false}
                  relation={{
                    ...relation,
                    label:
                      relation.type === RelationType.Parent
                        ? 'Child'
                        : undefined,
                  }}
                />
              </Item>
            ))}
            {mentionsTotal > nonParents.length && (
              <Item>
                <ShowMoreCard>
                  <Link
                    to={routes.viewAssetWithVarAndTabVar
                      .replace(':assetId', activeAsset.id)
                      .replace(':tabName', TabName.Relations)}>
                    <ShowMoreCardActionArea>
                      View {mentionsTotal - nonParents.length} more...
                    </ShowMoreCardActionArea>
                  </Link>
                </ShowMoreCard>
              </Item>
            )}
          </Items>
        </Children>
      ) : null}
    </Root>
  )
}

export default AssetTree
