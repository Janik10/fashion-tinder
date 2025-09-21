import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuthStore } from '../../store/auth';

interface Friend {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  compatibility?: {
    score: number;
    sharedLikes: string[];
  };
}

const getCompatibilityColor = (score: number): string => {
  if (score >= 80) return '#4CD964'; // Green
  if (score >= 60) return '#FF9500'; // Orange
  if (score >= 40) return '#FFCC00'; // Yellow
  return '#FF3B30'; // Red
};

export default function FriendsScreen() {
  const [friends, setFriends] = useState([] as Friend[]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as string | null);
  const { token } = useAuthStore();

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Load compatibility for each friend
      const friendsWithCompatibility = await Promise.all(
        response.data.map(async (friend: Friend) => {
          try {
            const compatResponse = await axios.get(
              `${API_URL}/api/friends/compatibility/${friend.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return { ...friend, compatibility: compatResponse.data };
          } catch (error) {
            return friend; // Return friend without compatibility if API fails
          }
        })
      );
      
      setFriends(friendsWithCompatibility);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId: string) => {
    try {
      setError(null);
      await axios.post(
        `${API_URL}/api/friends/request`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Reload friends list to show updated status
      loadFriends();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to send friend request'
      );
    }
  };

  const handleRemoveFriend = async (userId: string) => {
    try {
      setError(null);
      await axios.delete(`${API_URL}/api/friends/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Reload friends list to show updated status
      loadFriends();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to remove friend'
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadFriends()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friends</Text>
      <FlatList
        data={friends}
        keyExtractor={(item: Friend) => item.id}
        renderItem={({ item }: { item: Friend }) => (
          <TouchableOpacity style={styles.friendItem}>
            <Image
              source={
                item.avatar
                  ? { uri: item.avatar }
                  : require('../../assets/default-avatar.png')
              }
              style={styles.avatar}
            />
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{item.name}</Text>
              <Text style={styles.friendUsername}>@{item.username}</Text>
              {item.compatibility && (
                <View style={styles.compatibilityContainer}>
                  <View style={[
                    styles.compatibilityBadge,
                    { backgroundColor: getCompatibilityColor(item.compatibility.score) }
                  ]}>
                    <Text style={styles.compatibilityText}>
                      {item.compatibility.score}% compatible
                    </Text>
                  </View>
                  {item.compatibility.sharedLikes.length > 0 && (
                    <Text style={styles.sharedLikes}>
                      {item.compatibility.sharedLikes.length} shared likes
                    </Text>
                  )}
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleRemoveFriend(item.id)}
            >
              <Ionicons name="person-remove" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No friends yet!</Text>
            <Text style={styles.emptySubtext}>
              Start by sending friend requests to other users
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  listContainer: {
    flexGrow: 1,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
  },
  friendUsername: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  actionButton: {
    padding: 8,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  compatibilityContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  compatibilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  compatibilityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  sharedLikes: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});