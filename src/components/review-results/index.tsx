import React from 'react'

import { FullReview } from '@/modules/reviews'
import ReviewResultsItem from '@/components/review-results-item'
import Table, {
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../responsive-table'
import GenericOutputItem from '../generic-output-item'
import AssetResultsItem from '../asset-results-item'
import FormattedDate from '../formatted-date'
import UsernameLink from '../username-link'
import StarRating from '../star-rating'
import ShortId from '../short-id'
import { allowedRatings } from '@/ratings'
import Tooltip from '../tooltip'
import { routes } from '@/routes'
import Link from '../link'
import { getShortId } from '@/utils/formatting'
import NoValueLabel from '../no-value-label'

export default ({
  reviews = [],
  showAsset = true,
}: {
  reviews?: FullReview[]
  showAsset?: boolean
}) => {
  return (
    <Table>
      <TableHead>
        <TableCell width="10%" />
        {showAsset && <TableCell width="25%">Asset</TableCell>}
        <TableCell width={showAsset ? '20%' : '45%'}></TableCell>
        <TableCell width="20%">Overall Rating</TableCell>
        <TableCell width="20%">Ratings</TableCell>
      </TableHead>
      <TableBody>
        {reviews.map((review) => (
          <TableRow key={review.id}>
            <TableCell width="10%">
              <Link
                to={routes.viewReviewWithVar.replace(':reviewId', review.id)}>
                #{getShortId(review.id)}
              </Link>
            </TableCell>
            {showAsset && (
              <TableCell label="Asset" width="25%">
                <AssetResultsItem asset={review.assetdata} isTiny />
              </TableCell>
            )}
            <TableCell width={showAsset ? '20%' : '45%'}>
              Created by{' '}
              <UsernameLink
                id={review.createdby}
                username={review.createdbyusername}
                avatarUrl={review.createdbyavatarurl}
              />
              <br />
              <FormattedDate date={review.createdat} />
            </TableCell>
            <TableCell label="Overall Rating" width="20%">
              <StarRating ratingOutOf5={review.overallrating / 2} />
            </TableCell>
            <TableCell label="Ratings" width="20%">
              {review.ratings.length ? (
                review.ratings.map((rating) => {
                  const ratingMeta = allowedRatings.find(
                    (item) => item.name === rating.name
                  )!
                  return (
                    <div key={rating.name}>
                      <Tooltip title={ratingMeta.description}>
                        <span>{ratingMeta.title}</span>
                      </Tooltip>
                      <StarRating ratingOutOf5={rating.rating} />
                    </div>
                  )
                })
              ) : (
                <NoValueLabel>-</NoValueLabel>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
