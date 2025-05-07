import { useState, useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatHistory from './ChatHistory';
import type { Message } from './ChatHistory';
import ChatInput from './ChatInput';
import './Chat.css';

const BOT_REPLY = 'This product contains Alcohol Denat, which may cause dryness or irritation for sensitive skin. If you have reactive skin, consider patch testing first or consult a dermatologist.';

const MainContent = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSentMessage, setHasSentMessage] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSend = async () => {
    if (message.trim() !== '') {
      setHasSentMessage(true);
      const userMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'user',
        text: message.trim(),
      };
      setMessages(prev => [...prev, userMsg]);
      setMessage('');

      setIsLoading(true);

      try {
        // TODO: Replace with actual API call
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
  
        // Add bot response
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: BOT_REPLY,
          sender: 'bot'
        };
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('Error getting response:', error);
        // Handle error appropriately
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Gửi bằng phím Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Tự động scroll xuống cuối khi có message mới
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="chat-main">
      {/* Avatar */}
      <div className="chat-avatar">T</div>
      <div className="chat-container">
        {!hasSentMessage ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}>
            <ChatHeader />
            <ChatInput
              message={message}
              setMessage={setMessage}
              handleSend={handleSend}
              handleKeyDown={handleKeyDown}
            />
          </div>
        ) : (
          <>
            <ChatHistory messages={messages} messagesEndRef={messagesEndRef} isLoading={isLoading} />
            <ChatInput
              message={message}
              setMessage={setMessage}
              handleSend={handleSend}
              handleKeyDown={handleKeyDown}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MainContent; 