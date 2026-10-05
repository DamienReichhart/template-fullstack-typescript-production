import { queryOptions } from '@tanstack/react-query';

import { api } from '@/shared/api/api-client';

import { systemKeys } from './system.keys';

/** On demand only (`enabled: false`): the user triggers each test with a button. */
export const pingQuery = () =>
  queryOptions({
    queryKey: systemKeys.ping(),
    queryFn: () => api.system.ping(),
    enabled: false,
    retry: false,
    gcTime: 0,
  });

export const authenticatedPingQuery = () =>
  queryOptions({
    queryKey: systemKeys.authenticatedPing(),
    queryFn: () => api.system.authenticatedPing(),
    enabled: false,
    retry: false,
    gcTime: 0,
  });
