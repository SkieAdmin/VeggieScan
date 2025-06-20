import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  List,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';

const SettingsScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => {
          // Implement cache clearing logic
          Alert.alert('Success', 'Cache cleared successfully');
        }},
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Settings</Title>
        <Text style={styles.subtitle}>Manage your account and preferences</Text>
      </View>

      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <Icon name="account-circle" size={48} color="#4CAF50" />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.username || 'User'}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <Text style={styles.profileRole}>
                {user?.is_admin ? 'Administrator' : 'Consumer'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Account</Title>
          
          <List.Item
            title="Profile Information"
            description="Update your personal details"
            left={(props) => <List.Icon {...props} icon="account-edit" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Coming Soon', 'Profile editing will be available soon');
            }}
          />
          
          <Divider />
          
          <List.Item
            title="Change Password"
            description="Update your account password"
            left={(props) => <List.Icon {...props} icon="lock" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Coming Soon', 'Password change will be available soon');
            }}
          />
        </Card.Content>
      </Card>

      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>App Settings</Title>
          
          <List.Item
            title="Notifications"
            description="Manage notification preferences"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Coming Soon', 'Notification settings will be available soon');
            }}
          />
          
          <Divider />
          
          <List.Item
            title="Data & Storage"
            description="Manage app data and storage"
            left={(props) => <List.Icon {...props} icon="database" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Coming Soon', 'Storage settings will be available soon');
            }}
          />
          
          <Divider />
          
          <List.Item
            title="Clear Cache"
            description="Clear temporary files and data"
            left={(props) => <List.Icon {...props} icon="delete-sweep" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleClearCache}
          />
        </Card.Content>
      </Card>

      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Support</Title>
          
          <List.Item
            title="Help & FAQ"
            description="Get help and find answers"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Coming Soon', 'Help section will be available soon');
            }}
          />
          
          <Divider />
          
          <List.Item
            title="Contact Support"
            description="Get in touch with our team"
            left={(props) => <List.Icon {...props} icon="email" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Contact Support', 'Email: support@veggiescan.com');
            }}
          />
          
          <Divider />
          
          <List.Item
            title="About VeggieScan"
            description="App version and information"
            left={(props) => <List.Icon {...props} icon="information" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert(
                'About VeggieScan',
                'VeggieScan v1.0.0\nVisual Diagnosis of Vegetable Freshness and Contamination\n\nDeveloped with ❤️ for better food safety'
              );
            }}
          />
        </Card.Content>
      </Card>

      <View style={styles.logoutContainer}>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor="#F44336"
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  profileCard: {
    margin: 16,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  profileRole: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
    fontWeight: '600',
  },
  settingsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  logoutContainer: {
    padding: 16,
    marginBottom: 20,
  },
  logoutButton: {
    paddingVertical: 8,
  },
});

export default SettingsScreen;
