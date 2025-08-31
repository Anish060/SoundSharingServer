import { useState } from 'react';
import io from 'socket.io-client';
import Lobby from './components/Lobby';
import Room from './components/Room';

const socket = io('http://localhost:3000'); // Connect to your server

function App() {
  const [roomId, setRoomId] = useState(null);

  const handleJoin = (id) => {
    setRoomId(id);
    socket.emit('joinRoom', id);
  };

  return (
    <div className="app">
      {!roomId ? (
        <Lobby onJoin={handleJoin} />
      ) : (
        <Room roomId={roomId} socket={socket} />
      )}
    </div>
  );
}

export default App;