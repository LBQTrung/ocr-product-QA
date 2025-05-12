import { useState, useEffect } from 'react'
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import Sidebar from './components/Sidebar'
import { MainContent } from './components/MainContent'

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp?: string;
}

interface ExtractedData {
  Ingredients: string[];
  image: string;
  [key: string]: string | string[] | undefined;
}

interface Chat {
  _id: string;
  name: string;
  messages: Message[];
  productInformation: ExtractedData;
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
})

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [resetKey, setResetKey] = useState(0)
  const [chatList, setChatList] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)

  // Fetch chat list when component mounts
  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/chats')
      const data = await response.json()
      if (data.status === 'success') {
        setChatList(data.data)
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleNewChat = () => {
    setResetKey(prev => prev + 1)
    setSelectedChat(null)
  }

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat)
    setResetKey(prev => prev + 1)
  }

  const handleRenameChat = async (chatId: string, newName: string) => {
    try {
      // Call API to rename chat
      const response = await fetch(`http://localhost:8000/api/chats/${chatId}/rename`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newName
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        // Update chat list
        setChatList(prev => prev.map(chat => 
          chat._id === chatId ? { ...chat, name: newName } : chat
        ));
        
        // Update selected chat if it's the one being renamed
        if (selectedChat?._id === chatId) {
          setSelectedChat(prev => prev ? { ...prev, name: newName } : null);
        }

        // Refresh chat list to ensure consistency
        await fetchChats();
      } else {
        throw new Error(data.message || 'Failed to rename chat');
      }
    } catch (error) {
      console.error('Error renaming chat:', error);
      // Revert the chat name in the UI if the API call fails
      const chat = chatList.find(c => c._id === chatId);
      if (chat) {
        setChatList(prev => prev.map(c => 
          c._id === chatId ? { ...c, name: chat.name } : c
        ));
        if (selectedChat?._id === chatId) {
          setSelectedChat(prev => prev ? { ...prev, name: chat.name } : null);
        }
      }
      throw error;
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      // Call API to delete chat
      const response = await fetch(`http://localhost:8000/api/chats/${chatId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        // Update chat list by removing the deleted chat
        setChatList(prev => prev.filter(chat => chat._id !== chatId));
        
        // Clear selected chat if it's the one being deleted
        if (selectedChat?._id === chatId) {
          setSelectedChat(null);
          setResetKey(prev => prev + 1);
        }

        // Refresh chat list to ensure consistency
        await fetchChats();
      } else {
        throw new Error(data.message || 'Failed to delete chat');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      // Refresh chat list to ensure UI is in sync with backend
      await fetchChats();
      throw error;
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChat) return;

    const timestamp = new Date().toISOString();
    const userMessage: Message = {
      id: `user-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
      sender: 'user',
      text: content,
      timestamp
    };

    // Add user message to chat immediately
    setChatList(prevChats => {
      return prevChats.map(chat => {
        if (chat._id === selectedChat._id) {
          return {
            ...chat,
            messages: [...chat.messages, userMessage]
          };
        }
        return chat;
      });
    });

    try {
      const response = await fetch('http://localhost:8000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: selectedChat._id,
          content: content
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      const botMessage: Message = {
        id: `bot-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
        sender: 'bot',
        text: data.data.content,
        timestamp: new Date().toISOString()
      };

      // Update chat with bot response
      setChatList(prevChats => {
        return prevChats.map(chat => {
          if (chat._id === selectedChat._id) {
            // Remove the temporary user message and add both messages
            const messages = chat.messages.filter(m => m.id !== userMessage.id);
            return {
              ...chat,
              messages: [...messages, userMessage, botMessage]
            };
          }
          return chat;
        });
      });

      // Update selected chat
      setSelectedChat(prev => {
        if (!prev) return null;
        const messages = prev.messages.filter(m => m.id !== userMessage.id);
        return {
          ...prev,
          messages: [...messages, userMessage, botMessage]
        };
      });

    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the temporary user message on error
      setChatList(prevChats => {
        return prevChats.map(chat => {
          if (chat._id === selectedChat._id) {
            return {
              ...chat,
              messages: chat.messages.filter(m => m.id !== userMessage.id)
            };
          }
          return chat;
        });
      });
    }
  };

  const handleResendMessage = async (messageId: string, chatId: string, content: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/messages/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          content: content
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to resend message');
      }

      const data = await response.json();
      const timestamp = new Date().toISOString();
      const newBotMessage: Message = {
        id: `bot-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
        sender: 'bot',
        text: data.data.content,
        timestamp
      };
      
      // Update the chat messages with the new response
      setChatList(prevChats => {
        return prevChats.map(chat => {
          if (chat._id === chatId) {
            // Find the index of the message to replace
            const messageIndex = chat.messages.findIndex(m => m.id === messageId);
            if (messageIndex !== -1) {
              const newMessages = [...chat.messages];
              newMessages[messageIndex] = newBotMessage;
              return { ...chat, messages: newMessages };
            }
          }
          return chat;
        });
      });

      // If this is the selected chat, update the messages in the chat history
      if (selectedChat?._id === chatId) {
        setSelectedChat(prev => {
          if (!prev) return null;
          const messageIndex = prev.messages.findIndex(m => m.id === messageId);
          if (messageIndex !== -1) {
            const newMessages = [...prev.messages];
            newMessages[messageIndex] = newBotMessage;
            return { ...prev, messages: newMessages };
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error resending message:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={toggleSidebar} 
          onNewChat={handleNewChat}
          chatList={chatList}
          onSelectChat={handleSelectChat}
          onRenameChat={handleRenameChat}
          onDeleteChat={handleDeleteChat}
        />
        <MainContent 
          key={resetKey} 
          selectedChat={selectedChat}
          onSendMessage={handleSendMessage}
          onResendMessage={handleResendMessage}
        />
      </Box>
    </ThemeProvider>
  )
}

export default App
