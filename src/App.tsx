// PTA総会資料ツクール - フロントエンドのみ（React + pdf-lib + Tailwind CSS）
// 簡易構成: PDF結合、ページ番号追加、議案番号追加

import React, { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [startPageNumberAt, setStartPageNumberAt] = useState(1);
  const [addPageNumbers, setAddPageNumbers] = useState(true);
  const [addAgendaNumbers, setAddAgendaNumbers] = useState(true);
  const [draggedFile, setDraggedFile] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev: File[]) => [...prev, ...selected]);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedFile(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedFile === null) return;

    const newFiles = [...files];
    const [draggedItem] = newFiles.splice(draggedFile, 1);
    newFiles.splice(targetIndex, 0, draggedItem);
    setFiles(newFiles);
    setDraggedFile(null);
  };

  const handleDragEnd = () => {
    setDraggedFile(null);
  };

  const handleGenerate = async () => {
    try {
      // フォントファイルの読み込みを改善
      let fontBytes;
      try {
        const response = await fetch("/fonts/NotoSansJP-Regular.ttf");
        if (!response.ok) {
          throw new Error("フォントファイルの読み込みに失敗しました");
        }
        fontBytes = await response.arrayBuffer();
      } catch (fontError) {
        console.error("フォント読み込みエラー:", fontError);
        throw new Error("日本語フォントの読み込みに失敗しました。フォントファイルが正しく配置されているか確認してください。");
      }

      const mergedPdf = await PDFDocument.create();
      mergedPdf.registerFontkit(fontkit);
      const customFont = await mergedPdf.embedFont(fontBytes);
      let pageIndex = 0;

      if (files.length === 0) {
        throw new Error("PDFファイルが選択されていません");
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const data = await file.arrayBuffer();
          const srcPdf = await PDFDocument.load(data);
          const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());

          copiedPages.forEach((page, idx) => {
            mergedPdf.addPage(page);
            pageIndex++;

            if (addPageNumbers && pageIndex >= startPageNumberAt) {
              const { width, height } = page.getSize();
              const pageNumber = pageIndex - startPageNumberAt + 1;
              page.drawText(`${pageNumber}`, {
                x: width / 2 - 10,
                y: 20,
                size: 10,
                font: customFont,
                color: rgb(0, 0, 0),
              });
            }

            if (addAgendaNumbers && idx === 0) {
              page.drawText(`議案第${i + 1}号`, {
                x: 20,
                y: page.getHeight() - 30,
                size: 12,
                font: customFont,
                color: rgb(0.2, 0.2, 0.2),
              });
            }
          });
        } catch (fileError) {
          console.error(`ファイル ${file.name} の処理中にエラーが発生しました:`, fileError);
          throw new Error(`ファイル ${file.name} の処理に失敗しました。PDFファイルが正しい形式か確認してください。`);
        }
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pta_soukai_merged.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error("PDF生成エラー:", err);
      const errorMessage = err instanceof Error ? err.message : "PDFの生成に失敗しました。日本語フォントやファイル形式を確認してください。";
      alert(errorMessage);
    }
  };
  

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">PTA総会資料ツクール</h1>
      
      <div className="mb-6">
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PDFファイルを選択（複数可）
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col w-full h-32 border-4 border-dashed hover:bg-gray-100 hover:border-gray-300">
              <div className="flex flex-col items-center justify-center pt-7">
                <svg className="w-12 h-12 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                  クリックしてファイルを選択
                </p>
              </div>
              <input
                type="file"
                multiple
                accept="application/pdf"
                onChange={handleFileChange}
                className="opacity-0"
              />
            </label>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">選択されたファイル（ドラッグで順番を変更）：</h3>
            <ul className="border rounded-md divide-y divide-gray-200">
              {files.map((file, index) => (
                <li
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`px-4 py-2 flex items-center justify-between text-sm ${
                    draggedFile === index ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-400 cursor-move" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path>
                    </svg>
                    <span className="text-gray-600">{file.name}</span>
                  </div>
                  <button
                    onClick={() => setFiles(files.filter((_, i) => i !== index))}
                    className="text-red-600 hover:text-red-800"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={addPageNumbers}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddPageNumbers(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span>ページ番号を追加</span>
        </label>

        {addPageNumbers && (
          <div className="ml-6 mt-2">
            <label className="flex items-center space-x-2">
              <span>ページ番号の開始位置:</span>
              <input
                type="number"
                value={startPageNumberAt}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartPageNumberAt(parseInt(e.target.value))}
                className="w-16 border rounded px-1"
                min={1}
              />
              <span>ページ目から</span>
            </label>
          </div>
        )}
      </div>

      <label className="flex items-center space-x-2 mb-6">
        <input
          type="checkbox"
          checked={addAgendaNumbers}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddAgendaNumbers(e.target.checked)}
          className="rounded text-blue-600 focus:ring-blue-500"
        />
        <span>議案番号を追加（各PDF先頭ページ）</span>
      </label>

      <button
        onClick={handleGenerate}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          files.length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
        disabled={files.length === 0}
      >
        {files.length === 0 ? 'PDFファイルを選択してください' : '生成・ダウンロード'}
      </button>
    </div>
  );
}

export default App;
