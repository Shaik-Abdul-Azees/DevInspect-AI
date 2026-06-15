# DevInspect AI

🔗 Live Demo: https://dev-inspect-ai.vercel.app/

AI-powered code review and repository inspection platform built with MERN, OpenAI, and GitHub integration.
live working of my project just Demo it.....

-------------------------------------------------------------------------------------------------------------------------------------------------------------------

# DevInspect AI 🛡️
> Automated Code Quality & Security Inspection Workbench

**DevInspect AI** is a premium, developer-focused, full-stack MERN application that provides automated code inspections, security audits, dynamic split-diff optimization views, interactive AI chat consulting, and printable compliance reports.

---

## 🎨 Architectural Phases Retrospective

This platform has been systematically developed through 6 design phases:

| Phase | Title | Accomplished Infrastructure |
| :---: | :--- | :--- |
| **Phase 1** | **Scaffolding & Server** | Scaffolding Express.js backend structure, MongoDB schemas, and clean unified error management. |
| **Phase 2** | **Secure Auth Integration** | JWT cookie-bound state controllers, client-side store hook wrappers (`Zustand`), and custom route protections. |
| **Phase 3** | **AI Review Core Service** | Google Gemini integration with high-fidelity analytical logic mocks supporting out-of-the-box operation. |
| **Phase 4** | **Glassmorphic UI Engine** | Dark/Light dynamic variables, responsive Sidebar navigation shell, and custom neon blurs. |
| **Phase 5** | **Workbench & Dashboards** | Interactive Monaco Editor integration, Side-by-Side Split Diff Compare view, dynamic SVG analytics trend graphs, and severity segment donut charts. |
| **Phase 6** | **Advanced Capabilities** | context-aware AI Chat drawers, Web Speech voice input, drag-and-drop file imports, public link sharing, and print-perfect PDF logs. |

---

## 🚀 How to Launch the Application

Follow these steps to spin up the backend API service and the frontend web app on your local machine:

### 1. Launch the Backend Server
1. Open a terminal in the root directory: `c:\Desktop\DevInspect AI\backend`
2. Start the Node.js server:
   ```bash
   node index.js
   ```
3. The server runs on port `5000` (e.g. `http://localhost:5000`) and logs a successful database connection state.

### 2. Launch the Frontend Dev Server
1. Open a second terminal inside: `c:\Desktop\DevInspect AI\frontend`
2. Start the Vite development workspace:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173`.

---

## 💎 Step-by-Step Working & Demo Scenarios

Here is how you can use the application's major features:

### Scenario 1: Guest Scan & Monaco Split Diff Sandbox
1. Navigate to the **Sandbox** page using the sidebar.
2. Select a template from the language dropdown (e.g., **JavaScript**). A script with standard security flaws will load:
   ```javascript
   function validateForm(username, secretKey) {
     console.log("Validating user secret key: " + secretKey); // plaintext credentials logging!
     const query = "SELECT * FROM administrators WHERE user = '" + username + "'"; // SQL Injection vulnerability!
   }
   ```
3. Click **Run Review**. The application queries the inspection server.
4. Review the results:
   * Read the **Synopsis** explaining high-level quality details.
   * View security metrics detailing vulnerability categories (e.g. `Critical`, `Medium`).
5. Click **Compare Split Diff** next to the SQL Injection finding.
   * The Monaco Editor splits in two: The **left screen** displays the original vulnerable code, while the **right screen** loads the secure patch recommendation showing parameterized database parameters!

### Scenario 2: Advanced Code Importers (Drag & Drop + GitHub)
*   **Drag & Drop local files**:
    *   Drag a script file (e.g., `app.py`) from your local file explorer and drop it over the browser page.
    *   A glowing screen overlay states: *"Release to Import Source File"*.
    *   Once dropped, standard `FileReader` reads the text, auto-selects **Python** inside the language controller, and populates the sandbox automatically!
*   **Import from public GitHub URLs**:
    *   Click **🐙 GitHub Import** in the workbench header.
    *   Enter a public file path (e.g., `https://github.com/user/project/blob/main/code.js`).
    *   Click **Fetch Code**. The backend parses it, fetches raw code contents, and loads it instantly inside Monaco.

### Scenario 3: AI Contextual Chat & Web Speech Recognition
1. Trigger a review scan so that an active audit is loaded.
2. Click **💬 AI Code Chat** in the workbench header to open the AI Consultation panel.
3. Tap the **🎙️ microphone icon** to enable browser dictation.
4. Speak aloud: *"How do I secure the credentials log statement?"*
5. The Speech-to-Text engine dictates your query into the text input box. Click enter to receive a context-aware response proposing custom code optimizations.

### Scenario 4: KPIs Analytics & Trend Graphs
1. Navigate to the **Dashboard** page.
2. Review automated chart segments that calculate and render dynamic SVG paths:
   * **Vulnerability Trend Line**: SVG graph mapping average safety scores over time.
   * **Severity Donut Ring**: Colored donut ring rendering counts of Critical, High, and Medium issues.
   * **Metrics Cards**: Tallying active alerts, clean files, and total lines inspected.

### Scenario 5: Audit Sharing & PDF Export
*   **Copy Public Share Link**:
    *   Go to **History** and click the **🔗 Share** link button on any audit record.
    *   A link is copied to your clipboard (`http://localhost:5173/review/:id`).
    *   Anyone visiting this link can read the shared audit report.
*   **Interactive Star Favorites**:
    *   Click the **⭐ star icon** on history logs to mark reviews as favorites. Use the tabs to toggle between **All Scans** and **Favorites**.
*   **PDF compliance report export**:
    *   Select an audit record and click **🖨️ Export PDF**.
    *   The print layout fires in print mode, using `@media print` rules to hide sidebars and blurs, producing a clean, black-and-white multi-page audit report.


