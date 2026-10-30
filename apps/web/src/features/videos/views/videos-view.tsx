import { UploadVideoCard } from '../components/upload-video-card';
import { VideoList } from '../components/video-list';

export function VideosView() {
  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-4 py-10">
      <UploadVideoCard />
      <VideoList />
    </div>
  );
}
