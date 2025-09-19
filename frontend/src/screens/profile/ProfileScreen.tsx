import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuthStore } from '../../store/auth';
import type { Item } from '../../types/item';

interface Profile {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  bio?: string;
  likes: number;
  friends: number;
  saved: number;
  recentlyLiked: Item[];
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, logout } = useAuthStore();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to load profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: logout,
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
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
          onPress={() => loadProfile()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={
            profile.avatar
              ? { uri: profile.avatar }
              : require('../../assets/default-avatar.png')
          }
          style={styles.avatar}
        />
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile.likes}</Text>
          <Text style={styles.statLabel}>Likes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile.friends}</Text>
          <Text style={styles.statLabel}>Friends</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile.saved}</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
      </View>

      {profile.recentlyLiked.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently Liked</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {profile.recentlyLiked.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <Image
                  source={{ uri: item.images[0] }}
                  style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemBrand} numberOfLines={1}>
                    {item.brand}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  bio: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  section: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  itemCard: {
    width: 150,
    marginRight: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  itemInfo: {
    padding: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemBrand: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
  logoutButton: {
    backgroundColor: '#FF3B30',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});