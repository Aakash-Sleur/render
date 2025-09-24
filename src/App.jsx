import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import ExcelViewer from "./ExcelViewer";
import ExcelUploader from "./ExcelUpload";
import Tools from "./Tools";
import GenerateOMR from "./OMRGenerator";
import MarkdownViewer from "./MarkdownViewer";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/excel" element={<ExcelViewer />} />
      <Route path="/upload" element={<ExcelUploader />} />
      <Route path="/tools" element={<Tools />} />
      <Route path="/omr" element={<GenerateOMR />} />
      <Route path="/markdown" element={<MarkdownViewer />} />
    </Routes>
  );
};

export default App;
