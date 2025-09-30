import React, { useRef } from 'react'
import {
  Asset,
  CollectionNames,
  FullAsset,
  ViewNames,
} from '../../modules/assets'
import GenericEditor from '../generic-editor'
import ExperimentalMessage from '../experimental-message'
import Link from '../link'
import { routes } from '@/routes'
import { getCanAssetBePublished } from '@/utils/assets'
import FormControls from '../form-controls'
import PublishAssetButton from '../publish-asset-button'
import Tabs from '../tabs'
import AssetOverview from '../asset-overview'

const AssetEditorMini = ({
  assetId,
  asset,
  onDone,
}: {
  assetId: string
  asset: FullAsset | null | false
  onDone: () => void
}) => {
  if (!asset) {
    return <>Waiting for asset</>
  }

  return (
    <>
      <ExperimentalMessage>
        This is our new experimental "quick" editor to make your life easier. If
        something doesn't work please report it in our Discord and use the{' '}
        <Link to={routes.editAssetWithVar.replace(':assetId', assetId)}>
          old editor
        </Link>
        .
      </ExperimentalMessage>
      {asset && getCanAssetBePublished(asset) && (
        <FormControls>
          <PublishAssetButton
            assetId={assetId}
            asset={asset}
            enableRedirect={false}
          />
        </FormControls>
      )}
      <Tabs
        horizontal
        items={[
          {
            name: 'editor',
            label: 'Editor',
            contents: (
              <GenericEditor
                isAccordion
                startExpanded
                collectionName={CollectionNames.Assets}
                id={assetId}
                onDone={onDone}
                itemTypeSingular="Asset"
                showTopSaveBtn
                scrollToTopOfEditor
              />
            ),
          },
          {
            name: 'preview',
            label: 'Preview',
            contents: <AssetOverview assetId={assetId} />,
          },
        ]}
      />
    </>
  )
}

export default AssetEditorMini
