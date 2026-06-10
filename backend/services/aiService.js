// backend/services/aiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { mergeWithStaticAnalysis } = require('./staticAnalyzer');

/**
 * Intelligent Mock Reviewer
 * Provides realistic static analysis of code when API key is missing or calls fail.
 */
const analyzeCodeMock = (code, language) => {
  const issues = [];
  let score = 100;
  
  const lines = code.split('\n');
  const codeTrimmed = code.trim();
  const lang = language.toLowerCase();
  
  // 1. Language-Specific Checks
  if (lang === 'javascript') {
    if (/\beval\s*\(/.test(code)) {
      issues.push({
        type: 'security',
        severity: 'critical',
        title: 'Dangerous eval() Usage Detected',
        description: 'You are using the eval() function. In JavaScript, eval() runs whatever string you give it as code. If a malicious user controls this string, they can run harmful commands on your server or app. It also makes your code slower.',
        fix: 'Replace eval() with safer alternatives like JSON.parse() if you are parsing JSON, or standard math operations.'
      });
      score -= 25;
    }
    let varCount = 0;
    lines.forEach(line => { if (/\bvar\s+[a-zA-Z0-9_$]+/.test(line) && !line.trim().startsWith('//')) varCount++; });
    if (varCount > 0) {
      issues.push({
        type: 'style',
        severity: 'low',
        title: 'Legacy "var" Keyword Used',
        description: `You used the 'var' keyword ${varCount} time(s). 'var' can cause confusing bugs because the variable exists outside of the block it was created in (like an if-statement). Modern JavaScript uses 'const' and 'let'.`,
        fix: `Refactor variable declarations to use block-scoped 'const' for variables that do not change, and 'let' for variables that do.`
      });
      score -= Math.min(varCount * 5, 15);
    }
  } else if (lang === 'python') {
    if (/\bos\.system\s*\(/.test(code)) {
      issues.push({
        type: 'security',
        severity: 'critical',
        title: 'Dangerous System Command (os.system)',
        description: 'You are using os.system() to run a shell command. If any part of the command comes from user input, a hacker can run their own commands on your server (this is called Command Injection).',
        fix: 'Use the "subprocess" module with a list of arguments instead of a single string. For example: subprocess.run(["ping", "-c", "3", host])'
      });
      score -= 25;
    }
  } else if (lang === 'cpp' || lang === 'c') {
    if (/\bgets\s*\(/.test(code)) {
      issues.push({
        type: 'security',
        severity: 'critical',
        title: 'Dangerous gets() Function Allows Buffer Overflow',
        description: 'The gets() function is highly dangerous and was removed from modern C/C++. It doesn\'t check how much data the user typed, meaning a user can type too much and crash the program or take control of it (Buffer Overflow).',
        fix: 'Use fgets(buffer, sizeof(buffer), stdin) instead of gets(), or std::cin in C++.'
      });
      score -= 30;
    }
    if (/\bstrcpy\s*\(/.test(code)) {
      issues.push({
        type: 'security',
        severity: 'high',
        title: 'Unsafe strcpy() Function Used',
        description: 'The strcpy() function copies a string, but it doesn\'t check if the destination is large enough to hold it. This easily leads to a buffer overflow if the source string is too long.',
        fix: 'Use safer alternatives like strncpy() or snprintf() in C, or std::string in C++.'
      });
      score -= 20;
    }
  } else if (lang === 'java') {
    if (code.includes('Statement stmt = conn.createStatement()') || code.includes('stmt.executeQuery(query)')) {
      issues.push({
        type: 'security',
        severity: 'high',
        title: 'SQL Injection via Statement (Java)',
        description: 'You are using a plain Statement object and gluing strings together to build a database query. A malicious user can type SQL code into your input field and trick your database into revealing passwords or deleting tables.',
        fix: 'Use a PreparedStatement with "?" placeholders instead. E.g., PreparedStatement pstmt = conn.prepareStatement("SELECT * FROM users WHERE user = ?"); pstmt.setString(1, username);'
      });
      score -= 25;
    }
  }
  
  // 2. Universal Critical Security check: Hardcoded secrets
  const secretPatterns = [
    /password\s*=\s*['"`][a-zA-Z0-9_-]{4,}['"`]/i,
    /secret\s*=\s*['"`][a-zA-Z0-9_-]{8,}['"`]/i,
    /api_key\s*=\s*['"`][a-zA-Z0-9_-]{8,}['"`]/i,
    /apikey\s*=\s*['"`][a-zA-Z0-9_-]{8,}['"`]/i,
    /jwt_secret\s*=\s*['"`][a-zA-Z0-9_-]{8,}['"`]/i,
  ];
  let hasSecrets = false;
  secretPatterns.forEach((regex) => {
    if (regex.test(code)) hasSecrets = true;
  });
  if (hasSecrets) {
    issues.push({
      type: 'security',
      severity: 'critical',
      title: 'Hardcoded Passwords/Secrets',
      description: 'You typed a password, API key, or secret directly into the code. This is very dangerous because anyone who can see the code (or the GitHub repository) can steal your passwords and access your accounts.',
      fix: 'Move all secrets to a .env file and read them using environment variables (e.g., process.env.SECRET in Node, os.getenv() in Python).'
    });
    score -= 30;
  }
  
  // 3. Universal Bug check: Silent / empty catch block
  if (/catch\s*\(.*?\)\s*\{\s*\}/.test(code) || /catch\s*\{\s*\}/.test(code) || /except.*?:[\r\n\s]*pass/.test(code)) {
    issues.push({
      type: 'bug',
      severity: 'medium',
      title: 'Silent Error Suppression (Empty Catch/Except)',
      description: 'You have a "catch" or "except" block that does nothing when an error happens. If your code breaks, it will silently ignore the error, making it incredibly frustrating and difficult to figure out why the program isn\'t working.',
      fix: 'Always handle errors. At a minimum, log the error so you can see it (e.g., print or log the error message).'
    });
    score -= 15;
  }
  
  score = Math.max(30, Math.min(score, 100));
  
  let summary = '';
  if (issues.length === 0) {
    summary = `Static review completed for this ${language} snippet. No obvious bugs, style inconsistencies, or credentials leakage were detected. The snippet looks solid and clean! \n\n**Suggestions for Future Improvements:**\n- Keep modularizing your components.\n- Add thorough unit tests for this block.\n\n**Manual Steps for Developer:**\n1. Review the code to ensure it meets your business logic requirements.\n2. Commit the changes to your version control.`;
  } else if (score >= 80) {
    summary = `The ${language} snippet is of generally high quality, but contains small styling or logging deviations. Apply the suggested optimizations to perfect it. \n\n**Suggestions for Future Improvements:**\n- Maintain consistent formatting.\n- Remove debug statements before deployment.\n\n**Manual Steps for Developer:**\n1. Review the 'Fix' suggestions below.\n2. Apply the recommended code changes manually or using the split diff tool.\n3. Run your test suite to confirm the fixes.`;
  } else if (score >= 50) {
    summary = `Review complete. Several code items are recommended for refactoring, including variable bindings, catch blocks, and/or styling constraints to enhance robust execution. \n\n**Suggestions for Future Improvements:**\n- Adopt modern language features (like block scoping in JS).\n- Improve error handling strategies.\n\n**Manual Steps for Developer:**\n1. Thoroughly review each issue reported below.\n2. Manually apply the provided fixes to your local codebase.\n3. Verify your application still builds correctly.`;
  } else {
    summary = `CRITICAL WARNING: Multiple security vulnerabilities or critical code bugs were detected. We recommend resolving these issues before integrating this module into production. \n\n**Suggestions for Future Improvements:**\n- Implement strict input validation.\n- Never hardcode secrets in source files.\n\n**Manual Steps for Developer:**\n1. IMMEDIATELY remove any hardcoded secrets from your code.\n2. Apply the security fixes detailed below.\n3. Audit the rest of your codebase for similar vulnerabilities.\n4. Re-run this AI inspection after your changes.`;
  }
  
  return {
    score,
    summary,
    issues
  };
};

/**
 * AI Code Review Service
 */
class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    
    if (this.apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        console.log(`🤖 AI Service initialized successfully using Gemini Model: ${this.modelName}`);
      } catch (err) {
        console.error('❌ Failed to initialize Google Generative AI:', err.message);
        this.genAI = null;
      }
    } else {
      console.warn('⚠️ GEMINI_API_KEY is not defined. The backend will operate in Intelligent Local Mock Fallback Mode.');
      this.genAI = null;
    }
    
    // In-memory cache for repeated reviews (Fallback if Redis is not configured)
    this.reviewCache = new Map();
  }

  /**
   * Generates structural review of a code snippet
   * @param {string} code - The code block to review
   * @param {string} language - The programming language
   * @returns {Promise<{score: number, summary: string, issues: Array}>}
   */
  async analyzeCode(code, language) {
    // Trim input
    const cleanCode = code ? code.trim() : '';
    const cleanLanguage = language ? language.trim() : 'Javascript';

    if (!cleanCode) {
      throw new Error('Code content cannot be empty');
    }
    
    const cacheKey = `${cleanLanguage}:${Buffer.from(cleanCode).toString('base64')}`;
    if (this.reviewCache.has(cacheKey)) {
      console.log('💡 Returning cached review result.');
      return this.reviewCache.get(cacheKey);
    }

    // If Gemini client is not initialized, run mock reviewer fallback
    if (!this.genAI) {
      console.log('💡 Running review using Intelligent Local Mock Reviewer.');
      const result = mergeWithStaticAnalysis(
        analyzeCodeMock(cleanCode, cleanLanguage),
        cleanCode,
        cleanLanguage
      );
      this.reviewCache.set(cacheKey, result);
      return result;
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      
      const systemInstruction = `You are DevInspect AI, an elite, senior-level code reviewer and security auditor.
Analyze the provided code snippet written in the language "${cleanLanguage}".
Evaluate the code thoroughly for:
1. Security: Hardcoded secrets, injection vectors, poor validation, unsafe execution.
2. Bugs & Correctness: Syntax errors, wrong keyword casing (e.g. Public instead of public in Java), missing semicolons, compile errors, logical mistakes, unhandled exceptions.
3. Performance: Inefficient algorithms, memory leaks, blocking loops, bloated calls.
4. Style & Readability: Confusing variables, legacy structures, lack of comments, nesting.

Never assign a score of 100 if the code would fail to compile or contains invalid keyword casing.
You MUST compile your analysis and respond with a strictly formatted JSON object matching this schema.
Important:
- Provide highly tailored reviews specific to the idioms, best practices, and standard libraries of the "${cleanLanguage}" language.
- Keep your descriptions beginner-friendly. Explain *why* a piece of code is a bug in plain English so the developer easily understands it.
- In the "fix" field, provide the exact code snippet to fix the issue clearly.
- In the "summary" field, include an overall assessment, suggestions to improve the code quality for the future, and provide manual step-by-step instructions that the developer needs to follow to implement the fixes and improve their workflow.

{
  "score": <integer from 0 to 100, where 100 is flawless and 0 is completely broken/insecure>,
  "summary": "<concise high-level overview of the code quality, suggestions to improve, and manual steps for the user to follow>",
  "issues": [
    {
      "type": "bug" | "security" | "performance" | "style" | "other",
      "severity": "low" | "medium" | "high" | "critical",
      "title": "<short descriptive title of the problem>",
      "description": "<detailed explanation of what is wrong and why it is a problem>",
      "fix": "<clear recommendation or code snippet showing how to fix the issue>"
    }
  ]
}`;

      const prompt = `Analyze this code block:
\`\`\`${cleanLanguage}
${cleanCode}
\`\`\``;

      // Define schema for Gemini's structured output
      const jsonSchema = {
        type: "OBJECT",
        properties: {
          score: { 
            type: "INTEGER", 
            description: "Quality score from 0 to 100" 
          },
          summary: { 
            type: "STRING", 
            description: "High-level summary of the code" 
          },
          issues: {
            type: "ARRAY",
            description: "List of identified issues",
            items: {
              type: "OBJECT",
              properties: {
                type: { 
                  type: "STRING", 
                  enum: ["bug", "security", "performance", "style", "other"] 
                },
                severity: { 
                  type: "STRING", 
                  enum: ["low", "medium", "high", "critical"] 
                },
                title: { type: "STRING" },
                description: { type: "STRING" },
                fix: { type: "STRING" }
              },
              required: ["type", "severity", "title", "description", "fix"]
            }
          }
        },
        required: ["score", "summary", "issues"]
      };

      const result = await model.generateContent({
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: jsonSchema,
          temperature: 0.1, // Low temperature for more analytical and repeatable results
        },
        systemInstruction: systemInstruction
      });

      const responseText = result.response.text();
      const parsedReview = JSON.parse(responseText);

      // Verify returned score boundaries
      if (typeof parsedReview.score !== 'number' || isNaN(parsedReview.score)) {
        parsedReview.score = 100;
      }
      parsedReview.score = Math.max(0, Math.min(parsedReview.score, 100));

      if (!Array.isArray(parsedReview.issues)) {
        parsedReview.issues = [];
      }

      const finalResult = mergeWithStaticAnalysis(parsedReview, cleanCode, cleanLanguage);
      this.reviewCache.set(cacheKey, finalResult);
      return finalResult;

    } catch (err) {
      console.error('❌ Gemini API Error:', err.message);
      console.log('💡 Gracefully falling back to Intelligent Local Mock Reviewer due to API error.');
      return mergeWithStaticAnalysis(
        analyzeCodeMock(cleanCode, cleanLanguage),
        cleanCode,
        cleanLanguage
      );
    }
  }

  /**
   * Generates a context-aware chat response about a specific code review
   */
  async chatAboutReview(code, language, summary, issues, chatHistory, userMessage) {
    if (!this.genAI) {
      // Mock chat assistant fallback
      const responses = [
        "That is a great question! Regarding this issue, it is highly recommended to encapsulate the variable bindings inside const or let block scopes instead of var to bypass variable hoisting glitches.",
        "To optimize this further, you should consider implementing a clean caching mechanism or memoizing highly recurrent function results to conserve processing cycles.",
        "Regarding the safety vulnerability, executing arbitrary code strings using eval() exposes your web server to Remote Code Execution (RCE) patterns. Always validate input shapes or parse via JSON.parse.",
        "Excellent query. This code structure looks pragmatic, but make sure to add descriptive logger entries inside empty catch blocks so exceptions are never silently swallowed.",
        "For database security, ensure all concatenated arguments are refactored to use parameterized variables or ORM frameworks to prevent SQL Injection inputs."
      ];
      const fallbackResponse = responses[Math.floor(Math.random() * responses.length)];
      return { response: fallbackResponse };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      
      const systemInstruction = `You are DevInspect AI, an expert software architect and security auditor.
You are helping a developer understand their code quality and security reviews.
Here is the context of the code review they are asking about:
Code Snippet:
\`\`\`${language}
${code}
\`\`\`
High-Level Review Summary:
${summary}
Identified Issues:
${JSON.stringify(issues, null, 2)}

Provide clear, helpful, and concise answers to the developer's questions. Always offer specific code snippets or optimizations where helpful. Keep your tone supportive, technical, and professional.`;

      const historyLines = (chatHistory || [])
        .slice(-6)
        .map((m) => `${m.sender === 'user' ? 'Developer' : 'Assistant'}: ${m.text}`)
        .join('\n');

      const prompt = historyLines
        ? `Previous conversation:\n${historyLines}\n\nLatest user query: "${userMessage}"`
        : `User Query: "${userMessage}"`;

      const result = await model.generateContent({
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ],
        systemInstruction: systemInstruction
      });

      return { response: result.response.text() };

    } catch (err) {
      console.error('❌ Gemini Chat API Error:', err.message);
      return { 
        response: "I encountered a minor issue parsing your prompt on my AI models. Regarding your code, verify that all validation constraints are checked and avoid legacy scope parameters."
      };
    }
  }

  /**
   * Streams a context-aware chat response about a specific code review using SSE.
   * @param {object} params - { code, language, summary, issues, chatHistory, userMessage }
   * @param {function} onChunk - Callback invoked with each text chunk: onChunk(text)
   * @returns {Promise<void>}
   */
  async streamChatAboutReview({ code, language, summary, issues, chatHistory, userMessage }, onChunk) {
    if (!this.genAI) {
      // Mock fallback: simulate streaming with chunked responses
      const responses = [
        "That is a great question! Regarding this issue, it is highly recommended to encapsulate the variable bindings inside const or let block scopes instead of var to bypass variable hoisting glitches.",
        "To optimize this further, you should consider implementing a clean caching mechanism or memoizing highly recurrent function results to conserve processing cycles.",
        "Regarding the safety vulnerability, executing arbitrary code strings using eval() exposes your web server to Remote Code Execution (RCE) patterns. Always validate input shapes or parse via JSON.parse.",
        "Excellent query. This code structure looks pragmatic, but make sure to add descriptive logger entries inside empty catch blocks so exceptions are never silently swallowed.",
        "For database security, ensure all concatenated arguments are refactored to use parameterized variables or ORM frameworks to prevent SQL Injection inputs."
      ];
      const fallback = responses[Math.floor(Math.random() * responses.length)];
      // Simulate streaming by sending word-by-word
      const words = fallback.split(' ');
      for (const word of words) {
        onChunk(word + ' ');
        await new Promise(r => setTimeout(r, 30));
      }
      return;
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });

      const systemInstruction = `You are DevInspect AI, an expert software architect and security auditor.
You are helping a developer understand their code quality and security reviews.
Here is the context of the code review they are asking about:
Code Snippet:
\`\`\`${language}
${code}
\`\`\`
High-Level Review Summary:
${summary}
Identified Issues:
${JSON.stringify(issues, null, 2)}

Provide clear, helpful, and concise answers to the developer's questions. Always offer specific code snippets or optimizations where helpful. Keep your tone supportive, technical, and professional.`;

      const historyLines = (chatHistory || [])
        .slice(-6)
        .map((m) => `${m.sender === 'user' ? 'Developer' : 'Assistant'}: ${m.text}`)
        .join('\n');

      const prompt = historyLines
        ? `Previous conversation:\n${historyLines}\n\nLatest user query: "${userMessage}"`
        : `User Query: "${userMessage}"`;

      const result = await model.generateContentStream({
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ],
        systemInstruction: systemInstruction
      });

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          onChunk(text);
        }
      }

    } catch (err) {
      console.error('❌ Gemini Stream Chat API Error:', err.message);
      onChunk("I encountered a minor issue processing your request. Please try again.");
    }
  }
}

module.exports = new AIService();
