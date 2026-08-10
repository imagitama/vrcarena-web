import React, { Fragment, Suspense } from 'react'
import { Helmet } from '@unhead/react/helmet'
import { Switch, Route, useRouteMatch, useParams } from 'react-router'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
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

import Heading from '@/components/heading'
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

const drawerWidth = 240

const StyledDrawer = styled.div`
  width: ${drawerWidth}px;
  flex-shrink: 0;
  margin-right: 0.5rem;
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
`

const Root = styled.div`
  display: flex;
`

const Content = styled.div`
  width: 100%;
`

interface NavItem {
  path: string
  label: string
  icon: React.LazyExoticComponent<React.ComponentType<any>>
  component: React.ComponentType
  children?: NavItem[]
}

const navItems: NavItem[] = [
  {
    path: '/assets',
    label: 'Assets',
    icon: AssetsIcon,
    component: AdminAssets,
  },
  {
    path: '/amendments',
    label: 'Amendments',
    icon: AmendmentsIcon,
    component: AdminAmendments,
  },
  {
    path: '/history',
    label: 'History',
    icon: HistoryIcon,
    component: AdminHistory,
  },
  {
    path: '/reports',
    label: 'Reports',
    icon: ReportIcon,
    component: AdminReports,
  },
  {
    path: '/support-tickets',
    label: 'Support Tickets',
    icon: SupportTicketsIcon,
    component: AdminSupportTickets,
  },
  {
    path: '/public-avatars',
    label: 'Public Avatars',
    icon: VrchatAvatarsIcon,
    component: AdminPublicAvatars,
  },
  {
    path: '/notices',
    label: 'Notices',
    icon: NoticesIcon,
    component: AdminNotices,
  },
  {
    path: '/comments',
    label: 'Comments',
    icon: CommentsIcon,
    component: AdminComments,
  },
  {
    path: '/queues',
    label: 'Queues',
    icon: QueuesIcon,
    component: AdminQueues,
    children: [
      {
        path: '/queues/asset-sync',
        label: 'Asset Sync',
        icon: AssetSyncIcon,
        component: AdminAssetSyncQueue,
      },
    ],
  },
  {
    path: '/audit',
    label: 'Audit',
    icon: AuditIcon,
    component: AdminAudit,
  },
  {
    path: '/dupes',
    label: 'Dupes',
    icon: DupesIcon,
    component: AdminDupes,
  },
  {
    path: '/reputation',
    label: 'Reputation',
    icon: ReputationIcon,
    component: AdminReputation,
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: AnalyticsIcon,
    component: AdminAnalytics,
  },
  {
    path: '/species',
    label: 'Species',
    icon: SpeciesIcon,
    component: AdminSpecies,
  },
  {
    path: '/notifications',
    label: 'Notifications',
    icon: NotificationsIcon,
    component: AdminNotifications,
  },
  {
    path: '/surveys',
    label: 'Surveys',
    icon: SurveysIcon,
    component: AdminSurveys,
  },
  {
    path: '/settings',
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
            <ListItemIcon></ListItemIcon>
            <ListItemText primary={'Overview'} />
          </StyledListItem>
        </NavLink>
        {navItems.map((item) => (
          <Fragment>
            <NavLink
              key={item.path}
              to={`${routes.admin}${item.path}`}
              exact
              activeClassName="active"
              style={{ textDecoration: 'none', color: 'inherit' }}>
              <StyledListItem

              // activeClassName={classes.active}
              >
                <ListItemIcon>{React.createElement(item.icon)}</ListItemIcon>
                <ListItemText primary={item.label} />
              </StyledListItem>
            </NavLink>
            {item.children?.map((child) => (
              <NavLink
                key={child.path}
                to={`${routes.admin}${child.path}`}
                exact
                activeClassName="active"
                style={{ textDecoration: 'none', color: 'inherit' }}>
                <StyledListItem
                  isChild
                  // activeClassName={classes.active}
                >
                  <ListItemIcon>{React.createElement(child.icon)}</ListItemIcon>
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
  const resultA = useRouteMatch()
  const resultB = useParams<any>()

  console.debug(`RENDER`, resultA, resultB)

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
        <Suspense fallback={<LoadingIndicator />}>
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
                  key={item.path}
                  // exact
                  path={`${routes.admin}${item.path}`}
                  component={item.component}
                />
              ))}
            {navItems.map((item) => (
              <Route
                key={item.path}
                // exact
                path={`${routes.admin}${item.path}`}
                component={item.component}
              />
            ))}
            <Route exact path={routes.admin} component={AdminHome} />
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
