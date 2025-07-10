import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'

import * as routes from '../../routes'
import NoPermissionMessage from '../../components/no-permission-message'
import { CollectionNames } from '../../modules/reviews'
import usePermissions from '../../hooks/usePermissions'
import AddReviewForm from '../../components/add-review-form'
import AssetSearch from '../../components/asset-search'
import { Asset } from '../../modules/assets'
import AssetResultsItem from '../../components/asset-results-item'

const CreateView = () => {
  const [selectedAsset, setSelectedAsset] = useState<null | Asset>(null)

  if (!selectedAsset) {
    return <AssetSearch onSelect={(asset) => setSelectedAsset(asset)} />
  }

  return (
    <>
      <AssetResultsItem asset={selectedAsset} />
      <br />
      <AddReviewForm assetId={selectedAsset.id} />
    </>
  )
}

const View = () => {
  const { reviewId } = useParams<{ reviewId: string }>()
  const isCreating = !reviewId || reviewId === 'create'

  if (
    !usePermissions(isCreating ? routes.createReview : routes.editReviewWithVar)
  ) {
    return <NoPermissionMessage />
  }

  if (isCreating) {
    return (
      <>
        <Heading variant="h1">Create Review</Heading>
        <CreateView />
      </>
    )
  }

  return (
    <>
      <Heading variant="h1">{isCreating ? 'Create' : 'Edit'} Review</Heading>
      <GenericEditor
        collectionName={CollectionNames.Reviews}
        id={isCreating ? undefined : reviewId}
        analyticsCategory={isCreating ? 'CreateReview' : 'EditReview'}
        saveBtnAction="Click save review button"
        viewBtnAction="Click view item button after save"
        cancelBtnAction="Click cancel button"
        successUrl={routes.viewReviewWithVar.replace(':reviewId', reviewId)}
        getSuccessUrl={(newId) =>
          routes.viewReviewWithVar.replace(':reviewId', newId || reviewId)
        }
        cancelUrl={
          isCreating
            ? routes.reviews
            : routes.viewReviewWithVar.replace(':reviewId', reviewId)
        }
      />
    </>
  )
}

export default () => {
  const { reviewId } = useParams<{ reviewId: string }>()
  const isCreating = !reviewId || reviewId === 'create'

  return (
    <>
      <Helmet>
        <title>{isCreating ? 'Create' : 'Edit'} an review | VRCArena</title>
        <meta
          name="description"
          content={`Use this form to ${
            isCreating ? 'create' : 'edit'
          } an review.`}
        />
      </Helmet>
      <View />
    </>
  )
}
