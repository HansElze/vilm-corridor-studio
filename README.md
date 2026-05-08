# Corridor Studio Next Shell

This project wraps the existing `corridor-studio-prototype/index.html` inside a Next.js/Vercel-ready application shell.

Principles:

- preserve the current corridor-specific map behavior first
- do not flatten the corridor thesis into generic dashboard UI
- separate operator and investor routes without forking the whole product
- define the first typed CCL handshake so the HUD can move from hardcoded text toward engine-fed state

Routes:

- `/corridor-studio` - live embedded prototype in operator shell
- `/investor` - same artifact, loaded in presentation mode
- `/ccl` - first engine handshake objects
- `/twin` - typed digital twin and under/over architecture state
- `/vilm` - canonical framing for the vertically integrated model concept
- `/api/ccl` - machine-readable handshake endpoint
- `/api/twin` - machine-readable digital twin state
