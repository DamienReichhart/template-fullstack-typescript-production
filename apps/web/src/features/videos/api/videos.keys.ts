export const videoKeys = {
  all: ['videos'] as const,
  list: () => [...videoKeys.all, 'list'] as const,
};
