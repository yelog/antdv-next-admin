import type { RouteLocationNormalized } from 'vue-router';

export function shouldRecoverDynamicRoute(
  routeName: RouteLocationNormalized['name'],
  hasToken: boolean,
  routesGenerated: boolean,
) {
  return routeName === 'NotFoundCatchAll' && hasToken && !routesGenerated;
}
