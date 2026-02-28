import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStoryByUserNameApi, viewStoryApi } from "../api/storyApi";

const STORY_DURATION = 6000;
const PROGRESS_INTERVAL = 50;

const Story = () => {
  const { userName } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState(null); 
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const progressRef = useRef(null);
  const videoRef = useRef(null);

  const clearProgress = () => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  };

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getStoryByUserNameApi(userName);
        const data = res?.data || [];

        const firstStory = data[0] || null;
        setStory(firstStory);
        setCurrentMediaIndex(0);

        if (firstStory && firstStory._id) {
          await viewStoryApi(firstStory._id);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load stories.");
      } finally {
        setLoading(false);
      }
    };

    fetchStories();

    return () => clearProgress();
  }, [userName]);

  const handleNext = useCallback(async () => {
    clearProgress();
    if (!story) return;
    const mediaItems = story.media || [];

    if (currentMediaIndex < mediaItems.length - 1) {
      setProgress(0);
      setCurrentMediaIndex((prev) => prev + 1);
      return;
    }

    navigate("/");
  }, [currentMediaIndex, story, navigate]);

  const handlePrev = useCallback(() => {
    clearProgress();
    if (!story) return;

    if (currentMediaIndex > 0) {
      setCurrentMediaIndex((prev) => prev - 1);
    }
  }, [currentMediaIndex, story]);

  useEffect(() => {
    if (!story) return;

    const mediaItems = story.media || [];
    if (!mediaItems.length) return;

    clearProgress();
    setProgress(0);

    const startTime = Date.now();

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / STORY_DURATION) * 100;

      if (newProgress >= 100) {
        clearProgress();
        handleNext();
        setProgress(0);
      } else {
        setProgress(newProgress);
      }
    }, PROGRESS_INTERVAL);

    return () => clearProgress();
  }, [currentMediaIndex, story, handleNext]);

  const handleClose = () => {
    clearProgress();
    navigate("/");
  };

  if (loading) {
    return <div className="w-full h-screen flex items-center justify-center bg-black text-white">Loading stories...</div>;
  }

  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white">
        <p className="mb-4 text-red-400">{error}</p>
        <button onClick={handleClose} className="bg-white text-black px-4 py-2 rounded">Go Home</button>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white">
        <p>No stories available.</p>
        <button onClick={handleClose} className="bg-white text-black px-4 py-2 rounded mt-3">Go Home</button>
      </div>
    );
  }

  const currentStory = story;
  const mediaItems = currentStory.media || [];
  const lastMediaIndex = mediaItems.length ? mediaItems.length - 1 : 0;
  const safeMediaIndex = Math.min(currentMediaIndex, lastMediaIndex);
  const currentMedia = mediaItems[safeMediaIndex];

  const viewers = currentStory.viewers || [];
  const viewersToShow = viewers.slice(0, 5);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black text-white">
      <div className="relative w-full max-w-md aspect-[9/16] bg-black overflow-hidden rounded-2xl">
        {/* Progress bars */}
        <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
          {mediaItems.map((_, i) => (
            <div key={i} className="flex-1 h-1 bg-gray-600 rounded">
              {i === currentMediaIndex && (
                <div className="h-full bg-white" style={{ width: `${progress}%` }} />
              )}
              {i < currentMediaIndex && <div className="h-full bg-white w-full" />}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-5 left-3 right-3 flex justify-between items-center z-20">
          <div className="flex items-center gap-2">
            <img src={currentStory.author?.profileImg} alt="" className="w-8 h-8 rounded-full" />
            <span className="text-sm font-semibold">{currentStory.author?.userName}</span>
          </div>
          <button onClick={handleClose}>✕</button>
        </div>

        {/* Navigation */}
        <button onClick={handlePrev} className="absolute left-0 top-0 bottom-0 w-1/3 z-10"/>
        <button onClick={handleNext} className="absolute right-0 top-0 bottom-0 w-1/3 z-10"/>

        {/* Media */}
        <div className="w-full h-full">
          {currentMedia?.type === "image" && (
            <img src={currentMedia.url} alt="" className="w-full h-full object-cover"/>
          )}
          {currentMedia?.type === "video" && (
            <video ref={videoRef} src={currentMedia.url} autoPlay muted playsInline className="w-full h-full object-cover"/>
          )}
        </div>

        {/* Viewers */}
        {viewers.length > 0 && (
          <div className="absolute bottom-4 left-3 flex items-center gap-2">
            {viewersToShow.map((viewer) => (
              <img key={viewer._id} src={viewer.profileImg} alt="" className="w-6 h-6 rounded-full border border-black"/>
            ))}
            <span className="text-xs text-gray-300">{viewers.length} views</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Story;