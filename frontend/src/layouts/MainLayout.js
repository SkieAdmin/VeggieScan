import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Tooltip,
  useMediaQuery,
  ListItemIcon
} from '@mui/material';
import {
  Menu as MenuIcon,
  Settings,
  Logout,
  DarkMode,
  LightMode
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
  const { currentUser, logout } = useAuth();
  const { darkMode, toggleDarkMode, theme } = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ mr: 2, display: { xs: 'none', md: 'flex' }, fontWeight: 'bold' }}
            >
              VeggieScan
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={currentUser?.name}>
                    {currentUser?.name?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={() => {
                  navigate('/settings');
                  handleCloseUserMenu();
                }}>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Settings</Typography>
                </MenuItem>
                <MenuItem onClick={() => {
                  toggleDarkMode();
                  handleCloseUserMenu();
                }}>
                  <ListItemIcon>
                    {darkMode ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                  </ListItemIcon>
                  <Typography textAlign="center">{darkMode ? "Light Mode" : "Dark Mode"}</Typography>
                </MenuItem>
                <MenuItem onClick={() => {
                  handleLogout();
                  handleCloseUserMenu();
                }}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Sidebar 
        open={drawerOpen} 
        onClose={handleDrawerToggle} 
        variant={isMobile ? "temporary" : "permanent"} 
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 250px)` },
          ml: { md: '250px' },
          mt: '64px'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
