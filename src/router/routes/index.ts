/**
 * Route definitions aggregator
 *
 * Routes are organized into three categories:
 * - static: No authentication required (login, error pages, demo)
 * - basic: Authentication required, no permission filtering
 * - async: Permission-filtered routes based on user roles/permissions
 */

export { asyncRoutes } from './async'
export { basicRoutes } from './basic'
export { demoRoutes, notFoundRoute, staticRoutes } from './static'
