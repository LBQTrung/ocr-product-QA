import './Chat.css';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ChatLoading from './ChatLoading';

export type Message = {
  id: string;
  sender: 'user' | 'bot';
  text: string;
};

interface ChatHistoryProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
}

const ChatHistory = ({ messages, messagesEndRef, isLoading }: ChatHistoryProps) => (
  <div className="chat-history">
    {messages.map(message => (
    <div key={message.id} className={`chat-message-row ${message.sender}`}>
        <div className={`chat-message ${message.sender}`}>
        {message.text}
        {message.sender === 'bot' && (
            <div className="chat-message-actions">
              <button className="chat-icon-btn" title="Copy"><ContentCopyRoundedIcon /></button>
              <button className="chat-icon-btn" title="Refresh"><RefreshRoundedIcon /></button>
            </div>)}
        </div>
    </div>
    ))}
    {isLoading && <ChatLoading />}
    <div ref={messagesEndRef} />
  </div>
);

export default ChatHistory; 