import { Injectable } from '@nestjs/common';
import { PrismaTransactionHost } from '@template/database';
import { VideoRepository, type OwnerId, type Video, type VideoId } from '@template/media-domain';

import { VideoMapper } from '../mappers/video.mapper.ts';

@Injectable()
export class PrismaVideoRepository extends VideoRepository {
  constructor(private readonly host: PrismaTransactionHost) {
    super();
  }

  async findById(id: VideoId): Promise<Video | null> {
    const record = await this.host.tx.video.findUnique({ where: { id: id.value } });
    return record ? VideoMapper.toDomain(record) : null;
  }

  async findByOwner(ownerId: OwnerId): Promise<Video[]> {
    const records = await this.host.tx.video.findMany({
      where: { ownerId: ownerId.value },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    return records.map((record) => VideoMapper.toDomain(record));
  }

  async save(video: Video): Promise<void> {
    const data = VideoMapper.toPersistence(video);
    await this.host.tx.video.upsert({ where: { id: data.id }, create: data, update: data });
  }
}
