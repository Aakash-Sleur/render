import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { FileText, Eye, Edit3, Upload, File } from "lucide-react";

const MarkdownViewer = () => {
  const [markdown, setMarkdown] = useState(`# Welcome to Markdown Viewer

This is a **markdown viewer** that allows you to input markdown text and see the rendered output in real-time.

## Features

- Live preview
- Tailwind CSS styling
- Support for all standard markdown elements

### Example Content

Here's some example markdown:

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

> This is a blockquote

- List item 1
- List item 2
- List item 3

[Link example](https://example.com)

---

**Bold text** and *italic text*
`);

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if ((file && file.type === "text/markdown") || file.name.endsWith(".md")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMarkdown(e.target.result);
        setFileName(file.name);
      };
      reader.readAsText(file);
    } else {
      alert("Please select a valid markdown file (.md)");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Markdown Viewer
                </h1>
                <p className="text-gray-600">
                  {fileName
                    ? `Viewing: ${fileName}`
                    : "Upload a markdown file or type directly"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload .md
                <input
                  type="file"
                  accept=".md,.markdown"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setIsPreviewMode(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  !isPreviewMode
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setIsPreviewMode(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isPreviewMode
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isPreviewMode ? (
            /* Preview Mode - Full Width */
            <div className="p-6">
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-semibold text-gray-800 mb-3 mt-6">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {children}
                      </p>
                    ),
                    code: ({ inline, children }) =>
                      inline ? (
                        <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono">
                          {children}
                        </code>
                      ) : (
                        <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-sm">
                          {children}
                        </code>
                      ),
                    pre: ({ children }) => (
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                        {children}
                      </pre>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 text-gray-700 italic mb-4">
                        {children}
                      </blockquote>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {children}
                      </a>
                    ),
                    hr: () => <hr className="border-gray-300 my-6" />,
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-900">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-gray-800">{children}</em>
                    ),
                  }}
                >
                  {markdown}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            /* Split View - Editor and Preview */
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
              {/* Editor */}
              <div className="border-r border-gray-200">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">
                    Markdown Input
                  </h3>
                  {fileName && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <File className="w-3 h-3" />
                      {fileName}
                    </div>
                  )}
                </div>
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="w-full h-full min-h-[600px] p-4 font-mono text-sm resize-none border-none outline-none focus:ring-0"
                  placeholder="Enter your markdown here..."
                />
              </div>

              {/* Preview */}
              <div>
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700">
                    Live Preview
                  </h3>
                </div>
                <div className="p-4 h-full overflow-y-auto">
                  <div className="prose max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-2xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xl font-semibold text-gray-800 mb-2 mt-4">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-3">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-gray-700 mb-3 leading-relaxed">
                            {children}
                          </p>
                        ),
                        code: ({ inline, children }) =>
                          inline ? (
                            <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono">
                              {children}
                            </code>
                          ) : (
                            <code className="block bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto font-mono text-sm">
                              {children}
                            </code>
                          ),
                        pre: ({ children }) => (
                          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto mb-3">
                            {children}
                          </pre>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-blue-500 pl-3 py-1 bg-blue-50 text-gray-700 italic mb-3">
                            {children}
                          </blockquote>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-700">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="mb-1">{children}</li>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {children}
                          </a>
                        ),
                        hr: () => <hr className="border-gray-300 my-4" />,
                        strong: ({ children }) => (
                          <strong className="font-semibold text-gray-900">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic text-gray-800">{children}</em>
                        ),
                      }}
                    >
                      {markdown}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkdownViewer;
