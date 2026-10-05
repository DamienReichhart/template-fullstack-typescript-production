'use client';

import { useQuery } from '@tanstack/react-query';

import { authenticatedPingQuery } from '../api/system.queries';

export function useAuthenticatedPing() {
  return useQuery(authenticatedPingQuery());
}
