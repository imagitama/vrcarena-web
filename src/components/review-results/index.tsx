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

export default ({ reviews = [] }: { reviews?: FullReview[] }) => {
  return (
    <Table>
      <TableHead>
        <TableCell />
        <TableCell>Asset</TableCell>
        <TableCell></TableCell>
        <TableCell>Overall Rating</TableCell>
        <TableCell>Ratings</TableCell>
      </TableHead>
      <TableBody>
        {reviews.map((review) => (
          <TableRow key={review.id}>
            <TableCell>
              <Link
                to={routes.viewReviewWithVar.replace(':reviewId', review.id)}>
                #{getShortId(review.id)}
              </Link>
            </TableCell>
            <TableCell>
              <AssetResultsItem asset={review.assetdata} isTiny />
            </TableCell>
            <TableCell>
              Created by{' '}
              <UsernameLink
                id={review.createdby}
                username={review.createdbyusername}
                avatarUrl={review.createdbyavatarurl}
              />
              <br />
              <FormattedDate date={review.createdat} />
            </TableCell>
            <TableCell>
              <StarRating ratingOutOf5={review.overallrating / 2} />
            </TableCell>
            <TableCell>
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
