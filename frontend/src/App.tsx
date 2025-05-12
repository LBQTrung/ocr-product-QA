import { useState, useEffect } from 'react'
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
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
    fetchChats()
  }, [])

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
        />
        <MainContent key={resetKey} selectedChat={selectedChat} />
      </Box>
    </ThemeProvider>
  )
}

export default App
