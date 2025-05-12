import { useState, useRef, useEffect } from 'react';
import StepIntro from './workflow/StepIntro';
import StepUpload from './workflow/StepUpload';
import StepLoading from './workflow/StepLoading';
import StepReview from './workflow/StepReview';
import ChatHeader from './ChatHeader';
import ChatHistory from './ChatHistory';
import type { Message } from './ChatHistory';
import ChatInput from './ChatInput';
import ProductDetailsModal from './ProductDetailsModal';
import './Chat.css';

interface ExtractedData {
  Ingredients: string[];
  image: string;
  [key: string]: string | string[] | undefined
}

interface Chat {
  _id: string;
  name: string;
  messages: Message[];
  productInformation: ExtractedData;
}

interface MainContentProps {
  selectedChat: Chat | null;
  onSendMessage?: (content: string) => Promise<void>;
  onResendMessage?: (messageId: string, chatId: string, content: string) => Promise<void>;
}

const MainContent = ({ selectedChat, onSendMessage, onResendMessage }: MainContentProps) => {
  const [step, setStep] = useState(1); // 1: Intro, 2: Upload, 3: Loading, 4: Review, 5: Chatbot
  const [language, setLanguage] = useState('English');
  const [image, setImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [loadingStep, setLoadingStep] = useState<1 | 2 | 3>(1);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSentMessage, setHasSentMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Effect to handle selected chat
  useEffect(() => {
    if (selectedChat) {
      // Set all states first
      setChatId(selectedChat._id);
      setMessages(selectedChat.messages || []);
      setExtractedData(selectedChat.productInformation);
      setIsFirstMessage(false);
      setHasSentMessage(selectedChat.messages && selectedChat.messages.length > 0);
      // Set step to 5 last to avoid flashing step 1
      requestAnimationFrame(() => {
        setStep(5);
      });
    } else {
      // Reset states when no chat is selected
      setStep(1);
      setChatId(null);
      setMessages([]);
      setExtractedData(null);
      setIsFirstMessage(true);
      setHasSentMessage(false);
    }
  }, [selectedChat]);

  // Effect để scroll xuống dưới cùng khi có tin nhắn mới
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Giả lập API trích xuất dữ liệu từ ảnh
  const handleExtractData = async () => {
    setStep(3); // Loading
    setLoadingStep(1);
  };

  // Effect để tự động chuyển loadingStep khi step === 3
  useEffect(() => {
    if (step === 3 && image) {
      const executeSteps = async () => {
        try {
          // Step 1: Initial loading
          setLoadingStep(1);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay for UX

          // Step 2: Extract data
          setLoadingStep(2);
          // Convert base64 to blob
          const response = await fetch(image);
          const blob = await response.blob();

          const formData = new FormData();
          formData.append('file', blob, 'image.jpg');

          // Call API
          const extractResponse = await fetch('http://localhost:8000/api/extractor/extract', {
            method: 'POST',
            body: formData,
          });

          // Parse response
          const extractData = await extractResponse.json();
          
          setLoadingStep(3);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay for UX

          // Call api to translate
          const translateResponse = await fetch('http://localhost:8000/api/extractor/translate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
          },
            body: JSON.stringify({
              info: extractData.data,
              language: language
            }),
          });

          const translateData = await translateResponse.json();
          console.log(translateData);
          
          if (translateData.status === 'success') {
            setExtractedData({
              ...translateData.data,
              image: image
            });
          } else {
            throw new Error('Invalid response format');
          }
          
          // Move to review step
          setStep(4);
        } catch (error) {
          console.error('Error extracting data:', error);
          // Handle error appropriately
          setLoadingStep(3);
          await new Promise(resolve => setTimeout(resolve, 1000));
          setStep(4);
        }
      };

      executeSteps();
    }
  }, [step, image]);

  // Function to generate and update chat title
  const generateChatTitle = async (chatId: string) => {
    try {
      // Call API to generate title
      const titleResponse = await fetch(`http://localhost:8000/api/chats/${chatId}/get-name`);
      const titleData = await titleResponse.json();
      
      if (titleData.status === 'success' && titleData.data && titleData.data.chatName) {
        // Update chat title using new rename endpoint
        await fetch(`http://localhost:8000/api/chats/${chatId}/rename`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: titleData.data.chatName
          })
        });
      }
    } catch (error) {
      console.error('Error generating chat title:', error);
      // Silently fail - don't affect user experience
    }
  };

  // Update handleSend to include title generation for first message
  const handleSend = async () => {
    if (message.trim() !== '' && chatId) {
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
        // Call chat API to send message
        const response = await fetch('http://localhost:8000/api/messages/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chat_id: chatId,
            content: userMsg.text
          })
        });

        const data = await response.json();
        
        if (data.status === 'success') {
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: data.data.content,
            sender: 'bot'
          };
          setMessages(prev => [...prev, botMessage]);

          // Generate title for first message
          if (isFirstMessage) {
            setIsFirstMessage(false);
            // Generate title asynchronously without waiting
            generateChatTitle(chatId).catch(console.error);
          }
        } else {
          throw new Error('Failed to get response from chat API');
        }
      } catch (error) {
        console.error('Error getting response:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Sorry, I encountered an error. Please try again.',
          sender: 'bot'
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!onSendMessage) return;
    
    setIsLoading(true);
    try {
      await onSendMessage(content);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-main">
      {/* Avatar */}
      <div className="chat-avatar">T</div>

      {step === 1 && <StepIntro language={language} setLanguage={setLanguage} onStart={() => setStep(2)} />}
      {step === 2 && <StepUpload onUpload={img => { setImage(img); handleExtractData(); }} />}
      {step === 3 && <StepLoading step={loadingStep} />}
      {step === 4 && extractedData && <StepReview data={extractedData} setData={setExtractedData} onContinue={async () => {
        try {
          // API 1: Upload image to get static link
          const formData = new FormData();
          // Convert base64 to blob
          const response = await fetch(extractedData.image);
          const blob = await response.blob();
          formData.append('file', blob, 'image.jpg');

          const imageResponse = await fetch('http://localhost:8000/api/extractor/upload', {
            method: 'POST',
            body: formData,
          });
          const imageData = await imageResponse.json();
          console.log("Dữ liệu ảnh: ", imageData);
      
          const updatedData = {
            ...extractedData,
            image: imageData.data,
          };

          // API 2: Create chat with updated information
          const createChatResponse = await fetch('http://localhost:8000/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              productInformation: updatedData,
            })
          });

          const createChatData = await createChatResponse.json();
          console.log("Dữ liệu chat: ", createChatData);
          
          if (createChatData.status === 'success' && createChatData.data && createChatData.data._id) {
            setChatId(createChatData.data._id); // Store chat_id
            setMessages([]); // Reset messages for new chat
            setHasSentMessage(false); // Reset hasSentMessage for new chat
          } else {
            throw new Error('Failed to get chat ID from response');
          }
          
          // Update state and wait for it to complete
          await new Promise<void>(resolve => {
            setExtractedData(updatedData);
            resolve();
          });
          
          // Move to chat step
          setStep(5);
        } catch (error) {
          console.error('Error creating chat:', error);
          // Handle error appropriately
        }
      }} />}
      {step === 5 && (
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
                setShowProductDetails={setShowProductDetails}
              />
            </div>
          ) : (
            <>
              <ChatHistory
                messages={messages}
                messagesEndRef={messagesEndRef}
                isLoading={isLoading}
                onResendMessage={onResendMessage}
              />
              <ChatInput
                message={message}
                setMessage={setMessage}
                handleSend={handleSend}
                handleKeyDown={handleKeyDown}
                setShowProductDetails={setShowProductDetails}
              />
            </>
          )}
        </div>
      )}

      {showProductDetails && extractedData && (
        <ProductDetailsModal
          data={extractedData}
          onClose={() => setShowProductDetails(false)}
        />
      )}
    </div>
  );
};

export { MainContent }; 