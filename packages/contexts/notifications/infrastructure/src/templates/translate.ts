/** Translation function handed to templates, scoped to the `emails` namespace. */
export type Translate = (key: string, values?: Record<string, string | number>) => string;
