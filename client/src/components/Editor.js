import { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";

function Editor({ socketRef, roomId, onCodeChange, code }) {
  const editorRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const editor = CodeMirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: "javascript", json: true },
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );

      editorRef.current = editor;
      editor.setSize(null, "100%");

      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        // only emit when user actually types
        // ignore programmatic setValue() calls
        if (origin !== "setValue") {
          onCodeChange(code);
        }
      });
    };

    init();
  }, []);

  useEffect(() => {
    // when code arrives from another user via socket
    // update CodeMirror manually using setValue()
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue();
      if (code !== currentValue) {
        editorRef.current.setValue(code);
      }
    }
  }, [code]);

  return (
    <div style={{ height: "100%" }}>
      <textarea id="realtimeEditor"></textarea>
    </div>
  );
}

export default Editor;

// User types in editor
//        ↓
// CodeMirror fires 'change' event
//         ↓
// origin !== 'setValue' check passes
//         ↓
// onCodeChange(code) called
//         ↓
// EditorPage emits CODE_CHANGE to server
//         ↓
// Server broadcasts to everyone else
//         ↓
// Other editors receive code via setValue()