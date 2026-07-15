import { describe, expect, it } from 'vitest';

import { basicRoutes, notFoundRoute, staticRoutes } from '@/router/routes';
import { getRouteNamesToRemove } from '@/router/utils';

describe('router reset helpers', () => {
  it('keeps static routes and nested basic routes when removing generated routes', () => {
    const routeNames = [
      'Login',
      'NotFound',
      'Forbidden',
      'NotFoundCatchAll',
      'Root',
      'Dashboard',
      'Profile',
      'Notifications',
      'About',
      'System',
      'SystemUser',
    ];

    expect(
      getRouteNamesToRemove(routeNames, [...staticRoutes, ...basicRoutes, notFoundRoute]),
    ).toEqual(['System', 'SystemUser']);
  });

  it('keeps the next generated route tree when replacing dynamic routes', () => {
    const nextGeneratedRoutes = [
      {
        path: '/examples',
        name: 'Examples',
        children: [
          {
            path: 'rbac-flow',
            name: 'ExamplesRbacFlow',
          },
        ],
      },
    ];

    const routeNames = [
      'Login',
      'NotFoundCatchAll',
      'Root',
      'Dashboard',
      'Examples',
      'ExamplesRbacFlow',
      'System',
      'SystemUser',
    ];

    expect(
      getRouteNamesToRemove(routeNames, [
        ...staticRoutes,
        ...basicRoutes,
        notFoundRoute,
        ...nextGeneratedRoutes,
      ]),
    ).toEqual(['System', 'SystemUser']);
  });
});
