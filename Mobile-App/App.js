import React from 'react';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';

// Define theme (similar to the web version's MUI theme)
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4caf50',
    accent: '#8bc34a',
    background: '#f5f5f5',
    surface: '#ffffff',
    error: '#f44336',
    text: '#212121',
    success: '#4caf50',
    warning: '#ff9800',
  },
};

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <AppNavigator />
    </PaperProvider>
  );
};

export default App;
