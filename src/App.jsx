import React, { useState } from "react";
import * as XLSX from "xlsx";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

const subjectColors = {
  Mathematics: "#1E88E5", // Blue
  Physics: "#8E24AA", // Purple
  Chemistry: "#F4511E", // Orange
  Biology: "#43A047", // Green
  English: "#FB8C00", // Amber
  History: "#6D4C41", // Brown
  Geography: "#00897B", // Teal
  ComputerScience: "#3949AB", // Indigo
  Economics: "#E53935", // Red
  Default: "#546E7A", // Grey for unknown subjects
};

export default function App() {
  const [questions, setQuestions] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;

      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      const formattedData = parsedData.map((row) => ({
        serialNumber: row["Serial Number"]?.toString() || "",
        question: row["Question"] || "",
        optionA: row["Option A"] || row["Option a"] || "",
        optionB: row["Option B"] || row["Option b"] || "",
        optionC: row["Option C"] || row["Option c"] || "",
        optionD: row["Option D"] || row["Option d"] || "",
        answers: row["Answers"] || row["Correct option"] || "",
        qnType: row["Question Type"] || "",
        topic: row["Topic"] || "",
        chapter: row["Chapter"] || "",
        subject: row["Subject"] || "",
        exam: row["Exam"] || "",
      }));

      setQuestions(formattedData);
    };

    reader.readAsBinaryString(file);
  };

  const isImageUrl = (text) => {
    const urlRegex =
      /^https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|bmp|svg|webp)(\?[^\s]*)?$/i;
    const cloudinaryRegex = /^https?:\/\/res\.cloudinary\.com\/[^\s]+/i;
    return urlRegex.test(text) || cloudinaryRegex.test(text);
  };

  const isLikelyLatex = (content) => {
    const latexPatterns = [
      /\\[a-zA-Z]+/,
      /\^[{]?[^}]*[}]?/,
      /_[{]?[^}]*[}]?/,
      /\\frac|\\sqrt|\\sum|\\int|\\lim|\\text|\\Delta|\\ominus|\\overset|\\underset/,
      /[{}]/,
      /\\[a-zA-Z]+\{/,
      /\[[A-Za-z]\]_\d/,
      /\\left|\\right/,
      /\\\(|\\\)/,
    ];

    const obviousTextPatterns = [
      /^[a-zA-Z\s.,!?]+$/,
      /^[a-zA-Z\s=]+[a-zA-Z\s]+$/,
    ];

    if (
      content.length > 30 &&
      obviousTextPatterns.some((pattern) => pattern.test(content)) &&
      !latexPatterns.some((pattern) => pattern.test(content))
    ) {
      return false;
    }

    return latexPatterns.some((pattern) => pattern.test(content));
  };

  const cleanLatexText = (text) => {
    return text
      .replace(/\{\[\}\s*([^{}]+?)\s*\{\]\}/g, "[$1]")
      .replace(/([A-Za-z])\{\[\]\}/g, "[$1]")
      .replace(/\{\[\}/g, "[")
      .replace(/\{\]\}/g, "]")
      .replace(/\\textgreater\{\}/g, ">")
      .replace(/\\textless\{\}/g, "<")
      .replace(/\\textdegree\{\}/g, "°")
      .replace(/\s*\\,\s*/g, " ")
      .replace(/\s*\\\s+/g, " ")
      .replace(/\s+\\([a-zA-Z]+)/g, "\\$1")
      .replace(/\\([a-zA-Z]+)\s+/g, "\\$1 ")
      .replace(/\\\$/g, "$")
      .replace(/\\\&/g, "&")
      .replace(/\\\%/g, "%")
      .replace(/\s*([=<>±×÷])\s*/g, " $1 ");
  };

  const parseEnumerateList = (text) => {
    // Check if text contains enumerate environment
    const enumerateRegex = /\\begin\{enumerate\}(.*?)\\end\{enumerate\}/s;
    const match = text.match(enumerateRegex);

    if (!match) return null;

    const [fullMatch, content] = match;
    const beforeText = text.substring(0, match.index).trim();
    const afterText = text.substring(match.index + fullMatch.length).trim();

    // Extract items from the enumerate content
    const itemRegex = /\\item\s+(.*?)(?=\\item|$)/gs;
    const items = [];
    let itemMatch;

    while ((itemMatch = itemRegex.exec(content)) !== null) {
      const itemContent = itemMatch[1].trim();
      if (itemContent) {
        items.push(itemContent);
      }
    }

    return {
      beforeText,
      afterText,
      items,
      fullMatch,
    };
  };

  const renderWithLatexAndImages = (text) => {
    if (!text) return null;

    // Check for enumerate list first
    const enumerateData = parseEnumerateList(text);
    if (enumerateData) {
      return (
        <div style={{ lineHeight: "1.6" }}>
          {enumerateData.beforeText && (
            <div style={{ marginBottom: "10px" }}>
              {renderContent(enumerateData.beforeText)}
            </div>
          )}
          <ol
            style={{
              paddingLeft: "20px",
              marginBottom: "10px",
              listStyleType: "decimal",
            }}
          >
            {enumerateData.items.map((item, index) => (
              <li
                key={index}
                style={{
                  marginBottom: "8px",
                  lineHeight: "1.6",
                }}
              >
                {renderContent(item)}
              </li>
            ))}
          </ol>
          {enumerateData.afterText && (
            <div style={{ marginTop: "10px" }}>
              {renderContent(enumerateData.afterText)}
            </div>
          )}
        </div>
      );
    }

    // First check for assertion-reason pattern
    const assertionReasonMatch = text.match(
      /^(.+?Assertion(?:\(A\))?[:\s]+(.+?))\s+(.+?Reason(?:\(R\))?[:\s]+(.+?))$/i
    );
    if (assertionReasonMatch) {
      const [_, assertionFull, assertionContent, reasonContent] =
        assertionReasonMatch;
      return (
        <div style={{ lineHeight: "1.6" }}>
          <div>
            <strong>Assertion: </strong>
            {renderContent(assertionContent)}
          </div>
          <div style={{ marginTop: "8px" }}>
            <strong>Reason: </strong>
            {renderContent(reasonContent)}
          </div>
        </div>
      );
    }

    // Handle LaTeX underline pattern: \_\_\_\_\_\_\_
    // Replace sequences of 3 or more underscores with an underlined blank
    let preprocessedText = text.replace(/\\_{1,}/g, (match) => {
      const length = match.length - 1;
      return `__`;
    });

    // Normal rendering for non-assertion-reason content
    return renderContent(preprocessedText);

    function renderContent(content) {
      let cleanedText = cleanLatexText(content);

      const patterns = [
        /\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}/g,
        /\$([^$]+)\$/g,
        /\\\(([^\\]*(?:\\[^)]*)*[^\\]*)\\\)/g,
        /\|([^|]+)\|/g,
        /\\[a-zA-Z]+(?:\{[^{}]*(?:\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}[^{}]*)*\})+/g,
        /[a-zA-Z]+(?:\s*\\?\s*[_^]\s*\{\s*[^}]+\s*\})+/g,
        /\\[a-zA-Z]+(?!\{)/g,
      ];

      const parts = [];
      let lastIndex = 0;
      const matches = [];

      patterns.forEach((pattern) => {
        let match;
        while ((match = pattern.exec(cleanedText)) !== null) {
          matches.push({
            match: match,
            index: match.index,
            length: match[0].length,
            fullMatch: match[0],
            content: match[1] || match[0],
          });
        }
      });

      matches.sort((a, b) => a.index - b.index);

      const nonOverlappingMatches = [];
      let lastEndIndex = -1;
      for (const match of matches) {
        if (match.index >= lastEndIndex) {
          nonOverlappingMatches.push(match);
          lastEndIndex = match.index + match.length;
        }
      }

      for (const matchInfo of nonOverlappingMatches) {
        const { match, index, length, fullMatch, content } = matchInfo;

        if (index > lastIndex) {
          const beforeText = cleanedText.slice(lastIndex, index);
          if (beforeText.trim()) {
            parts.push({ type: "text", value: beforeText });
          }
        }

        if (fullMatch.startsWith("\\includegraphics")) {
          const imageUrl = content.trim();
          let imgUrl = imageUrl;

          const driveMatch = imgUrl.match(
            /drive\.google\.com\/file\/d\/([^/]+)/
          );
          if (driveMatch?.[1]) {
            imgUrl = `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
          }

          parts.push({ type: "image", value: imgUrl });
        } else if (isImageUrl(content.trim())) {
          let imgUrl = content.trim();

          const driveMatch = imgUrl.match(
            /drive\.google\.com\/file\/d\/([^/]+)/
          );
          if (driveMatch?.[1]) {
            imgUrl = `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
          }

          parts.push({ type: "image", value: imgUrl });
        } else if (fullMatch.startsWith("$") || fullMatch.startsWith("\\(")) {
          parts.push({ type: "latex", value: content.trim() });
        } else if (fullMatch.startsWith("|") && isLikelyLatex(content.trim())) {
          parts.push({ type: "latex", value: content.trim() });
        } else if (fullMatch.startsWith("|")) {
          parts.push({ type: "text", value: fullMatch });
        } else if (
          fullMatch.match(/[a-zA-Z]+(?:\s*\\?\s*[_^]\s*\{\s*[^}]+\s*\})+/) ||
          fullMatch.startsWith("\\")
        ) {
          const latexContent = fullMatch.replace(/\s+/g, "");
          parts.push({ type: "latex", value: latexContent });
        } else {
          parts.push({ type: "text", value: fullMatch });
        }

        lastIndex = index + length;
      }

      if (lastIndex < cleanedText.length) {
        const remainingText = cleanedText.slice(lastIndex);
        if (remainingText.trim()) {
          parts.push({ type: "text", value: remainingText });
        }
      }

      if (parts.length === 0) {
        parts.push({ type: "text", value: cleanedText });
      }

      return parts.map((part, i) => {
        if (part.type === "text") {
          return (
            <span key={i} style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              {part.value}
            </span>
          );
        } else if (part.type === "image") {
          return (
            <div key={i} style={{ margin: "10px 0", textAlign: "center" }}>
              <img
                src={part.value}
                alt="Question content"
                style={{
                  maxWidth: "100%",
                  maxHeight: "400px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
                onError={(e) => {
                  console.error("Image failed to load:", part.value);
                  e.target.parentElement.innerHTML = `<span style="color: red; font-style: italic;">[Image failed to load: ${part.value}]</span>`;
                }}
              />
            </div>
          );
        } else if (part.type === "latex") {
          try {
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  verticalAlign: "baseline",
                  margin: "0 2px",
                }}
              >
                <InlineMath math={part.value} />
              </span>
            );
          } catch (error) {
            console.error(
              "LaTeX rendering error:",
              error,
              "Content:",
              part.value
            );
            return (
              <span
                key={i}
                style={{
                  color: "#d32f2f",
                  backgroundColor: "#ffebee",
                  padding: "2px 4px",
                  borderRadius: "3px",
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: "0.9em",
                }}
              >
                [LaTeX Error: {part.value}]
              </span>
            );
          }
        }
        return null;
      });
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "'Noto Sans', sans-serif",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        lineHeight: "1.6",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
          marginBottom: "20px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            color: "#212529",
            marginBottom: "20px",
            fontSize: "28px",
            fontWeight: "600",
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          Excel Question Viewer
        </h2>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "500",
              color: "#495057",
              fontSize: "16px",
            }}
          >
            Upload Excel File (.xlsx, .xls):
          </label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            style={{
              padding: "12px",
              border: "2px dashed #dee2e6",
              borderRadius: "6px",
              width: "100%",
              fontSize: "14px",
              cursor: "pointer",
              backgroundColor: "#f8f9fa",
              transition: "border-color 0.15s ease-in-out",
            }}
          />
        </div>

        {questions.length === 0 && (
          <div
            style={{
              color: "#6c757d",
              fontStyle: "italic",
              textAlign: "center",
              padding: "40px",
              backgroundColor: "#f8f9fa",
              borderRadius: "6px",
              border: "1px solid #e9ecef",
              fontSize: "16px",
            }}
          >
            <p style={{ margin: 0 }}>
              📄 Please upload an Excel file to view questions with LaTeX and
              image support.
            </p>
          </div>
        )}
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {questions.map((q, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "white",
              border: "1px solid #e9ecef",
              padding: "25px",
              marginBottom: "25px",
              borderRadius: "10px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  fontSize: "14px",
                  color: "#000000ff",
                  fontFamily: "'Noto Sans', sans-serif",
                  marginTop: "8px",
                  display: "flex",
                  gap: "18px",
                  flexWrap: "wrap",
                  marginBottom: "2rem",
                }}
              >
                {q.topic && (
                  <span>
                    📚 <strong>Topic:</strong> {q.topic}
                  </span>
                )}
                {q.chapter && (
                  <span>
                    📖 <strong>Chapter:</strong> {q.chapter}
                  </span>
                )}
                {q.subject && (
                  <span
                    style={{
                      color: subjectColors[q.subject] || subjectColors.Default,
                      fontWeight: 800,
                    }}
                  >
                    📝 <strong>Subject:</strong>{" "}
                    <span
                      style={{
                        color:
                          subjectColors[q.subject] || subjectColors.Default,
                        fontWeight: 800,
                      }}
                    >
                      {q.subject}
                    </span>
                  </span>
                )}
                {q.exam && (
                  <span>
                    🎓 <strong>Exam:</strong> {q.exam}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#212529",
                  marginRight: "10px",
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                {q.serialNumber || index + 1}.
              </span>
              <span
                style={{
                  fontSize: "16px",
                  lineHeight: "1.6",
                  fontFamily: "'Noto Sans', sans-serif",
                }}
              >
                {renderWithLatexAndImages(q.question)}
              </span>
            </div>

            <div style={{ marginLeft: "25px", marginBottom: "20px" }}>
              {[
                { label: "A", content: q.optionA },
                { label: "B", content: q.optionB },
                { label: "C", content: q.optionC },
                { label: "D", content: q.optionD },
              ].map((option) => (
                <div
                  key={option.label}
                  style={{
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}
                >
                  <strong
                    style={{
                      color: "#495057",
                      minWidth: "20px",
                      fontSize: "15px",
                      fontFamily: "'Roboto', sans-serif",
                    }}
                  >
                    {option.label}:
                  </strong>
                  <div
                    style={{
                      flex: 1,
                      lineHeight: "1.6",
                      fontFamily: "'Noto Sans', sans-serif",
                    }}
                  >
                    {renderWithLatexAndImages(option.content)}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: "15px",
                backgroundColor: "#e8f3ed",
                borderRadius: "6px",
                borderLeft: "4px solid #2e7d32",
                marginTop: "15px",
              }}
            >
              <strong
                style={{
                  color: "#1b5e20",
                  fontSize: "15px",
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                Answer:
              </strong>
              <div
                style={{
                  marginTop: "8px",
                  color: "#1b5e20",
                  lineHeight: "1.6",
                  fontFamily: "'Noto Sans', sans-serif",
                }}
              >
                {renderWithLatexAndImages(q.answers)}
              </div>
            </div>
          </div>
        ))}
        <button
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: "#007bff",
            border: "none",
            color: "white",
            fontSize: "18px",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0,123,255,0.3)",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => window.location.reload()}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#0056b3";
            e.target.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#007bff";
            e.target.style.transform = "scale(1)";
          }}
          title="Reload Page"
        >
          🔄
        </button>
      </div>
    </div>
  );
}
