'use client';

import { useQuery } from '@tanstack/react-query';

import { pingQuery } from '../api/system.queries';

export function usePing() {
  return useQuery(pingQuery());
}
