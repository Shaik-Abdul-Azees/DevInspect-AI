// frontend/src/pages/Workspace.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import useStore from '../store/useStore';

const CODE_TEMPLATES = {
  javascript: `// DevInspect AI - Code Inspection Workbench
function validateForm(username, secretKey) {
  var isAllowed = false;
  
  // Vulnerability: Plaintext logging of passwords
  console.log("Validating user secret key: " + secretKey);

  // Security flaw: SQL Injection endpoint mapping
  const query = "SELECT * FROM administrators WHERE user = '" + username + "'";
  const res = database.query(query);

  if (res && res.length > 0) {
    isAllowed = true;
  }
  
  return isAllowed;
}`,
  python: `# DevInspect AI - Code Inspection Workbench
import os

def connect_server(host, user, creds):
    # Security vulnerability: shell command formatting
    # Injectable parameters
    cmd = "ping -c 3 " + host
    os.system(cmd)
    
    # Cryptographic issue: plaintext credentials logging
    print(f"Connecting user {user} using credentials {creds}")
`,
  cpp: `// DevInspect AI - Code Inspection Workbench
#include <iostream>
#include <cstdio>

void handleInput() {
    char username[8];
    // Security flaw: gets() allows buffer overflow
    std::cout << "Enter username: ";
    gets(username); 
    std::printf("Hello, %s\\n", username);
}`,
  java: `// DevInspect AI - Code Inspection Workbench
import java.sql.*;

public class UserValidator {
    public boolean validate(String username) throws Exception {
        Connection conn = DriverManager.getConnection("jdbc:mysql://localhost/db", "root", "password");
        // Vulnerability: SQL Injection
        String query = "SELECT * FROM users WHERE user = '" + username + "'";
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery(query);
        return rs.next();
    }
}`,
  c: `// DevInspect AI - Code Inspection Workbench
#include <stdio.h>
#include <string.h>

int main(int argc, char *argv[]) {
    char buffer[50];
    if (argc > 1) {
        // Vulnerability: Buffer overflow
        strcpy(buffer, argv[1]);
        printf("Input was: %s\\n", buffer);
    }
    return 0;
}`
};

