import { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/dracula.css";
import "codemirror/lib/codemirror.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";

function Editor({ socketRef, roomId, onCodeChange, code }) {
  const editorRef = useRef(null);
  // This will hold a reference to the CodeMirror editor instance once it's created. We start it as null because the editor doesn't exist yet when the component first loads.
  useEffect(() => {
    const init = async () => {
      // setting up codemirrior
      const editor = CodeMirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: "javascript", json: true },
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        },
      );

      editorRef.current = editor;
      editor.setSize(null, "100%");

      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        //Every time someone types, CodeMirror fires a change event. You:

        // Get the current code with instance.getValue()
        // Call onCodeChange(code) — this is the function passed down from EditorPage as a prop
        // EditorPage then emits this code to the socket server
      });
    };

    init();
  }, []);
  useEffect(() => {
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
// You get the new code with getValue()
//         ↓
// You call onCodeChange(code)
//         ↓
// EditorPage receives it and emits to socket
//         ↓
// Server broadcasts to everyone else
