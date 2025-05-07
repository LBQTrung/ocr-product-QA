import { Box, IconButton, List, ListItem, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ViewSidebarRoundedIcon from '@mui/icons-material/ViewSidebarRounded';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  return (
    <Paper
      sx={{
        width: isOpen ? 280 : 80,
        height: '100%',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#EFEDEC',
        borderRight: '2px solid #E2E0DF',
        boxShadow: 'none'
      }}
      elevation={3}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', pl: "18px", gap: 1 }}>
        <IconButton onClick={onToggle} sx={{
          '&:focus': {
            outline: 'none'
          }
        }}>
          <ViewSidebarRoundedIcon sx={{ fontSize: '26px', color: '#545454', }} />
        </IconButton>
        {isOpen && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              fontSize: '22px',
              color: '#333',
              letterSpacing: 1,
              ml: 1
            }}
          >
            Visor
          </Typography>
        )}
      </Box>

      <Box
        sx={isOpen ? { 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          pl: "22px",
          cursor: 'pointer',
          py: "5px",
          borderRadius: '8px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            '& .add-button': {
              backgroundColor: 'black',
            }
          }
        }: {
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          pl: "22px",
          py: "5px",
          cursor: 'pointer',
          borderRadius: '8px',
        }}
      >
        <IconButton
          className="add-button"
          sx={{
            backgroundColor: '#545454',
            color: 'white',
            '&:hover': {
              backgroundColor: 'black',
            },
            '&:focus': {
              outline: 'none'
            },
            width: '35px',
            height: '35px',
            borderRadius: '8px',
            '& .MuiSvgIcon-root': {
              fontSize: '20px'
            }
          }}
        >
          <AddIcon />
        </IconButton>
        <Typography
          variant="subtitle2"
          onClick={() => {/* Handle new chat click */}}
          sx={{
            color: 'black',
            fontSize: '16px',
            whiteSpace: 'nowrap',
            minWidth: '80px',
            opacity: isOpen ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          New Chat
        </Typography>
      </Box>

      <Box sx={{ 
        flex: 1, 
        overflow: isOpen ? 'auto' : 'hidden',
        pl: "10px",
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#555',
        },
      }}>
        <Typography
          variant="subtitle2"
          sx={{
            px: 2,
            mt: "25px",
            mb: "10px",
            color: 'text.secondary',
            whiteSpace: 'nowrap',
            opacity: isOpen ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          Recent Chats
        </Typography>
        <List sx={{ pt: "0" }}>
          {['Một năm trước tôi đã làm gì nhỉ dsaf', 'Hôm qua tôi đã làm gì', 'Hôm nay tôi đã làm gì'].map((text) => (
            <ListItem key={text} disablePadding>
              <ListItemButton sx={{ pt: "0" }}>
                <ListItemText
                  primary={text}
                  sx={{
                    opacity: isOpen ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    '& .MuiTypography-root': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '250px'
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default Sidebar; 