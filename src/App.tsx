
// PTA総会資料ツクール - フロントエンドのみ（React + pdf-lib + Tailwind CSS）
// 簡易構成: PDF結合、ページ番号追加、議案番号追加

import React, { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

function App() {
  const [files, setFiles] = useState([]);
  const [startPageNumberAt, setStartPageNumberAt] = useState(1);
  const [addPageNumbers, setAddPageNumbers] = useState(true);
  const [addAgendaNumbers, setAddAgendaNumbers] = useState(true);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
  };

  const handleGenerate = async () => {
    const mergedPdf = await PDFDocument.create();
    const font = await mergedPdf.embedFont(StandardFonts.Helvetica);
    let pageIndex = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const data = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(data);
      const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());

      copiedPages.forEach((page, idx) => {
        mergedPdf.addPage(page);
        const pageNumber = pageIndex + 1;

        // ページ番号追加（指定ページ以降）
        if (addPageNumbers && pageNumber >= startPageNumberAt) {
          const { width, height } = page.getSize();
          page.drawText(`${pageNumber}`, {
            x: width / 2 - 10,
            y: 20,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
        }

        // 議案番号（先頭ページのみ）
        if (addAgendaNumbers && idx === 0) {
          page.drawText(`議案第${i + 1}号`, {
            x: 20,
            y: page.getHeight() - 30,
            size: 12,
            font,
            color: rgb(0.2, 0.2, 0.2),
          });
        }

        pageIndex++;
      });
    }

    const pdfBytes = await mergedPdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "pta_soukai_merged.pdf";
    link.click();
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">PTA総会資料ツクール</h1>
      <input
        type="file"
        multiple
        accept="application/pdf"
        onChange={handleFileChange}
        className="mb-4"
      />

      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={addPageNumbers}
            onChange={(e) => setAddPageNumbers(e.target.checked)}
          />
          <span>ページ番号を追加</span>
        </label>

        {addPageNumbers && (
          <div className="ml-6 mt-2">
            <label>
              ページ番号の開始位置:
              <input
                type="number"
                value={startPageNumberAt}
                onChange={(e) => setStartPageNumberAt(parseInt(e.target.value))}
                className="ml-2 w-16 border rounded px-1"
                min={1}
              /> ページ目から
            </label>
          </div>
        )}
      </div>

      <label className="flex items-center space-x-2 mb-4">
        <input
          type="checkbox"
          checked={addAgendaNumbers}
          onChange={(e) => setAddAgendaNumbers(e.target.checked)}
        />
        <span>議案番号を追加（各PDF先頭ページ）</span>
      </label>

      <button
        onClick={handleGenerate}
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={files.length === 0}
      >
        生成・ダウンロード
      </button>
    </div>
  );
}

export default App;
