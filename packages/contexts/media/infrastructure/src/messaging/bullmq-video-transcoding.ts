import { Injectable } from '@nestjs/common';
import { VideoTranscoding } from '@template/media-application';
import { JobProducer } from '@template/messaging';
import { transcodeVideoJob } from '@template/queue';

/** Hands Transcoding to the worker through the `media` queue. */
@Injectable()
export class BullMqVideoTranscoding extends VideoTranscoding {
  constructor(private readonly jobs: JobProducer) {
    super();
  }

  async schedule(videoId: string): Promise<void> {
    // One job per Video: BullMQ ignores a job whose id is already queued.
    await this.jobs.enqueue(
      transcodeVideoJob,
      { videoId },
      { jobId: `transcode-video-${videoId}` },
    );
  }
}
