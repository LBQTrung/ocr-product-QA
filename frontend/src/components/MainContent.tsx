import { useState, useRef, useEffect } from 'react';
import StepIntro from './workflow/StepIntro';
import StepUpload from './workflow/StepUpload';
import StepLoading from './workflow/StepLoading';
import StepReview from './workflow/StepReview';
import ChatHeader from './ChatHeader';
import ChatHistory from './ChatHistory';
import type { Message } from './ChatHistory';
import ChatInput from './ChatInput';
import './Chat.css';

const BOT_REPLY = 'This product contains Alcohol Denat, which may cause dryness or irritation for sensitive skin. If you have reactive skin, consider patch testing first or consult a dermatologist.';

const MainContent = () => {
  const [step, setStep] = useState(1); // 1: Intro, 2: Upload, 3: Loading, 4: Review, 5: Chatbot
  const [language, setLanguage] = useState('en');
  const [image, setImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [loadingStep, setLoadingStep] = useState<1 | 2 | 3>(1);

  // Chatbot states
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSentMessage, setHasSentMessage] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Giả lập API trích xuất dữ liệu từ ảnh
  const handleExtractData = async () => {
    setStep(3); // Loading
    setLoadingStep(1);
  };

  // Effect để tự động chuyển loadingStep khi step === 3
  useEffect(() => {
    if (step === 3) {
      setLoadingStep(1);
      const timers: ReturnType<typeof setTimeout>[] = [];
      timers.push(setTimeout(() => setLoadingStep(2), 2000));
      timers.push(setTimeout(() => setLoadingStep(3), 4000));
      timers.push(setTimeout(() => {
        setExtractedData({
          ingredients: ['Water', 'Glycerin', 'Niacinamide', 'Alcohol Denat', 'Fragrance'],
          usage: 'Apply evenly to face twice daily after cleansing.',
          image: image,
        });
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      {step == 4 && <StepReview data={extractedData} setData={setExtractedData} onContinue={() => setStep(5)} />}
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
      )}
    </div>
  );
};

export default MainContent; 