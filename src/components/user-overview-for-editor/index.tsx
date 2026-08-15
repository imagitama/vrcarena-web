import { FullUser } from '@/modules/users'
import Tabs from '../tabs'
import UserOverview from '../user-overview'
import UserOverviewContext from '../user-overview/context'

import TabAssets from '../user-overview/components/tab-assets'
import TabComments from '../user-overview/components/tab-comments'
import TabCollection from '../user-overview/components/tab-collection'
import TabWishlist from '../user-overview/components/tab-wishlist'
import TabReviews from '../user-overview/components/tab-reviews'
import TabEndorsements from '../user-overview/components/tab-endorsements'
import TabAttachments from '../user-overview/components/tab-attachments'
import TabHistory from '../user-overview/components/tab-history'
import RepChangeForUser from '../rep-change-for-user'

const UserOverviewForEditor = ({ user }: { user: FullUser }) => {
  return (
    <UserOverviewContext.Provider value={{ userId: user.id, user }}>
      <Tabs
        items={[
          {
            name: 'overview',
            label: 'Non-Staff',
            contents: <UserOverview user={user} />,
          },

          {
            name: 'assets',
            label: 'Comments',
            contents: TabComments,
          },
          {
            name: 'assets',
            label: 'Assets',
            contents: TabAssets,
          },
          {
            name: 'collection',
            label: 'Owned Assets',
            contents: TabCollection,
          },
          {
            name: 'wishlist',
            label: 'Wishlist',
            contents: TabWishlist,
          },
          {
            name: 'reviews',
            label: 'Reviews',
            contents: TabReviews,
          },
          {
            name: 'reviews',
            label: 'Endorsements',
            contents: TabEndorsements,
          },
          {
            name: 'reviews',
            label: 'Attachments',
            contents: TabAttachments,
          },
          {
            name: 'reviews',
            label: 'History',
            contents: TabHistory,
          },
          {
            name: 'reviews',
            label: 'Reputation',
            contents: () => <RepChangeForUser userId={user.id} />,
          },
        ]}
      />
    </UserOverviewContext.Provider>
  )
}

export default UserOverviewForEditor
