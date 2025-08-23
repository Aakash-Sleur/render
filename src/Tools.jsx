import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

const Tools = () => {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (text.trim() === "") return;
    navigator.clipboard.writeText(
      `\\includegraphics[width=1.04167in,height=0.29167in,alt={image}]{${text}}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // reset icon after 1.5s
  };

  return (
    <div className="flex items-center space-x-2 p-4 max-w-md mx-auto">
      <input
        type="text"
        placeholder="Type something..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleCopy}
        className="p-2 rounded-xl border bg-white hover:bg-gray-100 transition"
      >
        {copied ? (
          <Check className="w-5 h-5 text-green-600" />
        ) : (
          <Copy className="w-5 h-5 text-gray-700" />
        )}
      </button>
    </div>
  );
};

export default Tools;
