/** The two S3 clients (`S3Clients`): use `ObjectStorage` instead unless you need a raw S3 call. */
export const S3_CLIENTS = Symbol.for('template:s3-clients');
