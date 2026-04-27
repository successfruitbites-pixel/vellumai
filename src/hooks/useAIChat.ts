import { useState, useRef, useEffect } from 'react';
import { extractPDFText, chatWithPDF, summarizePDF, translatePDF, extractKeyPoints, suggestFilename } from '../lib/gemini';
import { toast } from 'react-hot-toast';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: number;
}

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfText, setPdfText] = useState<string>('');
  const [fileName, setFileName] = useState('');
  const [pageCount, setPageCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const addMessage = (role: 'user' | 'ai' | 'system', content: string) => {
    const newMsg: ChatMessage = { id: Date.now().toString(), role, content, timestamp: Date.now() };
    setMessages((prev) => [...prev, newMsg]);
    return newMsg;
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    let toastId;
    try {
      toastId = toast.loading('Reading document...');
      const text = await extractPDFText(file);
      setPdfText(text);
      setFileName(file.name);
      
      // Attempt to find page count using basic matching or from the extract logic if available
      // but without modifying gemini.ts, we'll just set it vaguely or keep it simple
      setPageCount(1); // placeholder since extractPDFText doesn't return count directly

      addMessage('ai', "👋 I've read your document! Ask me anything about it, or use the quick actions on the left to summarize, translate, or extract key points.");
      toast.success('Document ready!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to read the document.', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || !pdfText) return;

    addMessage('user', text);
    setIsLoading(true);

    const prevMessages = messages.filter(m => m.role !== 'system');

    try {
      // Adding a placeholder AI message for streaming
      const aiMsgId = Date.now().toString();
      setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', content: '', timestamp: Date.now() }]);

      const stream = await chatWithPDF(pdfText, prevMessages, text);
      
      let fullResponse = '';
      for await (const chunk of stream) {
         if (chunk.text) {
           fullResponse += chunk.text;
           setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: fullResponse } : m));
         }
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to generate response: ' + error.message);
      addMessage('system', 'Error generating response. Check your API key or try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setPdfText('');
    setFileName('');
  };

  return {
    messages,
    isLoading,
    pdfText,
    fileName,
    pageCount,
    messagesEndRef,
    handleFileUpload,
    sendMessage,
    clearChat,
  };
}
