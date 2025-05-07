import React, { useState, useRef, useEffect } from 'react';
import './Chat.css';
import ChatInput from './ChatInput';
import ChatLoading from './ChatLoading';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputMessage, setInputMessage] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user'
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Show loading
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "This is a sample response. Replace with actual API response.",
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-main">
      <div className="chat-avatar">AI</div>
      <div className="chat-container">
        <div className="chat-header">
          <h1 className="chat-header-title">Hello, Trung</h1>
          <p className="chat-header-desc">What would you like to know about this product?</p>
        </div>
        <div className="chat-history">
          {messages.map(message => (
            <div key={message.id} className={`chat-message-row ${message.sender}`}>
              <div className={`chat-message ${message.sender}`}>
                {message.text}
              </div>
            </div>
          ))}
          {isLoading && <ChatLoading />}
          <div ref={messagesEndRef} />
        </div>
        <ChatInput
          message={inputMessage}
          setMessage={setInputMessage}
          handleSend={handleSend}
          handleKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};

export default Chat; 