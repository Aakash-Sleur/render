import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";
import { Download, FileText, Settings, Eye, Plus, Minus } from "lucide-react";

export default function GenerateOMR() {
  const [config, setConfig] = useState({
    examTitle: "Examination Answer Sheet",
    instituteName: "Educational Institution",
    totalQuestions: 50,
    optionsPerQuestion: 4,
    questionsPerRow: 4,
    includeStudentInfo: true,
    includeInstructions: true,
    paperSize: "A4",
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const createOMRSheet = async () => {
    setIsGenerating(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const pageSize = config.paperSize === "A4" ? [595, 842] : [612, 792]; // A4 or Letter
      const page = pdfDoc.addPage(pageSize);
      const { height, width } = page.getSize();

      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

      let currentY = height - 30;

      // Header with enhanced design
      page.drawRectangle({
        x: 20,
        y: currentY - 55,
        width: width - 40,
        height: 50,
        color: rgb(0.95, 0.97, 1),
        borderColor: rgb(0.2, 0.4, 0.8),
        borderWidth: 2,
      });

      // Inner header border for depth
      page.drawRectangle({
        x: 25,
        y: currentY - 50,
        width: width - 50,
        height: 40,
        borderColor: rgb(0.7, 0.8, 0.9),
        borderWidth: 1,
      });

      // Title
      page.drawText(config.examTitle, {
        x: width / 2 - config.examTitle.length * 6,
        y: currentY - 25,
        size: 18,
        font: fontBold,
        color: rgb(0.1, 0.2, 0.6),
      });

      // Institute name
      page.drawText(config.instituteName, {
        x: width / 2 - config.instituteName.length * 4,
        y: currentY - 42,
        size: 12,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3),
      });

      currentY -= 70;

      // Student Information Section
      if (config.includeStudentInfo) {
        // Main border
        page.drawRectangle({
          x: 20,
          y: currentY - 85,
          width: width - 40,
          height: 80,
          color: rgb(0.98, 0.99, 1),
          borderColor: rgb(0.3, 0.3, 0.3),
          borderWidth: 1.5,
        });

        // Header section for student info
        page.drawRectangle({
          x: 20,
          y: currentY - 30,
          width: width - 40,
          height: 25,
          color: rgb(0.9, 0.94, 0.98),
          borderColor: rgb(0.6, 0.7, 0.8),
          borderWidth: 1,
        });

        page.drawText("STUDENT INFORMATION", {
          x: 30,
          y: currentY - 20,
          size: 12,
          font: fontBold,
          color: rgb(0.1, 0.3, 0.7),
        });

        // Student info fields
        const fields = [
          "Name: ________________________________",
          "Roll Number: __________________________",
          "Class/Section: ________________________",
          "Date: ________________________________",
        ];

        fields.forEach((field, index) => {
          const x = index % 2 === 0 ? 30 : 300;
          const y = currentY - 40 - Math.floor(index / 2) * 20;
          page.drawText(field, { x, y, size: 10, font: fontRegular });
        });

        currentY -= 100;
      }

      // Instructions
      if (config.includeInstructions) {
        page.drawText("INSTRUCTIONS:", {
          x: 30,
          y: currentY - 10,
          size: 12,
          font: fontBold,
          color: rgb(0.8, 0, 0),
        });

        const instructions = [
          "• Use only HB pencil to fill the bubbles completely",
          "• Do not make any stray marks on this sheet",
          "• Fill only one bubble per question",
          "• Erase completely if you want to change your answer",
        ];

        instructions.forEach((instruction, index) => {
          page.drawText(instruction, {
            x: 30,
            y: currentY - 30 - index * 15,
            size: 9,
            font: fontRegular,
            color: rgb(0.3, 0.3, 0.3),
          });
        });

        currentY -= 90;
      }

      // Answer Section Header
      page.drawRectangle({
        x: 20,
        y: currentY - 25,
        width: width - 40,
        height: 30,
        color: rgb(0.9, 0.94, 0.98),
        borderColor: rgb(0.4, 0.5, 0.7),
        borderWidth: 1,
      });

      page.drawText("ANSWER SECTION", {
        x: 30,
        y: currentY - 15,
        size: 14,
        font: fontBold,
        color: rgb(0.1, 0.2, 0.6),
      });

      // Add small instruction
      page.drawText("Fill the circles completely with HB pencil", {
        x: width - 250,
        y: currentY - 15,
        size: 9,
        font: fontRegular,
        color: rgb(0.4, 0.4, 0.4),
      });

      currentY -= 45;

      // Generate answer bubbles - declare variables first
      const options = [];
      for (let i = 0; i < config.optionsPerQuestion; i++) {
        options.push(String.fromCharCode(65 + i)); // A, B, C, D, E...
      }

      const questionsPerRow = config.questionsPerRow;
      const bubbleSize = 8;
      const optionSpacing = 30; // Space between A, B, C, D options
      const questionNumberWidth = 40;
      const questionWidth =
        questionNumberWidth + config.optionsPerQuestion * optionSpacing;
      const totalContentWidth = width - 100; // Leave proper margins
      const questionSpacing = totalContentWidth / questionsPerRow;
      const rowHeight = 55;

      // Calculate how many questions fit per page
      const availableHeight = currentY - 100; // Leave space for footer
      const maxRowsPerPage = Math.floor(availableHeight / rowHeight);
      const questionsPerPage = maxRowsPerPage * questionsPerRow;

      let currentPage = page;
      let currentPageY = currentY;
      let questionsOnCurrentPage = 0;

      // Function to create a new page with header
      const createNewPage = () => {
        const newPage = pdfDoc.addPage(pageSize);
        const { height: newHeight, width: newWidth } = newPage.getSize();

        // Add header to new page
        newPage.drawRectangle({
          x: 20,
          y: newHeight - 55,
          width: newWidth - 40,
          height: 50,
          color: rgb(0.95, 0.97, 1),
          borderColor: rgb(0.2, 0.4, 0.8),
          borderWidth: 2,
        });

        newPage.drawRectangle({
          x: 25,
          y: newHeight - 50,
          width: newWidth - 50,
          height: 40,
          borderColor: rgb(0.7, 0.8, 0.9),
          borderWidth: 1,
        });

        newPage.drawText(config.examTitle + " (Continued)", {
          x: newWidth / 2 - config.examTitle.length * 6,
          y: newHeight - 25,
          size: 18,
          font: fontBold,
          color: rgb(0.1, 0.2, 0.6),
        });

        // Answer section header
        newPage.drawRectangle({
          x: 20,
          y: newHeight - 100,
          width: newWidth - 40,
          height: 20,
          color: rgb(0.9, 0.94, 0.98),
          borderColor: rgb(0.4, 0.5, 0.7),
          borderWidth: 1,
        });

        newPage.drawText("ANSWER SECTION (Continued)", {
          x: 30,
          y: newHeight - 90,
          size: 14,
          font: fontBold,
          color: rgb(0.1, 0.2, 0.6),
        });

        return { page: newPage, startY: newHeight - 120 };
      };

      // Draw initial answer section background
      const initialRows = Math.min(
        maxRowsPerPage,
        Math.ceil(config.totalQuestions / questionsPerRow)
      );
      const initialSectionHeight = initialRows * rowHeight + 30;

      page.drawRectangle({
        x: 25,
        y: currentY - initialSectionHeight,
        width: width - 50,
        height: initialSectionHeight,
        color: rgb(0.99, 0.99, 1),
        borderColor: rgb(0.7, 0.7, 0.8),
        borderWidth: 1,
      });

      // Add subtle grid lines for better organization
      for (let i = 1; i < questionsPerRow; i++) {
        const lineX = 50 + i * questionSpacing;
        page.drawLine({
          start: { x: lineX - questionSpacing / 2, y: currentY - 10 },
          end: {
            x: lineX - questionSpacing / 2,
            y: currentY - initialSectionHeight + 10,
          },
          thickness: 0.3,
          color: rgb(0.9, 0.9, 0.9),
        });
      }

      for (let q = 1; q <= config.totalQuestions; q++) {
        // Check if we need a new page
        if (
          questionsOnCurrentPage >= questionsPerPage &&
          q <= config.totalQuestions
        ) {
          const newPageData = createNewPage();
          currentPage = newPageData.page;
          currentPageY = newPageData.startY;
          questionsOnCurrentPage = 0;

          // Draw background for new page
          const remainingQuestions = config.totalQuestions - q + 1;
          const remainingRows = Math.ceil(remainingQuestions / questionsPerRow);
          const newSectionHeight = Math.min(
            remainingRows * rowHeight + 20,
            availableHeight
          );

          currentPage.drawRectangle({
            x: 25,
            y: currentPageY - newSectionHeight,
            width: width - 50,
            height: newSectionHeight,
            color: rgb(0.99, 0.99, 1),
            borderColor: rgb(0.8, 0.8, 0.9),
            borderWidth: 0.5,
          });
        }

        const rowOnPage = Math.floor(questionsOnCurrentPage / questionsPerRow);
        const col = questionsOnCurrentPage % questionsPerRow;

        const baseX = 50 + col * questionSpacing;
        const baseY = currentPageY - rowOnPage * rowHeight - 20;

        // Question number with enhanced background
        currentPage.drawRectangle({
          x: baseX - 8,
          y: baseY + 2,
          width: 35,
          height: 20,
          color: rgb(0.85, 0.9, 0.95),
          borderColor: rgb(0.4, 0.5, 0.7),
          borderWidth: 1.5,
        });

        // Inner shadow effect
        currentPage.drawRectangle({
          x: baseX - 7,
          y: baseY + 3,
          width: 33,
          height: 18,
          color: rgb(0.92, 0.96, 0.99),
          borderColor: rgb(0.7, 0.75, 0.8),
          borderWidth: 0.5,
        });

        // Question number text
        const qText = `Q${q}`;
        const textWidth = qText.length * 6;
        currentPage.drawText(qText, {
          x: baseX + (35 - textWidth) / 2 - 8,
          y: baseY + 8,
          size: 11,
          font: fontBold,
          color: rgb(0.1, 0.2, 0.5),
        });

        // Draw option bubbles
        options.forEach((option, optIndex) => {
          const bubbleX = baseX + 35 + optIndex * optionSpacing;
          const bubbleY = baseY + 12;

          // Outer circle (border)
          currentPage.drawCircle({
            x: bubbleX,
            y: bubbleY,
            size: bubbleSize + 1,
            borderColor: rgb(0, 0, 0),
            borderWidth: 2.5,
            color: rgb(1, 1, 1),
          });

          // Inner circle (slight shadow effect)
          currentPage.drawCircle({
            x: bubbleX,
            y: bubbleY,
            size: bubbleSize - 1,
            borderColor: rgb(0.85, 0.85, 0.85),
            borderWidth: 0.8,
            color: rgb(0.97, 0.98, 1),
          });

          // Option letter inside the circle
          currentPage.drawText(option, {
            x: bubbleX - 4,
            y: bubbleY - 4,
            size: 11,
            font: fontBold,
            color: rgb(0.1, 0.1, 0.1),
          });
        });

        questionsOnCurrentPage++;
      }

      // Footer
      const footerY = 50;
      page.drawLine({
        start: { x: 30, y: footerY },
        end: { x: width - 30, y: footerY },
        thickness: 1,
        color: rgb(0.7, 0.7, 0.7),
      });

      page.drawText("Generated by OMR Generator", {
        x: 30,
        y: footerY - 20,
        size: 8,
        font: fontRegular,
        color: rgb(0.5, 0.5, 0.5),
      });

      page.drawText(`Total Questions: ${config.totalQuestions}`, {
        x: width - 150,
        y: footerY - 20,
        size: 8,
        font: fontRegular,
        color: rgb(0.5, 0.5, 0.5),
      });

      // Save PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      saveAs(blob, `omr-sheet-${config.totalQuestions}q.pdf`);
    } catch (error) {
      console.error("Error generating OMR sheet:", error);
      alert("Error generating OMR sheet. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const updateConfig = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                OMR Sheet Generator
              </h1>
              <p className="text-gray-600">
                Create professional optical mark recognition answer sheets
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Configuration
              </h2>
            </div>

            <div className="space-y-6">
              {/* Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Title
                  </label>
                  <input
                    type="text"
                    value={config.examTitle}
                    onChange={(e) => updateConfig("examTitle", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institute Name
                  </label>
                  <input
                    type="text"
                    value={config.instituteName}
                    onChange={(e) =>
                      updateConfig("instituteName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Question Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Questions
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateConfig(
                          "totalQuestions",
                          Math.max(1, config.totalQuestions - 5)
                        )
                      }
                      className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={config.totalQuestions}
                      onChange={(e) =>
                        updateConfig(
                          "totalQuestions",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                    />
                    <button
                      onClick={() =>
                        updateConfig(
                          "totalQuestions",
                          Math.min(200, config.totalQuestions + 5)
                        )
                      }
                      className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options per Question
                  </label>
                  <select
                    value={config.optionsPerQuestion}
                    onChange={(e) =>
                      updateConfig(
                        "optionsPerQuestion",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={3}>3 (A, B, C)</option>
                    <option value={4}>4 (A, B, C, D)</option>
                    <option value={5}>5 (A, B, C, D, E)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Questions per Row
                  </label>
                  <select
                    value={config.questionsPerRow}
                    onChange={(e) =>
                      updateConfig("questionsPerRow", parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={3}>3</option>
                    <option value={4}>4 (Recommended)</option>
                    <option value={5}>5</option>
                  </select>
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="studentInfo"
                    checked={config.includeStudentInfo}
                    onChange={(e) =>
                      updateConfig("includeStudentInfo", e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="studentInfo"
                    className="text-sm font-medium text-gray-700"
                  >
                    Include student information section
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="instructions"
                    checked={config.includeInstructions}
                    onChange={(e) =>
                      updateConfig("includeInstructions", e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="instructions"
                    className="text-sm font-medium text-gray-700"
                  >
                    Include instructions
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paper Size
                </label>
                <select
                  value={config.paperSize}
                  onChange={(e) => updateConfig("paperSize", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="A4">A4 (210 × 297 mm)</option>
                  <option value="Letter">Letter (8.5 × 11 in)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preview and Generate */}
          <div className="space-y-6">
            {/* Preview Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-2">
                <div>
                  <strong>Title:</strong> {config.examTitle}
                </div>
                <div>
                  <strong>Institute:</strong> {config.instituteName}
                </div>
                <div>
                  <strong>Questions:</strong> {config.totalQuestions}
                </div>
                <div>
                  <strong>Options:</strong> {config.optionsPerQuestion} per
                  question
                </div>
                <div>
                  <strong>Layout:</strong> {config.questionsPerRow} questions
                  per row
                </div>
                <div>
                  <strong>Paper:</strong> {config.paperSize}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <button
                onClick={createOMRSheet}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Generate OMR Sheet
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-2">
                PDF will be downloaded automatically
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
