// PTA総会資料ツクール - フロントエンドのみ（React + pdf-lib + Tailwind CSS）
// 簡易構成: PDF結合、ページ番号追加、議案番号追加

import React, { useState, useEffect, ChangeEvent, DragEvent } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import * as pdfjsLib from 'pdfjs-dist';
import { copyrightInfo } from './config/copyright';
import HelpPage from './components/HelpPage';

// Google FontsからNoto Sans JPを読み込む
const fontUrl = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400&display=swap';
const link = document.createElement('link');
link.href = fontUrl;
link.rel = 'stylesheet';
document.head.appendChild(link);

// PDF.jsのワーカーを設定
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type AgendaType = 'agenda' | 'attachment' | 'reference' | 'none';

interface FileWithAgenda {
  file: File;
  name: string;
  agendaType: AgendaType;
  agendaNumber: number;
  pageCount?: number;
  thumbnail?: string;
}

function App() {
  const [files, setFiles] = useState<FileWithAgenda[]>([]);
  const [startPageNumberAt, setStartPageNumberAt] = useState(1);
  const [endPageNumberAt, setEndPageNumberAt] = useState(1);
  const [addPageNumbers, setAddPageNumbers] = useState(true);
  const [pageNumberFormat, setPageNumberFormat] = useState<'number' | 'dash' | 'page'>('number');
  const [draggedFile, setDraggedFile] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [pageNumberPosition, setPageNumberPosition] = useState<'bottom' | 'top'>('bottom');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const generateThumbnail = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.2 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas context not available');
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      return canvas.toDataURL('image/jpeg', 0.5);
    } catch (error) {
      console.error('サムネイル生成エラー:', error);
      return '';
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      try {
        const selected = await Promise.all(Array.from(e.target.files as FileList).map(async (file: File) => {
          try {
            const data = await file.arrayBuffer();
            const pdf = await PDFDocument.load(data);
            const thumbnail = await generateThumbnail(file);
            return {
              file,
              name: file.name,
              agendaType: 'none' as AgendaType,
              agendaNumber: 1,
              pageCount: pdf.getPageCount(),
              thumbnail
            };
          } catch (error) {
            console.error(`ファイル ${file.name} の処理に失敗しました:`, error);
            throw new Error(`ファイル ${file.name} を開けませんでした。暗号化されているか、破損している可能性があります。`);
          }
        }));
        setFiles((prev: FileWithAgenda[]) => {
          const newFiles = [...prev, ...selected];
          const totalPages = newFiles.reduce((sum, file) => sum + (file.pageCount || 0), 0);
          setEndPageNumberAt(totalPages);
          return newFiles;
        });
      } catch (error) {
        console.error('ファイル処理エラー:', error);
        alert(error instanceof Error ? error.message : 'ファイルの処理中にエラーが発生しました。');
        // ファイル入力をリセット
        e.target.value = '';
      }
    }
  };

  const handleAgendaTypeChange = (index: number, type: AgendaType) => {
    setFiles((prev: FileWithAgenda[]) => prev.map((item: FileWithAgenda, i: number) => 
      i === index ? { ...item, agendaType: type } : item
    ));
  };

  const handleAgendaNumberChange = (index: number, number: number) => {
    setFiles((prev: FileWithAgenda[]) => prev.map((item: FileWithAgenda, i: number) => 
      i === index ? { ...item, agendaNumber: number } : item
    ));
  };

  const handleDragStart = (index: number) => {
    setDraggedFile(index);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedFile !== null && draggedFile !== index) {
      setDragOverIndex(index);
      // リアルタイムで要素を入れ替え
      const newFiles = [...files];
      const [draggedItem] = newFiles.splice(draggedFile, 1);
      newFiles.splice(index, 0, draggedItem);
      setFiles(newFiles);
      setDraggedFile(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    setDraggedFile(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedFile(null);
    setDragOverIndex(null);
  };

  const handleFileDrop = async (e: DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files as FileList).filter((file: File) => file.type === 'application/pdf');
    if (droppedFiles.length === 0) return;

    try {
      const selected = await Promise.all(droppedFiles.map(async (file: File) => {
        try {
          const data = await file.arrayBuffer();
          const pdf = await PDFDocument.load(data);
          const thumbnail = await generateThumbnail(file);
          return {
            file,
            name: file.name,
            agendaType: 'none' as AgendaType,
            agendaNumber: 1,
            pageCount: pdf.getPageCount(),
            thumbnail
          };
        } catch (error) {
          console.error(`ファイル ${file.name} の処理に失敗しました:`, error);
          throw new Error(`ファイル ${file.name} を開けませんでした。暗号化されているか、破損している可能性があります。`);
        }
      }));
      setFiles((prev: FileWithAgenda[]) => {
        const newFiles = [...prev, ...selected];
        const totalPages = newFiles.reduce((sum, file) => sum + (file.pageCount || 0), 0);
        setEndPageNumberAt(totalPages);
        return newFiles;
      });
    } catch (error) {
      console.error('ファイル処理エラー:', error);
      alert(error instanceof Error ? error.message : 'ファイルの処理中にエラーが発生しました。');
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev: FileWithAgenda[]) => {
      const newFiles = prev.filter((_: FileWithAgenda, i: number) => i !== index);
      // 全ページ数を計算
      const totalPages = newFiles.reduce((sum, file) => sum + (file.pageCount || 0), 0);
      // 終了ページ番号を更新
      setEndPageNumberAt(totalPages);
      return newFiles;
    });
  };

  const handleMerge = async () => {
    setIsProcessing(true);
    try {
      await handleGenerate();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerate = async () => {
    try {
      let fontBytes;
      try {
        const response = await fetch("/sokai-siryo-maker/fonts/NotoSansJP-Regular.ttf");
        if (!response.ok) {
          throw new Error("フォントファイルの読み込みに失敗しました");
        }
        fontBytes = await response.arrayBuffer();
        if (!fontBytes || fontBytes.byteLength === 0) {
          throw new Error("フォントファイルが空です");
        }
      } catch (fontError) {
        console.error("フォント読み込みエラー:", fontError);
        throw new Error("日本語フォントの読み込みに失敗しました。フォントファイルが正しく配置されているか確認してください。");
      }

      const mergedPdf = await PDFDocument.create();
      mergedPdf.registerFontkit(fontkit);
      let customFont;
      try {
        customFont = await mergedPdf.embedFont(fontBytes);
      } catch (embedError) {
        console.error("フォント埋め込みエラー:", embedError);
        throw new Error("フォントの埋め込みに失敗しました。フォントファイルの形式が正しくない可能性があります。");
      }
      let pageIndex = 0;

      if (files.length === 0) {
        throw new Error("PDFファイルが選択されていません");
      }

      for (let i = 0; i < files.length; i++) {
        const { file, name, agendaType, agendaNumber } = files[i];
        try {
          const data = await file.arrayBuffer();
          const srcPdf = await PDFDocument.load(data);
          const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());

          copiedPages.forEach((page, idx) => {
            mergedPdf.addPage(page);
            pageIndex++;

            if (addPageNumbers && pageIndex >= startPageNumberAt && pageIndex <= endPageNumberAt) {
              const { width, height } = page.getSize();
              const pageNumber = pageIndex - startPageNumberAt + 1;
              let pageNumberText = '';
              switch (pageNumberFormat) {
                case 'number':
                  pageNumberText = `${pageNumber}`;
                  break;
                case 'dash':
                  pageNumberText = `- ${pageNumber} -`;
                  break;
                case 'page':
                  pageNumberText = `${pageNumber} ページ`;
                  break;
              }
              page.drawText(pageNumberText, {
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
                  label = `第${agendaNumber}号議案`;
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
          console.error(`ファイル ${name} の処理中にエラーが発生しました:`, fileError);
          throw new Error(`ファイル ${name} の処理に失敗しました。PDFファイルが正しい形式か確認してください。`);
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">総会資料メーカー</h1>
              <p className="text-sm text-gray-600 mt-2">
                このアプリケーションは完全にブラウザ上で動作し、ファイルはサーバーにアップロードされません。
                すべての処理はお使いのブラウザ内で行われ、プライバシーが保護されます。
              </p>
              <a
                href="https://github.com/wadatch/sokai-siryo-maker"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                GitHubリポジトリ
              </a>
            </div>
            <button
              onClick={() => setShowHelp(true)}
              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              title="ヘルプ"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors duration-200"
              onDragOver={(e: DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={handleFileDrop}
            >
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="cursor-pointer block"
              >
                <div className="space-y-2">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500">クリックしてファイルを選択</span>
                    またはドラッグ＆ドロップ
                  </div>
                  <p className="text-xs text-gray-500">PDFファイルのみ対応</p>
                </div>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始ページ番号
                </label>
                <input
                  type="number"
                  min="1"
                  value={startPageNumberAt}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setStartPageNumberAt(parseInt(e.target.value) || 1)}
                  className="block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  終了ページ番号
                </label>
                <input
                  type="number"
                  min="1"
                  value={endPageNumberAt}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEndPageNumberAt(parseInt(e.target.value) || 1)}
                  className="block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ページ番号の位置
                </label>
                <select
                  value={pageNumberPosition}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setPageNumberPosition(e.target.value as 'bottom' | 'top')}
                  className="block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="bottom">下部中央</option>
                  <option value="top">上部中央</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ページ番号のフォーマット
                </label>
                <select
                  value={pageNumberFormat}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setPageNumberFormat(e.target.value as 'number' | 'dash' | 'page')}
                  className="block w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="number">数字のみ</option>
                  <option value="dash">- n -</option>
                  <option value="page">n ページ</option>
                </select>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900">アップロードされたファイル</h2>
                <div className="space-y-4">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      draggable
                      className={`bg-gray-50 rounded-lg p-4 cursor-move transition-all duration-150 ease-in-out ${
                        draggedFile === index ? 'opacity-50 scale-95 shadow-lg' : ''
                      } ${dragOverIndex === index ? 'border-2 border-blue-500 transform translate-y-4' : 'hover:shadow-md'}`}
                      style={{
                        transform: dragOverIndex === index ? 'translateY(1rem)' : 'translateY(0)',
                        transition: 'transform 150ms ease-in-out'
                      }}
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e: DragEvent<HTMLDivElement>) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e: DragEvent<HTMLDivElement>) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex items-start space-x-6">
                        <div className="flex-shrink-0 w-24 h-32 bg-gray-200 rounded flex items-center justify-center overflow-hidden relative ml-8">
                          <div className="absolute -left-4 top-0 bottom-0 w-4 flex flex-col justify-center items-center space-y-1">
                            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                          </div>
                          {file.thumbnail ? (
                            <img
                              src={file.thumbnail}
                              alt={`${file.name}のサムネイル`}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                                {file.pageCount && <span className="text-gray-500 ml-2">（{file.pageCount}ページ）</span>}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveFile(index)}
                              className="ml-2 text-gray-400 hover:text-gray-500"
                            >
                              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                          <div className="mt-3 space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                種類
                              </label>
                              <select
                                value={file.agendaType}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => handleAgendaTypeChange(index, e.target.value as AgendaType)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              >
                                <option value="none">なし</option>
                                <option value="agenda">議案</option>
                                <option value="attachment">添付資料</option>
                                <option value="reference">参考資料</option>
                              </select>
                            </div>
                            {file.agendaType !== 'none' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  {file.agendaType === 'agenda' ? '議案番号' : '番号'}
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={file.agendaNumber}
                                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleAgendaNumberChange(index, parseInt(e.target.value) || 1)}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleMerge}
                    disabled={isProcessing}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        処理中...
                      </>
                    ) : (
                      'PDFを結合'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">ヘルプ</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <HelpPage />
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            {copyrightInfo.text}{' '}
            <a
              href={copyrightInfo.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500"
            >
              {copyrightInfo.linkText}
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
