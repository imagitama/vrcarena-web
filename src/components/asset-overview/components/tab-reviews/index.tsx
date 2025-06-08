import React, { useContext, useState } from 'react'
import CreateIcon from '@material-ui/icons/Create'

import useIsLoggedIn from '../../../../hooks/useIsLoggedIn'

import ReviewsForAsset from '../../../reviews-for-asset'
import ReviewResults from '../../../review-results'
import Button from '../../../button'
import AddReviewForm from '../../../add-review-form'
import FormControls from '../../../form-controls'

import TabContext from '../../context'

export default () => {
  const { assetId, isLoading, hydrate } = useContext(TabContext)
  const isLoggedIn = useIsLoggedIn()
  const [isAddReviewFormVisible, setIsAddReviewFormVisible] = useState(false)

  return (
    <>
      {isLoading ? (
        <ReviewResults shimmer />
      ) : (
        <ReviewsForAsset assetId={assetId} />
      )}
      {isAddReviewFormVisible ? (
        <>
          <AddReviewForm assetId={assetId} onDone={() => hydrate()} />
        </>
      ) : (
        <FormControls>
          <Button
            size="large"
            icon={<CreateIcon />}
            onClick={
              isLoggedIn ? () => setIsAddReviewFormVisible(true) : undefined
            }
            isDisabled={isLoading || !isLoggedIn}>
            {isLoggedIn ? 'Add Your Review' : 'Log in to add your review'}
          </Button>
        </FormControls>
      )}
    </>
  )
}
