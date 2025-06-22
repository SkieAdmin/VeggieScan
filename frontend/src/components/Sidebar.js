import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Dashboard,
  CameraAlt,
  History,
  Settings,
  AdminPanelSettings,
  People,
  Image,
  Storage,
  Logout
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 240;

const Sidebar = ({ open, onClose, variant = 'permanent' }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Common navigation items for all users
  const commonNavItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
      role: 'all'
    },
    {
      text: 'Scan Vegetable',
      icon: <CameraAlt />,
      path: '/scan',
      role: 'all'
    },
    {
      text: 'Scan History',
      icon: <History />,
      path: '/history',
      role: 'all'
    },
    {
      text: 'Settings',
      icon: <Settings />,
      path: '/settings',
      role: 'all'
    }
  ];

  // Admin-specific navigation items
  const adminNavItems = [
    {
      text: 'Admin Dashboard',
      icon: <AdminPanelSettings />,
      path: '/admin',
      role: 'ADMIN'
    },
    {
      text: 'User Management',
      icon: <People />,
      path: '/admin/users',
      role: 'ADMIN'
    },
    {
      text: 'Scan Management',
      icon: <Image />,
      path: '/admin/scans',
      role: 'ADMIN'
    },
    {
      text: 'System Status',
      icon: <Storage />,
      path: '/admin/system',
      role: 'ADMIN'
    }
  ];

  // Filter navigation items based on user role
  const navItems = [
    ...commonNavItems,
    ...(currentUser?.role === 'ADMIN' ? adminNavItems : [])
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* App Logo and Title */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText
        }}
      >
        <Avatar
          src="/logo.png"
          alt="VeggieScan Logo"
          sx={{ width: 40, height: 40, mr: 2 }}
        />
        <Typography variant="h6" noWrap component="div">
          VeggieScan
        </Typography>
      </Box>

      {/* User Info */}
      {currentUser && (
        <Box sx={{ p: 2, backgroundColor: theme.palette.background.default }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: currentUser?.role === 'ADMIN' ? theme.palette.secondary.main : theme.palette.primary.main,
                width: 32,
                height: 32,
                mr: 1
              }}
            >
              {currentUser?.name ? currentUser.name.charAt(0) : '?'}
            </Avatar>
            <Box sx={{ ml: 1 }}>
              <Typography variant="subtitle2" noWrap>
                {currentUser?.name || 'User'}
              </Typography>
              <Typography variant="caption" color="textSecondary" noWrap>
                {currentUser?.role === 'ADMIN' ? 'Administrator' : 'Consumer'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      <Divider />

      {/* Navigation Items */}
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.action.selected,
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? theme.palette.primary.main : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Logout */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant={variant}
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: variant === 'permanent' ? 'block' : 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
