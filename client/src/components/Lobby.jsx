import { useState } from 'react';

function Lobby({ onJoin }) {
  const [roomId, setRoomId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomId) {
      onJoin(roomId);
    }
  };

  return (
    <div className="lobby">
      <h2>Join a Room</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter Room ID"
        />
        <button type="submit">Join</button>
      </form>
    </div>
  );
}

export default Lobby;