// PTA総会資料ツクール - フロントエンドのみ（React + pdf-lib + Tailwind CSS）
// 簡易構成: PDF結合、ページ番号追加、議案番号追加

import React, { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

type AgendaType = 'agenda' | 'attachment' | 'reference' | 'none';

interface FileWithAgenda {
  file: File;
  agendaType: AgendaType;
  agendaNumber: number;
  pageCount?: number;
}

function App() {
  const [files, setFiles] = useState<FileWithAgenda[]>([]);
  const [startPageNumberAt, setStartPageNumberAt] = useState(1);
  const [addPageNumbers, setAddPageNumbers] = useState(true);
  const [draggedFile, setDraggedFile] = useState<number | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = await Promise.all(Array.from(e.target.files).map(async file => {
        try {
          const data = await file.arrayBuffer();
          const pdf = await PDFDocument.load(data);
          return {
            file,
            agendaType: 'none' as AgendaType,
            agendaNumber: 1,
            pageCount: pdf.getPageCount()
          };
        } catch (error) {
          console.error(`ファイル ${file.name} のページ数取得に失敗しました:`, error);
          return {
            file,
            agendaType: 'none' as AgendaType,
            agendaNumber: 1,
            pageCount: undefined
          };
        }
      }));
      setFiles(prev => [...prev, ...selected]);
    }
  };

  const handleAgendaTypeChange = (index: number, type: AgendaType) => {
    setFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, agendaType: type } : item
    ));
  };

  const handleAgendaNumberChange = (index: number, number: number) => {
    setFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, agendaNumber: number } : item
    ));
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

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
    if (droppedFiles.length === 0) return;

    const selected = await Promise.all(droppedFiles.map(async file => {
      try {
        const data = await file.arrayBuffer();
        const pdf = await PDFDocument.load(data);
        return {
          file,
          agendaType: 'none' as AgendaType,
          agendaNumber: 1,
          pageCount: pdf.getPageCount()
        };
      } catch (error) {
        console.error(`ファイル ${file.name} のページ数取得に失敗しました:`, error);
        return {
          file,
          agendaType: 'none' as AgendaType,
          agendaNumber: 1,
          pageCount: undefined
        };
      }
    }));
    setFiles(prev => [...prev, ...selected]);
  };

  const handleGenerate = async () => {
    try {
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
        const { file, agendaType, agendaNumber } = files[i];
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

            // 議案番号を全ページに表示
            if (agendaType !== 'none') {
              const { width, height } = page.getSize();
              let label = '';
              switch (agendaType) {
                case 'agenda':
                  label = `議案第${agendaNumber}号`;
                  break;
                case 'attachment':
                  label = `添付資料${agendaNumber}`;
                  break;
                case 'reference':
                  label = `参考資料${agendaNumber}`;
                  break;
              }
              
              // テキストの幅を計算（概算）
              const textWidth = label.length * 12; // 1文字あたり約12ポイント
              const padding = 20; // 左右の余白
              const boxWidth = textWidth + padding;
              
              // 四角形を描画
              page.drawRectangle({
                x: 20,
                y: height - 50,
                width: boxWidth,
                height: 30,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,
              });

              // ラベルテキストを描画
              page.drawText(label, {
                x: 30,
                y: height - 40,
                size: 12,
                font: customFont,
                color: rgb(0, 0, 0),
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
      <h1 className="text-xl font-bold mb-4">総会資料メーカー</h1>
      <p className="text-sm text-gray-600 mb-4">
        このアプリケーションは完全にブラウザ上で動作し、ファイルはサーバーにアップロードされません。
        すべての処理はお使いのブラウザ内で行われ、プライバシーが保護されます。
      </p>
      
      <div className="mb-6">
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PDFファイルを選択（複数可）
          </label>
          <div className="flex items-center justify-center w-full">
            <label 
              className="flex flex-col w-full h-32 border-4 border-dashed hover:bg-gray-100 hover:border-gray-300"
              onDragOver={handleDragOver}
              onDrop={handleFileDrop}
            >
              <div className="flex flex-col items-center justify-center pt-7">
                <svg className="w-12 h-12 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                  クリックまたはドラッグ＆ドロップでファイルを選択
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
              {files.map((item, index) => (
                <li
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`px-4 py-2 flex flex-col space-y-2 ${
                    draggedFile === index ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-400 cursor-move" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path>
                      </svg>
                      <span className="text-gray-600">
                        {item.file.name}
                        {item.pageCount !== undefined && (
                          <span className="ml-2 text-sm text-gray-500">
                            （{item.pageCount}ページ）
                          </span>
                        )}
                      </span>
                    </div>
                    <button
                      onClick={() => setFiles(files.filter((_, i) => i !== index))}
                      className="text-red-600 hover:text-red-800"
                    >
                      削除
                    </button>
                  </div>
                  <div className="flex items-center space-x-4 ml-8">
                    <select
                      value={item.agendaType}
                      onChange={(e) => handleAgendaTypeChange(index, e.target.value as AgendaType)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="none">議案番号なし</option>
                      <option value="agenda">議案</option>
                      <option value="attachment">添付資料</option>
                      <option value="reference">参考資料</option>
                    </select>
                    {item.agendaType !== 'none' && (
                      <div className="flex items-center space-x-2">
                        {item.agendaType === 'agenda' ? (
                          <>
                            <span className="text-sm">第</span>
                            <input
                              type="number"
                              value={item.agendaNumber}
                              onChange={(e) => handleAgendaNumberChange(index, parseInt(e.target.value))}
                              className="w-16 border rounded px-1 text-sm"
                              min={1}
                            />
                            <span className="text-sm">号</span>
                          </>
                        ) : (
                          <input
                            type="number"
                            value={item.agendaNumber}
                            onChange={(e) => handleAgendaNumberChange(index, parseInt(e.target.value))}
                            className="w-16 border rounded px-1 text-sm"
                            min={1}
                          />
                        )}
                      </div>
                    )}
                  </div>
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
            onChange={(e) => setAddPageNumbers(e.target.checked)}
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
                onChange={(e) => setStartPageNumberAt(parseInt(e.target.value))}
                className="w-16 border rounded px-1"
                min={1}
              />
              <span>ページ目から</span>
            </label>
          </div>
        )}
      </div>

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
