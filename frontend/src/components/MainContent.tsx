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

const BOT_REPLY = 'This product contains Alcohol Denat, which may cause dryness or irritation for sensitive skin. If you have reactive skin, consider patch testing first or consult a dermatologist.';

interface ExtractedData {
  ingredients: string[];
  image: string;
  [key: string]: any;
}

const MainContent = () => {
  const [step, setStep] = useState(1); // 1: Intro, 2: Upload, 3: Loading, 4: Review, 5: Chatbot
  const [language, setLanguage] = useState('en');
  const [image, setImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [loadingStep, setLoadingStep] = useState<1 | 2 | 3>(1);
  const [showProductDetails, setShowProductDetails] = useState(false);

  // Chatbot states
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSentMessage, setHasSentMessage] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Effect để scroll xuống dưới cùng khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Giả lập API trích xuất dữ liệu từ ảnh
  const handleExtractData = async () => {
    setStep(3); // Loading
    setLoadingStep(1);
  };

  // Effect để tự động chuyển loadingStep khi step === 3
  useEffect(() => {
    if (step === 3 && image) {
      setLoadingStep(1);
      const timers: ReturnType<typeof setTimeout>[] = [];
      timers.push(setTimeout(() => setLoadingStep(2), 2000)); // Mô phỏng Extract API
      timers.push(setTimeout(() => setLoadingStep(3), 4000)); // Mô phỏng Translate API
      timers.push(setTimeout(() => {
        const newData: ExtractedData = {
          ingredients: ['Water', 'Glycerin', 'Niacinamide', 'Alcohol Denat', 'Fragrance'],
          usage: 'Apply evenly to face twice daily after cleansing.',
          image: image,
        };
        setExtractedData(newData);
        setStep(4);
      }, 6000));
      return () => timers.forEach(clearTimeout);
    }
  }, [step, image]);

  // Chatbot logic giữ nguyên
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
        await new Promise(resolve => setTimeout(resolve, 2000));
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: BOT_REPLY,
          sender: 'bot'
        };
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('Error getting response:', error);
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

  return (
    <div className="chat-main">
      {/* Avatar */}
      <div className="chat-avatar">T</div>

      {step == 1 && <StepIntro language={language} setLanguage={setLanguage} onStart={() => setStep(2)} />}
      {step == 2 && <StepUpload onUpload={img => { setImage(img); handleExtractData(); }} />}
      {step == 3 && <StepLoading step={loadingStep} />}
      {step == 4 && extractedData && <StepReview data={extractedData} setData={setExtractedData} onContinue={() => setStep(5)} />}
      {step == 5 && (
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
              <ChatHistory messages={messages} messagesEndRef={messagesEndRef} isLoading={isLoading} />
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

export default MainContent; 