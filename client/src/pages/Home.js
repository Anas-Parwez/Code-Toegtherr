import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';

function Home() {
    const navigate = useNavigate();

    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success('Created a new room');
    };

    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error('Room ID and username are required');
            return;
        }
        navigate(`/editor/${roomId}`, {
            state: { username },
        });
        // it will open editor page , with userId;
    };

    return (
        <div className="homePageWrapper">
            <div className="formWrapper">
                <h1 className="mainLabel">CODE TOGETHER</h1>
                <div className="inputGroup">
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="Enter Room ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        // Step 1 — You press "A" on your keyboard
                        // Step 2 — The browser fires an onChange event
                        // Step 3 — Your function runs:
                        // (e) => setRoomId(e.target.value)
                        // e.target.value is now "A"
                        // so this becomes: setRoomId("A")
                    />
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="Enter Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button className="btn joinBtn" onClick={joinRoom}>
                        Join Room
                    </button>
                    <span className="createInfo">
                        Don't have a room ID?{' '}
                        <a href="" className="createNewBtn" onClick={createNewRoom}>
                            Create New Room
                        </a>
                    </span>
                </div>
            </div>
        </div>
    );
}

export default Home;