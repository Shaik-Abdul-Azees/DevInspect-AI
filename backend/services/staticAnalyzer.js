// backend/services/staticAnalyzer.js
// Deterministic checks that always run before/after AI — catches compile-time & syntax errors.

const SEVERITY_PENALTY = { critical: 28, high: 20, medium: 12, low: 6 };

/**
 * @param {string} code
 * @param {string} language
 * @returns {{ issues: Array, scorePenalty: number }}
 */
function runStaticAnalysis(code, language) {
  const issues = [];
  const lang = (language || '').toLowerCase().trim();
  const lines = code.split('\n');

  if (lang === 'java') {
    runJavaChecks(code, lines, issues);
  } else if (lang === 'javascript') {
    runJavaScriptChecks(code, lines, issues);
  } else if (lang === 'python') {
    runPythonChecks(code, lines, issues);
  } else if (lang === 'c' || lang === 'cpp') {
    runCChecks(code, lines, issues);
  }

  runUniversalChecks(code, lines, issues);

  const scorePenalty = issues.reduce(
    (sum, i) => sum + (SEVERITY_PENALTY[i.severity] || 10),
    0
  );

  return { issues, scorePenalty };
}

/** Java reserved words that must be lowercase — wrong casing breaks compilation */
const JAVA_WRONG_CASE_KEYWORDS = [
  'Public', 'Private', 'Protected', 'Class', 'Interface', 'Enum', 'Static', 'Final',
  'Abstract', 'Void', 'Int', 'Boolean', 'Byte', 'Char', 'Long', 'Float', 'Double',
  'Short', 'If', 'Else', 'For', 'While', 'Do', 'Switch', 'Case', 'Default',
  'Break', 'Continue', 'Return', 'Try', 'Catch', 'Finally', 'Throw', 'Throws',
  'New', 'This', 'Super', 'Extends', 'Implements', 'Import', 'Package',
  'Synchronized', 'Volatile', 'Transient', 'Native', 'Instanceof', 'Assert',
];

function runJavaChecks(code, lines, issues) {
  JAVA_WRONG_CASE_KEYWORDS.forEach((wrong) => {
    const regex = new RegExp(`\\b${wrong}\\b`, 'g');
    let match;
    while ((match = regex.exec(code)) !== null) {
      const correct = wrong.toLowerCase();
      const lineNum = code.slice(0, match.index).split('\n').length;
      issues.push({
        type: 'bug',
        severity: 'critical',
        title: `Invalid Java Keyword Casing: "${wrong}"`,
        description: `On line ${lineNum}, "${wrong}" is not valid Java. Keywords are case-sensitive and must be lowercase (e.g. \`${correct}\`). Using "${wrong}" causes a compile error: "class, interface, enum, or record expected".`,
        fix: `Change \`${wrong}\` to \`${correct}\` on line ${lineNum}.`,
      });
    }
  });

  // Class name should start with uppercase (convention + common student error)
  const classDecl = code.match(/\b(?:public\s+)?class\s+([a-z][a-zA-Z0-9_]*)\s*\{/);
  if (classDecl) {
    const name = classDecl[1];
    const proper = name.charAt(0).toUpperCase() + name.slice(1);
    issues.push({
      type: 'style',
      severity: 'medium',
      title: 'Class Name Should Use PascalCase',
      description: `Class \`${name}\` should follow Java naming conventions and start with an uppercase letter (PascalCase), e.g. \`${proper}\`.`,
      fix: `Rename the class to \`${proper}\` and update references.`,
    });
  }

  // Missing semicolons on obvious statement lines
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;
    if (/^[}\{]$/.test(trimmed) || /^(public|private|protected|class|interface|enum|import|package)\b/.test(trimmed)) return;
    if (/[;{}]$/.test(trimmed)) return;
    if (
      (/System\.out\.print(ln)?\s*\([^)]*\)\s*$/.test(trimmed) ||
        /^(return\b|break\b|continue\b)/.test(trimmed) ||
        /=\s*[^;]+$/.test(trimmed)) &&
      !trimmed.endsWith(',')
    ) {
      issues.push({
        type: 'bug',
        severity: 'high',
        title: 'Missing Semicolon',
        description: `Line ${idx + 1} appears to be a statement but does not end with a semicolon (\`;\`). Java requires semicolons at the end of statements.`,
        fix: `Add a semicolon at the end of line ${idx + 1}:\n${trimmed};`,
      });
    }
  });

  // main must be inside a class
  if (/\bpublic\s+static\s+void\s+main\s*\(/.test(code) && !/\bclass\s+\w+/.test(code)) {
    issues.push({
      type: 'bug',
      severity: 'critical',
      title: 'main Method Outside a Class',
      description: 'In Java, the main method must be declared inside a class.',
      fix: 'Wrap your code in a public class, e.g. public class Main { ... }',
    });
  }
}

