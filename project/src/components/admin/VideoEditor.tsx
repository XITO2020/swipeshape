import React, { useState, useEffect } from 'react';
import { Video } from '../../types';

interface VideoEditorProps {
  video?: Video | null; // Current video to edit, null for new video
  onSave: (video: Omit<Video, 'id' | 'created_at' | 'updated_at'> | Partial<Video> & { id?: number }) => void;
  onCancel: () => void;
}

const VideoEditor: React.FC<VideoEditorProps> = ({ video, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [publishedAt, setPublishedAt] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (video) {
      setTitle(video.title);
      setDescription(video.description || '');
      setVideoUrl(video.video_url);
      setThumbnailUrl(video.thumbnail_url || '');
      setDuration(video.duration_seconds);
      setPublishedAt(video.published_at ? new Date(video.published_at).toISOString().substring(0, 16) : undefined);
    } else {
      // Reset form for new video
      setTitle('');
      setDescription('');
      setVideoUrl('');
      setThumbnailUrl('');
      setDuration(undefined);
      setPublishedAt(undefined);
    }
  }, [video]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const videoData = {
      title,
      description,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      duration_seconds: duration,
      published_at: publishedAt ? new Date(publishedAt).toISOString() : null, // Handle null for DB
    };
    if (video?.id) {
      onSave({ ...videoData, id: video.id });
    } else {
      onSave(videoData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">{video ? 'Edit Video' : 'Add New Video'}</h2>

      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title*</label>
        <input type="text" name="title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea name="description" id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
      </div>

      <div className="mb-4">
        <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">Video URL*</label>
        <input type="url" name="videoUrl" id="videoUrl" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>

      <div className="mb-4">
        <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
        <input type="url" name="thumbnailUrl" id="thumbnailUrl" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>

      <div className="mb-4">
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (seconds)</label>
        <input type="number" name="duration" id="duration" value={duration || ''} onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : undefined)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>

      <div className="mb-4">
        <label htmlFor="publishedAt" className="block text-sm font-medium text-gray-700">Publish Date</label>
        <input type="datetime-local" name="publishedAt" id="publishedAt" value={publishedAt || ''} onChange={(e) => setPublishedAt(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2">
          Cancel
        </button>
        <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Save Video
        </button>
      </div>
    </form>
  );
};

export default VideoEditor;
