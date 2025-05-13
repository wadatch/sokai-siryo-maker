import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const HelpPage: React.FC = () => {
  const [helpContent, setHelpContent] = useState<string>('');

  useEffect(() => {
    fetch('/sokai-siryo-maker/help.md')
      .then(response => response.text())
      .then(text => setHelpContent(text))
      .catch(error => console.error('ヘルプページの読み込みに失敗しました:', error));
  }, []);

  return (
    <div className="prose max-w-none p-6">
      <ReactMarkdown>{helpContent}</ReactMarkdown>
    </div>
  );
};

export default HelpPage; 