import React, { Fragment, Suspense } from 'react'
import { Helmet } from '@unhead/react/helmet'
import { Switch, Route, useRouteMatch, useParams } from 'react-router'
import List from '@mui/material/List'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import styled from '@emotion/styled'
import { NavLink } from 'react-router-dom'

import {
  Comments as CommentsIcon,
  History as HistoryIcon,
  Queues as QueuesIcon,
  Amendments as AmendmentsIcon,
  Assets as AssetsIcon,
  Notices as NoticesIcon,
  VrchatAvatars as VrchatAvatarsIcon,
  Audit as AuditIcon,
  Reputation as ReputationIcon,
  Dupes as DupesIcon,
  Analytics as AnalyticsIcon,
  Surveys as SurveysIcon,
  Notifications as NotificationsIcon,
  SiteSettings as SiteSettingsIcon,
  Report as ReportIcon,
  Species as SpeciesIcon,
  AssetSync as AssetSyncIcon,
  SupportTickets as SupportTicketsIcon,
} from '@/icons'

import * as routes from '@/routes'
import { UserRoles } from '@/modules/users'

import useUserRecord from '@/hooks/useUserRecord'

import LoadingIndicator from '@/components/loading-indicator'
import NoPermissionMessage from '@/components/no-permission-message'
import ErrorMessage from '@/components/error-message'
import AdminAssets from '@/components/admin-assets'
import AdminAmendments from '@/components/admin-amendments'
import AdminReports from '@/components/admin-reports'
import AdminPublicAvatars from '@/components/admin-public-avatars'
import AdminNotices from '@/components/admin-notices'

import AdminComments from './components/comments'
import AdminHome from './components/home'
import AdminHistory from './components/history'
import AdminSupportTickets from './components/support-tickets'
import AdminQueues from './components/queue'
import AdminAudit from './components/audit'
import AdminDupes from './components/dupes'
import AdminReputation from './components/reputation'
import AdminAnalytics from './components/analytics'
import SiteSettingsForm from './components/site-settings-form'
import AdminSpecies from './components/species'
import AdminNotifications from './components/notifications'
import AdminSurveys from './components/surveys'
import AdminAssetSyncQueue from './components/queue/asset-sync'
import { mediaQueryForTabletsOrBelow } from '@/media-queries'

const drawerWidth = 240

const StyledDrawer = styled.div`
  width: ${drawerWidth}px;
  flex-shrink: 0;
  margin-right: 0.5rem;
  ${mediaQueryForTabletsOrBelow} {
    width: 100%;
    margin-right: 0;
  }
  & ul {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    ${mediaQueryForTabletsOrBelow} {
      flex-direction: row;
    }
  }
`

const StyledListItem = styled.div`
  padding: 0.25rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;
  &:last-child {
    border-bottom: none !important;
  }
  &.active {
    background-color: rgba(0, 0, 0, 0.08);
  }
  ${({ isChild }: { isChild?: boolean }) =>
    isChild ? `margin-left: 1rem;` : ''}
  ${mediaQueryForTabletsOrBelow} {
    margin-right: 0.5rem;
  }
`

const Root = styled.div`
  display: flex;
  ${mediaQueryForTabletsOrBelow} {
    flex-direction: column;
  }
`

const Content = styled.div`
  width: 100%;
`

const StyledListItemIcon = styled(ListItemIcon)`
  ${mediaQueryForTabletsOrBelow} {
    min-width: 20px;
  }
`

interface NavItem {
  subPath: string
  subPaths?: string[]
  label: string
  icon: React.LazyExoticComponent<React.ComponentType<any>>
  component: React.ComponentType
  children?: NavItem[]
}

