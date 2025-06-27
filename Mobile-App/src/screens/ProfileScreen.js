import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { 
  Surface, 
  Text, 
  Avatar, 
  Button, 
  Card, 
  Title, 
  Paragraph,
  Switch,
  Divider,
  List,
  TextInput,
  useTheme,
  ActivityIndicator,
  Dialog,
  Portal
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService, authService } from '../services/apiService';
import { AUTH_TOKEN_KEY } from '../utils/config';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [useLmStudio, setUseLmStudio] = useState(true);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await userService.getUserProfile();
      setUser(userData);
      setName(userData.name);
      setEmail(userData.email);
      setUseLmStudio(userData.preferences?.useLmStudio !== false); // Default to true if not set
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    try {
      setSaving(true);
      await userService.updateUserProfile({ name });
      
      // Update preferences separately
      await userService.updateUserPreferences({ useLmStudio });
      
      // Refresh user data
      await fetchUserProfile();
      setEditMode(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      // Reset navigation to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.headerSurface}>
        <View style={styles.profileHeader}>
          <Avatar.Icon 
            size={80} 
            icon="account" 
            style={styles.avatar} 
            color="#ffffff"
          />
          {!editMode ? (
            <View style={styles.userInfo}>
              <Title style={styles.userName}>{user?.name}</Title>
              <Paragraph style={styles.userEmail}>{user?.email}</Paragraph>
            </View>
          ) : (
            <View style={styles.userInfo}>
              <TextInput
                label="Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                theme={{ colors: { primary: '#ffffff' } }}
              />
            </View>
          )}
        </View>
        
        {!editMode ? (
          <Button 
            mode="contained" 
            onPress={() => setEditMode(true)}
            style={styles.editButton}
            icon="account-edit"
          >
            Edit Profile
          </Button>
        ) : (
          <View style={styles.editActions}>
            <Button 
              mode="outlined" 
              onPress={() => {
                setName(user?.name);
                setEditMode(false);
              }}
              style={[styles.actionButton, styles.cancelButton]}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSaveProfile}
              style={styles.actionButton}
              loading={saving}
              disabled={saving}
            >
              Save
            </Button>
          </View>
        )}
      </Surface>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Preferences</Title>
          <Divider style={styles.divider} />
          
          <List.Item
            title="Use LM Studio for Analysis"
            description="Enable AI-powered vegetable analysis with LM Studio"
            left={props => <List.Icon {...props} icon="brain" />}
            right={props => (
              <Switch
                value={useLmStudio}
                onValueChange={setUseLmStudio}
                color={theme.colors.primary}
                disabled={editMode}
              />
            )}
          />
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Account</Title>
          <Divider style={styles.divider} />
          
          <List.Item
            title="Member Since"
            description={new Date(user?.createdAt).toLocaleDateString()}
            left={props => <List.Icon {...props} icon="calendar" />}
          />
          
          <List.Item
            title="Total Scans"
            description={user?.scanCount || '0'}
            left={props => <List.Icon {...props} icon="image-filter" />}
          />
          
          <Button
            mode="outlined"
            onPress={() => setLogoutDialogVisible(true)}
            style={styles.logoutButton}
            icon="logout"
            color={theme.colors.error}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>About VeggieScan</Title>
          <Divider style={styles.divider} />
          
          <Paragraph style={styles.aboutText}>
            VeggieScan is your vegetable freshness and safety assistant. 
            Using advanced AI technology, we help you determine if your vegetables 
            are fresh and safe to eat.
          </Paragraph>
          
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </Card.Content>
      </Card>
      
      {/* Logout Confirmation Dialog */}
      <Portal>
        <Dialog visible={logoutDialogVisible} onDismiss={() => setLogoutDialogVisible(false)}>
          <Dialog.Title>Logout</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to logout?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleLogout} color={theme.colors.error}>Logout</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  headerSurface: {
    padding: 20,
    backgroundColor: '#4caf50',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    color: '#ffffff',
    fontSize: 24,
  },
  userEmail: {
    color: '#ffffff',
    opacity: 0.8,
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 8,
    minWidth: 100,
  },
  cancelButton: {
    borderColor: '#ffffff',
  },
  card: {
    margin: 16,
    marginTop: 0,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'transparent',
    height: 40,
  },
  logoutButton: {
    marginTop: 16,
    borderColor: '#f44336',
  },
  aboutText: {
    lineHeight: 22,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  versionText: {
    opacity: 0.6,
  },
});

export default ProfileScreen;
