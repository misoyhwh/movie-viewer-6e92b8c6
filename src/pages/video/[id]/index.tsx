import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import axios from 'axios';

const VideoPlayer = () => {
  const router = useRouter();
  const { id } = router.query;
  const [video, setVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [relatedVideos, setRelatedVideos] = useState([]);

  useEffect(() => {
    if (id) {
      fetchVideo();
      fetchRelatedVideos();
    }
  }, [id]);

  const fetchVideo = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setVideo(data);
      updateViewCount();
    } catch (error) {
      console.error('Error fetching video:', error);
      setVideo({
        id: 'sample-id',
        title: 'サンプル動画',
        description: 'これはサンプル動画の説明です。',
        file_path: 'https://example.com/sample-video.mp4',
        view_count: 1000,
      });
    }
  };

  const fetchRelatedVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('id, title, thumbnail_path')
        .neq('id', id)
        .limit(5);

      if (error) throw error;
      setRelatedVideos(data);
    } catch (error) {
      console.error('Error fetching related videos:', error);
      setRelatedVideos([
        { id: '1', title: '関連動画1', thumbnail_path: 'https://placehold.co/200x112' },
        { id: '2', title: '関連動画2', thumbnail_path: 'https://placehold.co/200x112' },
        { id: '3', title: '関連動画3', thumbnail_path: 'https://placehold.co/200x112' },
      ]);
    }
  };

  const updateViewCount = async () => {
    try {
      await axios.post('/api/view-counter', { videoId: id });
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime);
  };

  const handleDurationChange = (e) => {
    setDuration(e.target.duration);
  };

  const handleSeek = (e) => {
    const video = document.getElementById('videoPlayer');
    const time = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!video) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen h-full bg-gray-100">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative pt-[56.25%]">
            <video
              id="videoPlayer"
              className="absolute top-0 left-0 w-full h-full"
              src={video.file_path}
              poster={video.thumbnail_path || 'https://placehold.co/1280x720'}
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={handleDurationChange}
            />
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePlayPause}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <div className="flex items-center">
                <button
                  onClick={() => setVolume(volume === 0 ? 1 : 0)}
                  className="mr-2 text-gray-600"
                >
                  {volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24"
                />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={(currentTime / duration) * 100 || 0}
              onChange={handleSeek}
              className="w-full mb-4"
            />
            <div className="text-sm text-gray-600 mb-4">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
            <p className="text-gray-600 mb-4">{video.description}</p>
            <p className="text-sm text-gray-500">視聴回数: {video.view_count}</p>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">関連動画</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {relatedVideos.map((relatedVideo) => (
              <div
                key={relatedVideo.id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                onClick={() => router.push(`/video/${relatedVideo.id}`)}
              >
                <img
                  src={relatedVideo.thumbnail_path || 'https://placehold.co/200x112'}
                  alt={relatedVideo.title}
                  className="w-full h-28 object-cover"
                />
                <div className="p-2">
                  <h3 className="text-sm font-semibold truncate">{relatedVideo.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;