function runJavaScriptChecks(code, lines, issues) {
  if (/\bPublic\b|\bClass\b|\bFunction\b/.test(code)) {
    issues.push({
      type: 'bug',
      severity: 'high',
      title: 'Possible Wrong Keyword Casing (JavaScript)',
      description: 'JavaScript keywords are lowercase (public/class/function are not valid JS keywords in the same way). Check for typos like Public or Class copied from Java.',
      fix: 'Use correct JavaScript syntax: function, class (ES6), const, let.',
    });
  }
}

function runPythonChecks(code, lines, issues) {
  if (/\bPrint\s*\(/.test(code)) {
    issues.push({
      type: 'bug',
      severity: 'critical',
      title: 'Invalid Python Function: Print',
      description: 'Python 3 uses lowercase `print()`, not `Print()`.',
      fix: 'Replace Print(...) with print(...).',
    });
  }
  if (/\bDef\s+/.test(code)) {
    issues.push({
      type: 'bug',
      severity: 'critical',
      title: 'Invalid Python Keyword: Def',
      description: 'Function definitions must use lowercase `def`, not `Def`.',
      fix: 'Change Def to def.',
    });
  }
}

function runCChecks(code, lines, issues) {
  if (/\bInclude\s*</.test(code)) {
    issues.push({
      type: 'bug',
      severity: 'critical',
      title: 'Invalid Preprocessor: Include',
      description: 'C/C++ uses `#include`, not `Include`.',
      fix: 'Use #include <stdio.h> or #include "header.h".',
    });
  }
}

function runUniversalChecks(code, lines, issues) {
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    issues.push({
      type: 'bug',
      severity: 'high',
      title: 'Mismatched Curly Braces',
      description: `Found ${openBraces} opening \`{\` but ${closeBraces} closing \`}\`. Braces must be balanced.`,
      fix: 'Add or remove braces so every `{` has a matching `}`.',
    });
  }

  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    issues.push({
      type: 'bug',
      severity: 'high',
      title: 'Mismatched Parentheses',
      description: `Found ${openParens} \`(\` but ${closeParens} \`)\`.`,
      fix: 'Balance all parentheses in your code.',
    });
  }
}

/**
 * Deduplicate issues by title (case-insensitive)
 */
function dedupeIssues(issues) {
  const seen = new Set();
  return issues.filter((issue) => {
    const key = issue.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildSummary(language, score, issueCount) {
  const lang = language || 'code';
  if (issueCount === 0) {
    return `Static and AI review completed for this ${lang} snippet. No obvious bugs, style issues, or credential leaks were detected.\n\n**Suggestions:** Add unit tests and keep modularizing.\n\n**Next steps:** Verify business logic, then commit.`;
  }
  if (score >= 80) {
    return `Review complete for ${lang}. Minor issues were found — apply the fixes below.\n\n**Next steps:** Fix each finding, re-run review, then run your test suite.`;
  }
  if (score >= 50) {
    return `Review complete for ${lang}. Several issues need attention before this code is production-ready.\n\n**Next steps:** Fix syntax and logic errors first, then re-run DevInspect.`;
  }
  return `CRITICAL: ${lang} snippet has serious errors (syntax, security, or logic). Fix all critical items before deploying.\n\n**Next steps:** Address critical findings immediately and re-run the inspection.`;
}

/**
 * Merge static analyzer output with AI/mock review (static findings always kept)
 */
function mergeWithStaticAnalysis(aiReview, code, language) {
  const { issues: staticIssues, scorePenalty } = runStaticAnalysis(code, language);
  const aiIssues = Array.isArray(aiReview?.issues) ? aiReview.issues : [];

  const mergedIssues = dedupeIssues([...staticIssues, ...aiIssues]);

  let score =
    typeof aiReview?.score === 'number' && !Number.isNaN(aiReview.score)
      ? aiReview.score
      : 100;

  if (staticIssues.length > 0) {
    score = Math.min(score, Math.max(0, 100 - scorePenalty));
    if (staticIssues.some((i) => i.severity === 'critical')) {
      score = Math.min(score, 55);
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  const summary =
    staticIssues.length > 0 && aiIssues.length === 0
      ? buildSummary(language, score, mergedIssues.length)
      : aiReview?.summary || buildSummary(language, score, mergedIssues.length);

  return {
    score,
    summary,
    issues: mergedIssues,
  };
}

module.exports = {
  runStaticAnalysis,
  mergeWithStaticAnalysis,
  buildSummary,
};
