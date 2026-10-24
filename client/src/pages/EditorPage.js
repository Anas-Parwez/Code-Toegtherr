
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
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState(null);
    const [running, setRunning] = useState(false);

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
            });

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

            // Listen for code execution results
            socketRef.current.on(ACTIONS.OUTPUT_RECEIVED, (result) => {
                setOutput(result);
                setRunning(false);
            });
        };

        init();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current.off(ACTIONS.JOINED);
                socketRef.current.off(ACTIONS.DISCONNECTED);
                socketRef.current.off(ACTIONS.CODE_CHANGE);
                socketRef.current.off(ACTIONS.OUTPUT_RECEIVED);
            }
        };
    }, [location.state?.username, navigate, roomId]);

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

    // Run the current code
    const runCode = () => {
        if (!socketRef.current || running) return;

        setRunning(true);
        setOutput(null);

        socketRef.current.emit(ACTIONS.RUN_CODE, {
            roomId,
            code,
            language,
        });
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
                                <Avatar
                                    name={client.username}
                                    size={50}
                                    round="50%"
                                />
                                <span className="userName">
                                    {client.username}
                                </span>
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
            <div className="toolbar">
              <select
                className="langSelect"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
              <button className="btn runBtn" onClick={runCode} disabled={running}>
                {running ? "Running..." : "Run"}
              </button>
            </div>

            <div className="editorArea">
              <Editor
                socketRef={socketRef}
                roomId={roomId}
                code={code}
                onCodeChange={(code) => {
                  codeRef.current = code;
                  setCode(code);
                  socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
                }}
              />
            </div>

            <div className="outputPanel">
              {!output && <span className="outputHint">Run your code to see output</span>}
              {output?.error && <pre className="outputErr">{output.error}</pre>}
              {output?.status && <div className="outputStatus">{output.status}</div>}
              {output?.compileOutput && <pre className="outputErr">{output.compileOutput}</pre>}
              {output?.stderr && <pre className="outputErr">{output.stderr}</pre>}
              {output?.stdout && <pre className="outputOk">{output.stdout}</pre>}
            </div>
          </div>
        </div>
    );
}

export default EditorPage;
