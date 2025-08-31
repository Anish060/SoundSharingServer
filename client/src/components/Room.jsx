import { useEffect, useRef, useState } from 'react';
import AudioPlayer from './AudioPlayer'; // Import the new component

function Room({ roomId, socket }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songSrc] = useState('/your-song.mp3'); // Replace with a real song URL

  useEffect(() => {
    // Listener for when a new user joins a room to sync their playback
    socket.on('roomState', (state) => {
      audioRef.current.currentTime = (Date.now() - state.currentTime) / 1000;
      if (state.isPlaying) {
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    });

    socket.on('sync-play', (state) => {
      // Correct for network delay by using the time difference
      const delay = (Date.now() - state.currentTime) / 1000;
      audioRef.current.currentTime = audioRef.current.currentTime + delay;
      setIsPlaying(true);
    });

    socket.on('sync-pause', (state) => {
      audioRef.current.currentTime = state.currentTime;
      setIsPlaying(false);
    });

    socket.on('sync-seek', (state) => {
      audioRef.current.currentTime = state.currentTime;
    });

    return () => {
      // Clean up event listeners on unmount
      socket.off('roomState');
      socket.off('sync-play');
      socket.off('sync-pause');
      socket.off('sync-seek');
    };
  }, [socket]);

  const handlePlayPause = () => {
    if (isPlaying) {
      socket.emit('pause', roomId, audioRef.current.currentTime);
    } else {
      socket.emit('play', roomId);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="room">
      <h2>Room ID: {roomId}</h2>
      <AudioPlayer ref={audioRef} src={songSrc} isPlaying={isPlaying} />
      <button onClick={handlePlayPause}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
}

export default Room;