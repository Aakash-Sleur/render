import { useNavigate } from "react-router-dom";
import {
  FileSpreadsheet,
  Upload,
  Wrench,
  FileText,
  ScanLine,
  ArrowRight,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const pages = [
    {
      title: "Excel Viewer",
      description: "View and analyze Excel spreadsheets",
      path: "/excel",
      icon: FileSpreadsheet,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Excel Uploader",
      description: "Upload and process Excel files",
      path: "/upload",
      icon: Upload,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Tools",
      description: "Various utility tools and functions",
      path: "/tools",
      icon: Wrench,
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "OMR Generator",
      description: "Generate Optical Mark Recognition sheets",
      path: "/omr",
      icon: ScanLine,
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      title: "Markdown Viewer",
      description: "View and edit markdown files with live preview",
      path: "/markdown",
      icon: FileText,
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Your Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose from the available tools and utilities to get started with
            your tasks
          </p>
        </div>

        {/* Page Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => {
            const IconComponent = page.icon;
            return (
              <div
                key={page.path}
                onClick={() => navigate(page.path)}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${page.color} text-white`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {page.title}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    {page.description}
                  </p>
                </div>

                <div className="px-6 pb-6">
                  <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                    Open Tool
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>Select any tool above to get started</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
