import React, { forwardRef, useEffect } from 'react';

const AudioPlayer = forwardRef(({ src, isPlaying, onTimeUpdate, onEnded }, ref) => {
  useEffect(() => {
    if (ref.current) {
      if (isPlaying) {
        ref.current.play();
      } else {
        ref.current.pause();
      }
    }
  }, [isPlaying, ref]);

  return (
    <audio 
      ref={ref} 
      src={src} 
      onTimeUpdate={onTimeUpdate} 
      onEnded={onEnded} 
      controls // You can remove this for a custom UI
    />
  );
});

export default AudioPlayer;