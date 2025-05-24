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
      // Uint8ArrayをArrayBufferに変換してBlob作成時の型エラーを解消
      const arrayBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
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
                <strong>無料で安全</strong>なPDF結合ツール。このアプリケーションは完全にブラウザ上で動作し、ファイルはサーバーにアップロードされません。
                すべての処理はお使いのブラウザ内で行われ、プライバシーが保護されます。
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/wadatch/sokai-siryo-maker"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed top-0 right-0 z-50"
                aria-label="Fork me on GitHub"
              >
                <img
                  loading="lazy"
                  decoding="async"
                  width="149"
                  height="149"
                  src="https://github.blog/wp-content/uploads/2008/12/forkme_right_darkblue_121621.png"
                  alt="Fork me on GitHub"
                />
              </a>
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
        </div>
      </header>

      {/* サイト機能説明セクション */}
      <section className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              PTAなどの「総会資料」作成に便利な機能を実現します
            </h2>
            <p className="text-blue-700">
              <strong>無料</strong>で<strong>安全</strong>にPDF結合・編集ができる、複雑な総会資料の準備を簡単に、効率的に行えるツールです
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">無料PDF結合機能</h3>
              </div>
              <p className="text-sm text-gray-600">
                複数のPDFファイルを一つに<strong>無料で安全に結合</strong>できます。表紙ページや目次ページも含めて、総会資料として適切な順序で統合します。
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">ページ番号追加</h3>
              </div>
              <p className="text-sm text-gray-600">
                指定したPDFに連番のページ番号を自動追加できます。番号の形式や位置もカスタマイズ可能で、総会資料に適した体裁に整えます。
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a2 2 0 012-2v0a2 2 0 012 2v6.5a.5.5 0 001 0V5a2 2 0 012-2v0a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">安全なプライバシー保護</h3>
              </div>
              <p className="text-sm text-gray-600">
                議案番号・添付資料などのヘッダを各ページに追加できます。<strong>完全ブラウザ完結で安全</strong>、ファイルはサーバーにアップロードされません。
              </p>
            </div>
          </div>
        </div>
      </section>

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

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* 作者について */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">作者について</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">
                    ソフトウェアエンジニアをしており、中学校PTAの会長をしています
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">
                    ITが分かる人にしかできない作業をできるだけ無くしたいです
                  </p>
                </div>
              </div>
            </div>

            {/* プロジェクト情報 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">プロジェクト情報</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  <a
                    href="https://github.com/wadatch/sokai-siryo-maker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500 text-sm"
                  >
                    GitHub で詳細を見る
                  </a>
                </div>
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
