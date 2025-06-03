import React, { useState, useEffect, useCallback } from 'react';
import { Video } from '../../types';
import { getVideos, createVideo, updateVideo, deleteVideo } from '../../lib/supabase';
import VideoList from '../../components/admin/VideoList';
import VideoEditor from '../../components/admin/VideoEditor';

const AdminVideosPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await getVideos();
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      setVideos(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error("Failed to fetch videos:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleDeleteVideo = async (videoId: number) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }
    setError(null); // Clear previous errors
    try {
      const { error: deleteError } = await deleteVideo(videoId);
      if (deleteError) {
        throw new Error(deleteError.message);
      }
      setVideos(prevVideos => prevVideos.filter(video => video.id !== videoId));
      alert('Video deleted successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to delete video: ${errorMessage}`);
      alert(`Failed to delete video: ${errorMessage}`);
      console.error("Failed to delete video:", errorMessage);
    }
  };

  const openEditor = (video: Video | null = null) => {
    setSelectedVideo(video);
    setShowEditor(true);
    setError(null); // Clear previous errors when opening editor
  };

  const closeEditor = () => {
    setSelectedVideo(null);
    setShowEditor(false);
  };

  const handleSaveVideo = async (videoData: Omit<Video, 'id' | 'created_at' | 'updated_at'> | Partial<Video> & { id?: number }) => {
    setError(null); // Clear previous errors
    try {
      let successMessage = '';
      if (videoData.id) { // Editing existing video
        const { error: updateError } = await updateVideo(videoData.id, videoData as Partial<Video>);
        if (updateError) throw new Error(updateError.message);
        successMessage = 'Video updated successfully!';
      } else { // Creating new video
        const { error: createError } = await createVideo(videoData as Omit<Video, 'id' | 'created_at' | 'updated_at'>);
        if (createError) throw new Error(createError.message);
        successMessage = 'Video created successfully!';
      }
      await fetchVideos(); // Refetch all videos
      closeEditor();
      alert(successMessage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to save video: ${errorMessage}`);
      alert(`Failed to save video: ${errorMessage}`);
      console.error("Failed to save video:", errorMessage);
      // Keep editor open if save fails so user can correct
    }
  };

  if (isLoading && !showEditor) { // Avoid full page loading when editor is just opening
    return <div className="container mx-auto p-4"><p>Loading videos...</p></div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Videos</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>}

      {!showEditor && (
        <>
          <button
            onClick={() => openEditor()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
          >
            Add New Video
          </button>
          {isLoading ? <p>Loading videos...</p> : <VideoList videos={videos} onEdit={openEditor} onDelete={handleDeleteVideo} />}
        </>
      )}

      {showEditor && (
        <VideoEditor
          video={selectedVideo}
          onSave={handleSaveVideo}
          onCancel={closeEditor}
        />
      )}
    </div>
  );
};

export default AdminVideosPage;
