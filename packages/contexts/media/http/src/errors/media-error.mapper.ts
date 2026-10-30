import { HttpStatus, Injectable } from '@nestjs/common';
import { MediaErrorCode } from '@template/contracts/media';
import { DomainErrorMapper, type MappedError } from '@template/http';
import {
  InvalidVideoError,
  VideoNotFoundError,
  VideoUploadNotFoundError,
} from '@template/media-domain';

const MAPPINGS: [new (...args: never[]) => Error, MappedError][] = [
  [InvalidVideoError, { status: HttpStatus.BAD_REQUEST, code: MediaErrorCode.videoInvalid }],
  [
    VideoUploadNotFoundError,
    { status: HttpStatus.BAD_REQUEST, code: MediaErrorCode.videoUploadNotFound },
  ],
  [VideoNotFoundError, { status: HttpStatus.NOT_FOUND, code: MediaErrorCode.videoNotFound }],
];

/** Translates media domain errors into HTTP problems (discovered by the global filter). */
@Injectable()
export class MediaErrorMapper extends DomainErrorMapper {
  map(error: unknown): MappedError | undefined {
    return MAPPINGS.find(([type]) => error instanceof type)?.[1];
  }
}
