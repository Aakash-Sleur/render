import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";

export default function GenerateOMR() {
  const createOMRSheet = async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const { height, width } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Title
    page.drawText("OMR Answer Sheet", {
      x: width / 2 - 80,
      y: height - 40,
      size: 18,
      font,
      color: rgb(0, 0, 0),
    });

    // Student info placeholders
    page.drawText("Name: ____________________", { x: 50, y: height - 70, size: 12, font: fontRegular });
    page.drawText("Roll No: ____________________", { x: 350, y: height - 70, size: 12, font: fontRegular });

    // Function to draw a section with questions
    const drawSection = (title, startQ, totalQ, startY) => {
      page.drawText(title, {
        x: 50,
        y: startY,
        size: 14,
        font,
        color: rgb(0, 0, 0.8),
      });

      let y = startY - 30;
      let x = 50;
      const colWidth = 260; // distance between two columns
      const rowHeight = 25; // spacing between questions
      const options = ["A", "B", "C", "D"];

      for (let q = 0; q < totalQ; q++) {
        const qNum = startQ + q;

        // If we reach bottom, move to next column
        if (y < 100) {
          x += colWidth;
          y = startY - 30;
        }

        // Question number
        page.drawText(`Q${qNum}`, { x, y, size: 10, font: fontRegular });

        // Draw bubbles
        let optX = x + 35;
        options.forEach((opt) => {
          page.drawCircle({
            x: optX,
            y: y + 4,
            size: 8,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });
          page.drawText(opt, { x: optX - 3, y: y - 10, size: 8, font: fontRegular });
          optX += 30;
        });

        y -= rowHeight;
      }
    };

    // Draw multiple sections
    drawSection("Section A", 1, 20, height - 120);
    drawSection("Section B", 21, 20, height - 400);

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(blob, "omr-sheet.pdf");
  };

  return (
    <button
      onClick={createOMRSheet}
      className="px-4 py-2 bg-blue-600 text-white rounded shadow-md"
    >
      Generate OMR Sheet
    </button>
  );
}
