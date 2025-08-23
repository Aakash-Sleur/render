import React from "react";
import { Route, Routes } from "react-router-dom";
import ExcelViewer from "./ExcelViewer";
import ExcelUploader from "./ExcelUpload";
import Tools from "./Tools";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<ExcelViewer />} />
      <Route path="/upload" element={<ExcelUploader />} />
      <Route path="/tools" element={<Tools />} />
    </Routes>
  );
};

export default App;