export default function Workspace() {
  const { theme, isAuthenticated } = useStore();
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(CODE_TEMPLATES.javascript);
  const [loading, setLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Split Diff Viewer State
  const [diffMode, setDiffMode] = useState(false);
  const [selectedIssueFix, setSelectedIssueFix] = useState(null);

  // Drag & Drop Upload Overlay State
  const [dragActive, setDragActive] = useState(false);

  // GitHub Import state
  const [githubUrl, setGithubUrl] = useState('');
  const [githubLoading, setGithubLoading] = useState(false);
  const [showGithubBar, setShowGithubBar] = useState(false);

  // AI Chat Assistant state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);

  // Toggle favorite state
  const [isFavorited, setIsFavorited] = useState(false);

  // Check if active review is already favorited when reviewResult changes
  useEffect(() => {
    if (reviewResult && isAuthenticated) {
      // Query favorites to check if this review ID exists
      axios.get('/api/favorites')
        .then(res => {
          const found = res.data.some(fav => fav._id === reviewResult._id);
          setIsFavorited(found);
        })
        .catch(err => console.log('Error verifying favorite state:', err));
    }
  }, [reviewResult, isAuthenticated]);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(CODE_TEMPLATES[lang] || '');
    setReviewResult(null);
    setDiffMode(false);
    setSelectedIssueFix(null);
  };

  const handleClearCode = () => {
    setCode('');
    setReviewResult(null);
    setDiffMode(false);
    setSelectedIssueFix(null);
  };

  const handleRunReview = async () => {
    if (!code || !code.trim()) {
      setErrorMsg('Please input code for AI inspection.');
      return;
    }

    setLoading(true);
    setReviewResult(null);
    setErrorMsg(null);
    setDiffMode(false);
    setSelectedIssueFix(null);
    setChatHistory([]);

    try {
      const response = await axios.post('/api/reviews', {
        code,
        language
      });
      
      setReviewResult(response.data);
    } catch (err) {
      console.error('Inspection Request Error:', err);
      setErrorMsg(
        err.response?.data?.message || 
        'AI review compilation failed. Please verify that your backend server is online.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inspectFixInDiff = (issue) => {
    setSelectedIssueFix(issue);
    setDiffMode(true);
  };

  // Drag and drop code drop zone
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      
      // Auto detect language by file suffix
      const ext = file.name.split('.').pop().toLowerCase();
      let detectedLang = 'javascript';
      if (ext === 'py') detectedLang = 'python';
      else if (ext === 'cpp' || ext === 'h' || ext === 'hpp' || ext === 'cc') detectedLang = 'cpp';
      else if (ext === 'java') detectedLang = 'java';
      else if (ext === 'c') detectedLang = 'c';

      reader.onload = (event) => {
        setCode(event.target.result);
        setLanguage(detectedLang);
        setReviewResult(null);
        setDiffMode(false);
        setSelectedIssueFix(null);
      };
      reader.readAsText(file);
    }
  };

  // GitHub Proxy fetcher
  const handleGithubImport = async (e) => {
    e.preventDefault();
    if (!githubUrl || !githubUrl.trim()) return;

    setGithubLoading(true);
    setErrorMsg(null);
    try {
      const response = await axios.post('/api/reviews/import-github', { githubUrl });
      setCode(response.data.code);
      
      // Auto detect language
      const ext = githubUrl.split('.').pop().toLowerCase();
      let detectedLang = 'javascript';
      if (ext === 'py') detectedLang = 'python';
      else if (ext === 'cpp' || ext === 'cc' || ext === 'h') detectedLang = 'cpp';
      else if (ext === 'java') detectedLang = 'java';
      else if (ext === 'c') detectedLang = 'c';
      setLanguage(detectedLang);
      
      setReviewResult(null);
      setDiffMode(false);
      setSelectedIssueFix(null);
      setShowGithubBar(false);
      setGithubUrl('');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to import public GitHub repository file.');
    } finally {
      setGithubLoading(false);
    }
  };

  // Web Speech API dictation
  const handleSpeechInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser. Please try Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (e) => {
      console.error(e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setChatMessage(prev => prev + " " + speechToText);
    };

    recognition.start();
  };

  // AI Chat query submission
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage || !chatMessage.trim() || !reviewResult) return;

    const userQuery = chatMessage.trim();
    setChatMessage('');
    
    // Add user message to history
    const updatedHistory = [...chatHistory, { sender: 'user', text: userQuery }];
    setChatHistory(updatedHistory);
    setChatLoading(true);

    try {
      const response = await axios.post(`/api/reviews/${reviewResult._id}/chat`, {
        message: userQuery,
        chatHistory: updatedHistory
      });

      setChatHistory(prev => [...prev, { sender: 'assistant', text: response.data.response }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { 
        sender: 'assistant', 
        text: 'Failed to connect with AI chat server. Verify that your backend server is online.' 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Toggle favorite DB persistent state
  const handleToggleFavorite = async () => {
    if (!reviewResult || !isAuthenticated) return;

    try {
      const response = await axios.post(`/api/favorites/${reviewResult._id}`);
      setIsFavorited(response.data.favorited);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div 
      className="flex flex-col gap-6 relative"
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      {/* File Drop overlay portal */}
      {dragActive && (
        <div className="absolute inset-0 bg-brand-bg/80 border-2 border-dashed border-brand-primary rounded-2xl z-50 flex flex-col justify-center items-center backdrop-blur-sm">
          <div className="w-16 h-16 rounded-full bg-brand-primary-glow flex items-center justify-center text-brand-primary mb-4 animate-bounce">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
          </div>
          <p className="text-sm font-extrabold text-brand-text">Import File Contents</p>
          <p className="text-xs text-brand-text-muted mt-1">Release to load .js, .py, or .cpp scripts into the sandbox</p>
        </div>
      )}

      {/* Page Title */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-brand-text to-brand-text-muted bg-clip-text text-transparent">
            Developer Inspection Workbench
          </h1>
          <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
            Write or paste code in the Monaco workspace, drop files to import, or import directly from public GitHub paths.
          </p>
        </div>

        {/* Action Panel items */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGithubBar(!showGithubBar)}
            className="glass-panel-interactive px-3.5 py-1.5 rounded-lg text-xs font-bold border border-brand-border/10 text-brand-text-muted hover:text-brand-text hover:bg-white/5 transition-all cursor-pointer"
          >
            🐙 GitHub Import
          </button>

          {reviewResult && (
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`glass-panel-interactive px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                chatOpen 
                  ? 'bg-brand-primary-glow border-brand-primary text-brand-primary' 
                  : 'border-brand-border/10 text-brand-text-muted hover:text-brand-text hover:bg-white/5'
              }`}
            >
              💬 AI Code Chat
            </button>
          )}

          {reviewResult && selectedIssueFix && (
            <button
              onClick={() => setDiffMode(!diffMode)}
              className={`glass-panel-interactive px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                diffMode 
                  ? 'bg-brand-secondary-glow border-brand-secondary text-brand-secondary' 
                  : 'border-brand-border/10 text-brand-text-muted hover:text-brand-text hover:bg-white/5'
              }`}
            >
              {diffMode ? '⚡ Exit Split Diff' : '⚡ Split Diff View'}
            </button>
          )}
        </div>
      </div>

      {/* Expandable GitHub URL Import bar */}
      <AnimatePresence>
        {showGithubBar && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleGithubImport}
            className="glass-panel p-4 rounded-xl border border-brand-border/10 flex flex-col sm:flex-row gap-3 items-stretch shadow-md overflow-hidden"
          >
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/user/repo/blob/main/path/to/file.js"
              className="flex-1 bg-black/25 border border-brand-border/10 rounded-xl px-4 py-2 text-xs text-brand-text outline-none focus:border-brand-primary"
              required
            />
            <button
              type="submit"
              disabled={githubLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-primary text-white cursor-pointer disabled:opacity-50"
            >
              {githubLoading ? 'Fetching raw contents...' : 'Fetch Code'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative">
        
        {/* Workspace Code Editor Console */}
        <div className={`${diffMode ? 'lg:col-span-12' : 'lg:col-span-7'} flex flex-col glass-panel rounded-2xl overflow-hidden border border-brand-border/10 shadow-xl min-h-[480px] transition-all duration-300`}>
          {/* Header Panel Toolbar */}
          <div className="flex justify-between items-center bg-black/25 py-3 px-5 border-b border-brand-border/10">
            <div className="flex items-center gap-2.5">
              <div className="flex gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 block"></span>
              </div>
              <span className="text-[10px] text-brand-text-muted font-mono tracking-wider ml-1">
                {diffMode ? 'interactive_side_by_side_diff.js' : 'workbench_editor.js'}
              </span>
            </div>

            {!diffMode && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearCode}
                  className="bg-brand-bg hover:bg-brand-primary/10 text-brand-text-muted hover:text-brand-text border border-brand-border/10 hover:border-brand-primary/30 text-[10px] font-bold rounded-lg px-2.5 py-1.5 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Clear Editor"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8.89M9 11l3 3L22 4"></path>
                  </svg>
                  Clear Code
                </button>
                <select 
                  value={language} 
                  onChange={handleLanguageChange}
                  className="bg-brand-bg border border-brand-border/10 text-xs rounded-lg px-2.5 py-1 text-brand-text outline-none font-medium focus:border-brand-primary"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                </select>
              </div>
            )}

            {diffMode && selectedIssueFix && (
              <span className="text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-brand-primary/20 text-brand-primary border border-brand-primary/10">
                Fix Diff: {selectedIssueFix.title}
              </span>
            )}
          </div>

          {/* Monaco Editor split or single panels */}
          <div className="flex-1 min-h-[350px] relative bg-black/10 flex flex-col md:flex-row">
            {/* Left Screen: Original Uploaded Code */}
            <div className="flex-1 min-h-[260px] relative border-b md:border-b-0 md:border-r border-brand-border/5">
              {diffMode && (
                <div className="absolute top-2 left-2 z-10 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Original Vulnerable Code
                </div>
              )}
              <Editor
                height="100%"
                language={language}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                value={code}
                onChange={(val) => setCode(val)}
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                  padding: { top: 12 },
                  readOnly: diffMode
                }}
              />
            </div>

            {/* Right Screen: Fixed Applied Code (only visible when in Split Diff mode) */}
            {diffMode && selectedIssueFix && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '100%' }}
                className="flex-1 min-h-[260px] relative bg-emerald-500/[0.02]"
              >
                <div className="absolute top-2 left-2 z-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Optimized Patch Recommendation
                </div>
                <Editor
                  height="100%"
                  language={language}
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  value={selectedIssueFix.fix}
                  options={{
                    fontSize: 13,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                    padding: { top: 12 },
                    readOnly: true
                  }}
                />
              </motion.div>
            )}
          </div>

          {/* Action Footer panel bar */}
          <div className="bg-black/15 p-4 border-t border-brand-border/5 flex justify-between items-center">
            {diffMode ? (
              <button
                onClick={() => setDiffMode(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 border border-brand-border/15 hover:bg-white/10 text-brand-text transition-all cursor-pointer"
              >
                ← Back to Playground
              </button>
            ) : (
              <span className="text-[10px] text-brand-text-muted font-semibold">
                Token Count: {code.length} characters
              </span>
            )}
            
            <button
              onClick={handleRunReview}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-primary hover:bg-brand-primary/95 text-white flex items-center gap-2 shadow-md shadow-brand-primary/20 hover:shadow-brand-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Inspecting Token Structures...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                  Run Review
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Panel Output (only visible when not in full split diff screen) */}
        {!diffMode && (
          <div className="lg:col-span-5 bg-black/5 glass-panel rounded-2xl border border-brand-border/10 shadow-xl overflow-hidden flex flex-col min-h-[480px]">
            <div className="py-3 px-5 bg-black/20 border-b border-brand-border/10 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted">
                Inspection Analysis Output
              </span>
              
              <div className="flex items-center gap-2">
                {/* Favorite toggle button */}
                {reviewResult && isAuthenticated && (
                  <button
                    onClick={handleToggleFavorite}
                    className="p-1 rounded hover:bg-white/5 text-xs transition-colors cursor-pointer"
                    title={isFavorited ? "Unfavorite Review" : "Favorite Review"}
                  >
                    {isFavorited ? '⭐' : '☆'}
                  </button>
                )}

                {reviewResult && (
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm ${
                    reviewResult.score >= 80 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                      : reviewResult.score >= 50
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}>
                    Score: {reviewResult.score}/100
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col overflow-y-auto max-h-[460px] gap-4">
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col justify-center items-center gap-4 py-24 text-center"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full border-t-2 border-brand-primary animate-spin"></div>
                      <div className="w-10 h-10 rounded-full border-b-2 border-brand-secondary animate-ping absolute inset-0 opacity-15"></div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-text">Analyzing Abstract Syntax Trees...</p>
                      <p className="text-[10px] text-brand-text-muted mt-1">Calling high-fidelity evaluation servers</p>
                    </div>
                  </motion.div>
                )}

                {errorMsg && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-brand-danger/10 border border-brand-danger/25 text-brand-danger rounded-xl p-4 text-xs font-medium leading-relaxed flex gap-2.5"
                  >
                    <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {!loading && !errorMsg && !reviewResult && (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col justify-center items-center text-center gap-3 py-20 text-brand-text-muted"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary-glow border border-brand-primary/10 flex items-center justify-center text-brand-primary/70 mb-1">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-text">Output Console Monitor</p>
                      <p className="text-[10px] text-brand-text-muted mt-1.5 max-w-[240px] leading-relaxed mx-auto">
                        Input or load code in the sandbox workbench and trigger a review to compile security metrics.
                      </p>
                    </div>
                  </motion.div>
                )}

                {!loading && !errorMsg && reviewResult && (
                  <motion.div 
                    key="results"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-5"
                  >
                    {/* Synopsis Box */}
                    <div className="p-4 rounded-xl bg-brand-primary-glow border border-brand-primary/10 shadow-sm text-left">
                      <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">synopsis</p>
                      <p className="text-xs text-brand-text mt-1.5 leading-relaxed font-medium">
                        {reviewResult.summary}
                      </p>
                    </div>

                    {/* Findings list */}
                    <div className="flex flex-col gap-4 text-left">
                      <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">
                        Identified findings ({reviewResult.issues.length})
                      </p>
                      
                      {reviewResult.issues.length === 0 ? (
                        <div className="text-center p-6 border border-dashed border-brand-border/10 rounded-xl">
                          <span className="text-[11px] text-emerald-500 font-bold">✨ No code bugs or vulnerability issues captured!</span>
                        </div>
                      ) : (
                        reviewResult.issues.map((issue, idx) => (
                          <div 
                            key={idx} 
                            className={`p-4 rounded-xl border transition-all ${
                              issue.severity === 'critical' || issue.severity === 'high'
                                ? 'bg-rose-500/5 border-rose-500/20' 
                                : issue.severity === 'medium'
                                  ? 'bg-amber-500/5 border-amber-500/20'
                                  : 'bg-brand-primary-glow border-brand-primary/20'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-extrabold text-brand-text">{issue.title}</span>
                              <span className={`text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                issue.severity === 'critical' || issue.severity === 'high'
                                  ? 'bg-rose-500/10 text-rose-500' 
                                  : issue.severity === 'medium'
                                    ? 'bg-amber-500/10 text-amber-500'
                                    : 'bg-brand-primary/20 text-brand-primary'
                              }`}>
                                {issue.severity}
                              </span>
                            </div>
                            
                            <p className="text-[11px] text-brand-text-muted leading-relaxed mb-3.5">
                              {issue.description}
                            </p>
                            
                            <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-brand-border/5">
                              <span className="text-[9.5px] text-brand-text-muted font-semibold font-mono truncate max-w-[150px]">
                                Fix: {issue.fix.split('\n')[0]}
                              </span>
                              <button
                                onClick={() => inspectFixInDiff(issue)}
                                className="px-3 py-1.5 rounded-lg text-[10px] font-extrabold bg-brand-secondary/15 hover:bg-brand-secondary/25 border border-brand-secondary/35 text-brand-secondary flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
                                </svg>
                                Compare Split Diff
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* AI Chat Side Drawer Panel */}
        <AnimatePresence>
          {chatOpen && reviewResult && (
            <motion.div
              initial={{ x: 350, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 350, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute lg:relative right-0 top-0 bottom-0 w-full lg:w-[350px] bg-black/45 backdrop-blur-md border border-brand-border/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-40 h-[480px] shrink-0"
            >
              <div className="py-3.5 px-5 bg-black/25 border-b border-brand-border/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text">AI Inspection Assistant</span>
                </div>
                <button 
                  onClick={() => setChatOpen(false)}
                  className="text-brand-text-muted hover:text-brand-text text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Chat conversations history */}
              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5 max-h-[380px]">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-2.5 py-12 text-brand-text-muted">
                    <span className="text-xl">🤖</span>
                    <p className="text-xs font-semibold text-brand-text">Ask DevInspect AI</p>
                    <p className="text-[10px] max-w-[200px] leading-relaxed mx-auto">
                      Ask clarifying questions, structural queries, or request detailed explanations about the findings.
                    </p>
                  </div>
                ) : (
                  chatHistory.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`flex flex-col gap-1 max-w-[85%] ${
                        msg.sender === 'user' ? 'align-self-end items-end ml-auto' : 'align-self-start items-start mr-auto'
                      }`}
                    >
                      <div className={`p-3 rounded-xl text-xs font-medium leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'bg-brand-primary/20 border border-brand-primary/30 text-white rounded-br-none' 
                          : 'bg-black/25 border border-brand-border/5 text-brand-text-muted rounded-bl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex items-center gap-2 text-brand-text-muted text-[10px] font-medium animate-pulse">
                    <span>🤖 DevInspect is composing response...</span>
                  </div>
                )}
              </div>

              {/* Chat Input form and dictation triggers */}
              <form onSubmit={handleSendChatMessage} className="p-3 border-t border-brand-border/5 bg-black/15 flex gap-2 items-center">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 bg-black/25 border border-brand-border/10 rounded-xl px-3.5 py-2 text-xs text-brand-text outline-none focus:border-brand-primary"
                  disabled={chatLoading}
                />
                
                {/* Voice Input Microphone */}
                <button
                  type="button"
                  onClick={handleSpeechInput}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isListening 
                      ? 'bg-rose-500/20 border-rose-500 text-rose-500 animate-pulse' 
                      : 'border-brand-border/10 text-brand-text-muted hover:text-brand-text hover:bg-white/5'
                  }`}
                  title="Speech Recognition"
                >
                  🎙️
                </button>

                <button
                  type="submit"
                  disabled={chatLoading || !chatMessage.trim()}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-primary text-white disabled:opacity-50 cursor-pointer"
                >
                  ➔
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
