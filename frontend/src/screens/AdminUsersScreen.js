import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  ActivityIndicator,
  Chip,
  Button,
  Searchbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { makeAuthenticatedRequest, API_ENDPOINTS } from '../config/api';

const AdminUsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        API_ENDPOINTS.ADMIN_USERS,
        { method: 'GET' },
        token
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleUserAction = (user, action) => {
    Alert.alert(
      `${action} User`,
      `Are you sure you want to ${action.toLowerCase()} ${user.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          onPress: () => {
            // Implement user action logic here
            Alert.alert('Coming Soon', `${action} functionality will be implemented soon`);
          },
          style: action === 'Delete' ? 'destructive' : 'default',
        },
      ]
    );
  };

  const renderUserItem = ({ item }) => (
    <Card style={styles.userCard}>
      <Card.Content>
        <View style={styles.userHeader}>
          <View style={styles.userAvatar}>
            <Icon name="account-circle" size={48} color="#4CAF50" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.username}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={styles.userDate}>
              Joined: {formatDate(item.created_at)}
            </Text>
          </View>
          <View style={styles.userBadge}>
            <Chip
              mode="flat"
              style={[
                styles.roleChip,
                {
                  backgroundColor: item.is_admin ? '#FF5722' + '20' : '#4CAF50' + '20'
                }
              ]}
              textStyle={{
                color: item.is_admin ? '#FF5722' : '#4CAF50'
              }}
            >
              {item.is_admin ? 'Admin' : 'User'}
            </Chip>
          </View>
        </View>

        <View style={styles.userActions}>
          <Button
            mode="outlined"
            onPress={() => handleUserAction(item, 'Edit')}
            style={styles.actionButton}
            compact
          >
            Edit
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleUserAction(item, 'Suspend')}
            style={styles.actionButton}
            compact
          >
            Suspend
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleUserAction(item, 'Delete')}
            style={[styles.actionButton, styles.deleteButton]}
            textColor="#F44336"
            compact
          >
            Delete
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>User Management</Title>
        <Text style={styles.subtitle}>Manage system users</Text>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search users..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statsCard}>
          <Card.Content>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{users.length}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {users.filter(u => u.is_admin).length}
                </Text>
                <Text style={styles.statLabel}>Admins</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {users.filter(u => !u.is_admin).length}
                </Text>
                <Text style={styles.statLabel}>Regular Users</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>

      {filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="people-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No users found' : 'No users yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Users will appear here once they register'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    elevation: 2,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsCard: {
    elevation: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  userCard: {
    marginBottom: 16,
    elevation: 4,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatar: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  userBadge: {
    marginLeft: 8,
  },
  roleChip: {
    marginLeft: 8,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  deleteButton: {
    borderColor: '#F44336',
  },
});

export default AdminUsersScreen;
