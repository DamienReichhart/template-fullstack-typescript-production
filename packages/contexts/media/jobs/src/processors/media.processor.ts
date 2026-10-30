import { CommandBus } from '@nestjs/cqrs';
import { TranscodeVideoCommand } from '@template/media-application';
import { onJob, Processor, TypedProcessor } from '@template/messaging';
import { mediaQueue, transcodeVideoJob } from '@template/queue';

/**
 * Consumes `media`: each job is translated into an application command. One transcode at a
 * time per worker, whatever `WORKER_CONCURRENCY` says: an encode already uses every core. The
 * lock outlives a stalled event loop; BullMQ renews it while ffmpeg runs.
 */
@Processor(mediaQueue.name, { lockDuration: 5 * 60_000 })
export class MediaProcessor extends TypedProcessor {
  override readonly concurrency = 1;

  constructor(private readonly commands: CommandBus) {
    super();
  }

  protected handlers() {
    return [
      onJob(transcodeVideoJob, ({ videoId }, job) => {
        const lastAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
        return this.commands.execute(new TranscodeVideoCommand(videoId, lastAttempt));
      }),
    ];
  }
}
