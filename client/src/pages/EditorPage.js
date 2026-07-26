import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { initSocket } from "../socket";
import ACTIONS from "../Actions";
import Editor from "../components/Editor";
import Avatar from "react-avatar";
import toast from "react-hot-toast";

function EditorPage() {
  const socketRef = useRef(null);
  const codeRef = useRef('');
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [clients, setClients] = useState([]);
  const [code, setCode] = useState("");

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        toast.error("Socket connection failed, try again later.");
        navigate("/");
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room`);
          }
          setClients(clients);
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) =>
          prev.filter((client) => client.socketId !== socketId)
        );
      });

      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          setCode(code);
          codeRef.current = code;
        }
      });
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
        socketRef.current.off(ACTIONS.CODE_CHANGE);
      }
    };
  }, []);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied to clipboard");
    } catch (err) {
      toast.error("Could not copy Room ID");
    }
  };

  const leaveRoom = () => {
    navigate("/");
  };

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <h3 className="logoLabel">Code Together</h3>
          <h4 className="clientsLabel">Connected</h4>
          <div className="clientsList">
            {clients.map((client) => (
              <div key={client.socketId} className="client">
                <Avatar name={client.username} size={50} round="50%" />
                <span className="userName">{client.username}</span>
              </div>
            ))}
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>
          Copy Room ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave Room
        </button>
      </div>
      <div className="editorWrap">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          code={code}
          onCodeChange={(code) => {
            codeRef.current = code;
            setCode(code);
            socketRef.current.emit(ACTIONS.CODE_CHANGE, {
              roomId,
              code,
            });
          }}
        />
      </div>
    </div>
  );
}

export default EditorPage;