const navItems: NavItem[] = [
  {
    subPath: '/assets',
    label: 'Assets',
    icon: AssetsIcon,
    component: AdminAssets,
  },
  {
    subPath: '/amendments',
    label: 'Amendments',
    icon: AmendmentsIcon,
    component: AdminAmendments,
  },
  {
    subPath: '/history',
    label: 'History',
    icon: HistoryIcon,
    component: AdminHistory,
  },
  {
    subPath: '/reports',
    label: 'Reports',
    icon: ReportIcon,
    component: AdminReports,
  },
  {
    subPath: '/support-tickets',
    label: 'Support Tickets',
    icon: SupportTicketsIcon,
    component: AdminSupportTickets,
  },
  {
    subPath: '/public-avatars',
    label: 'Public Avatars',
    icon: VrchatAvatarsIcon,
    component: AdminPublicAvatars,
  },
  {
    subPath: '/notices',
    label: 'Notices',
    icon: NoticesIcon,
    component: AdminNotices,
  },
  {
    subPath: '/comments',
    label: 'Comments',
    icon: CommentsIcon,
    component: AdminComments,
  },
  {
    subPath: '/queues',
    label: 'Queues',
    icon: QueuesIcon,
    component: AdminQueues,
    children: [
      {
        subPath: '/queues/asset-sync',
        subPaths: [
          '/queues/asset-sync/:subViewName/page/:pageNumber',
          '/queues/asset-sync/:subViewName',
          '/queues/asset-sync',
        ],
        label: 'Asset Sync',
        icon: AssetSyncIcon,
        component: AdminAssetSyncQueue,
      },
    ],
  },
  {
    subPath: '/audit',
    label: 'Audit',
    icon: AuditIcon,
    component: AdminAudit,
  },
  {
    subPath: '/dupes',
    label: 'Dupes',
    icon: DupesIcon,
    component: AdminDupes,
  },
  {
    subPath: '/reputation',
    label: 'Reputation',
    icon: ReputationIcon,
    component: AdminReputation,
  },
  {
    subPath: '/analytics',
    label: 'Analytics',
    icon: AnalyticsIcon,
    component: AdminAnalytics,
  },
  {
    subPath: '/species',
    label: 'Species',
    icon: SpeciesIcon,
    component: AdminSpecies,
  },
  {
    subPath: '/notifications',
    label: 'Notifications',
    icon: NotificationsIcon,
    component: AdminNotifications,
  },
  {
    subPath: '/surveys',
    label: 'Surveys',
    icon: SurveysIcon,
    component: AdminSurveys,
  },
  {
    subPath: '/settings',
    label: 'Settings',
    icon: SiteSettingsIcon,
    component: SiteSettingsForm,
  },
]

const Menu = () => {
  return (
    <StyledDrawer>
      <List>
        <NavLink
          to={routes.admin}
          exact
          activeClassName="active"
          style={{ textDecoration: 'none', color: 'inherit' }}>
          <StyledListItem
          // activeClassName={classes.active}
          >
            <StyledListItemIcon />
            <ListItemText primary={'Overview'} />
          </StyledListItem>
        </NavLink>
        {navItems.map((item) => (
          <Fragment>
            <NavLink
              key={item.subPath}
              to={`${routes.admin}${item.subPath}`}
              exact
              activeClassName="active"
              style={{ textDecoration: 'none', color: 'inherit' }}>
              <StyledListItem

              // activeClassName={classes.active}
              >
                <StyledListItemIcon>
                  {React.createElement(item.icon)}
                </StyledListItemIcon>
                <ListItemText primary={item.label} />
              </StyledListItem>
            </NavLink>
            {item.children?.map((child) => (
              <NavLink
                key={child.subPath}
                to={`${routes.admin}${child.subPath}`}
                exact
                activeClassName="active"
                style={{ textDecoration: 'none', color: 'inherit' }}>
                <StyledListItem
                  isChild
                  // activeClassName={classes.active}
                >
                  <StyledListItemIcon>
                    {React.createElement(child.icon)}
                  </StyledListItemIcon>
                  <ListItemText primary={child.label} />
                </StyledListItem>
              </NavLink>
            ))}
          </Fragment>
        ))}
      </List>
    </StyledDrawer>
  )
}

const View = () => {
  const [isLoading, lastErrorCode, user] = useUserRecord()
  const routeMatch = useRouteMatch()
  const params = useParams<any>()

  if (isLoading) {
    return <LoadingIndicator message="Loading your user account..." />
  }

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>
        Failed to load your user account (code {lastErrorCode})
      </ErrorMessage>
    )
  }

  if (
    !user ||
    (user.role !== UserRoles.Admin && user.role !== UserRoles.Editor)
  ) {
    return <NoPermissionMessage />
  }

  return (
    <Root>
      <Menu />
      <Content>
        <Suspense
          fallback={<LoadingIndicator message="Loading admin section..." />}>
          <Switch>
            {navItems
              .reduce<NavItem[]>(
                (allChildren, item) =>
                  item.children
                    ? allChildren.concat(item.children)
                    : allChildren,
                []
              )
              .map((item) => (
                <Route
                  key={item.subPath}
                  exact
                  path={
                    item.subPaths
                      ? item.subPaths.map((path) => `${routes.admin}${path}`)
                      : `${routes.admin}${item.subPath}`
                  }
                  component={item.component}
                />
              ))}
            {navItems.map((item) => (
              <Route
                key={item.subPath}
                exact
                path={
                  item.subPaths
                    ? item.subPaths.map((path) => `${routes.admin}${path}`)
                    : `${routes.admin}${item.subPath}`
                }
                component={item.component}
              />
            ))}
            <Route exact path={routes.admin} component={AdminHome} />
            <Route component={() => <>Failed to match</>} />
          </Switch>
        </Suspense>
      </Content>
    </Root>
  )
}

export default () => (
  <>
    <Helmet>
      <title>Admin Area</title>
      <meta name="description" content="Top secret" />
    </Helmet>
    <View />
  </>
)
