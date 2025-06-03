import React from 'react';
import { Video } from '../../types'; // Assuming Video type is in src/types

interface VideoListProps {
  videos: Video[];
  onEdit: (video: Video) => void;
  onDelete: (videoId: number) => void;
}

const VideoList: React.FC<VideoListProps> = ({ videos, onEdit, onDelete }) => {
  if (!videos.length) {
    return <p>No videos found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Title</th>
            <th className="py-2 px-4 border-b">Published</th>
            <th className="py-2 px-4 border-b">Duration (s)</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {videos.map((video) => (
            <tr key={video.id}>
              <td className="py-2 px-4 border-b">{video.title}</td>
              <td className="py-2 px-4 border-b">{video.published_at ? new Date(video.published_at).toLocaleDateString() : 'Draft'}</td>
              <td className="py-2 px-4 border-b">{video.duration_seconds ?? 'N/A'}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => onEdit(video)}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(video.id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VideoList;
