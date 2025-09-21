import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { Loading } from '../../components/Loading';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuthStore } from '../../store/auth';
import { useVotesStore } from '../../store/votes';

import type { VoteSession } from '../../store/votes';

import type { StackScreenProps } from '@react-navigation/stack';

export type VotesStackParamList = {
  VoteSessionDetails: { sessionId: string };
  VoteSessions: undefined;
};

type Props = StackScreenProps<VotesStackParamList, 'VoteSessions'>;

export default function VoteSessionsScreen({ navigation }: Props) {
  const [sessions, setSessions] = useState<VoteSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const { token } = useAuthStore();

  const { sessions: voteSessions, loadSessions } = useVotesStore();

  // Load sessions on mount and focus
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSessions();
    });

    loadSessions();
    return unsubscribe;
  }, [navigation, loadSessions]);

  const { createSession: createVoteSession } = useVotesStore();

  const handleCreateSession = async () => {
    if (!sessionName.trim()) {
      setError('Session name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createVoteSession(sessionName, sessionDescription);
      setShowCreateForm(false);
      setSessionName('');
      setSessionDescription('');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to create vote session'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderSession = ({ item }: { item: VoteSession }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => navigation.navigate('VoteSessionDetails', { sessionId: item.id })}
    >
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionName}>{item.name}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === 'active' ? '#4CD964' : '#8E8E93',
            },
          ]}
        >
          <Text style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      <View style={styles.sessionFooter}>
        <Text style={styles.participants}>
          {item.participants.length} participant{item.participants.length !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !voteSessions.length) {
    return <Loading message="Loading vote sessions..." />;
  }

  return (
    <View style={styles.container}>
      {!showCreateForm ? (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Vote Sessions</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateForm(true)}
            >
              <Ionicons name="add-circle" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {error ? (
            <ErrorMessage
              message={error}
              retry={() => loadSessions()}
              style={styles.error}
            />
          ) : (
            <FlatList
              data={voteSessions}
              renderItem={renderSession}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.sessionsList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No vote sessions found</Text>
                  <Text style={styles.emptySubtext}>
                    Create one to start comparing fashion items with friends!
                  </Text>
                </View>
              }
              refreshing={loading}
              onRefresh={loadSessions}
            />
          )}
        </>
      ) : (
        <View style={styles.createForm}>
          <Text style={styles.formTitle}>Create Vote Session</Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <TextInput
            style={styles.input}
            placeholder="Session Name"
            value={sessionName}
            onChangeText={setSessionName}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (optional)"
            value={sessionDescription}
            onChangeText={setSessionDescription}
            multiline
            numberOfLines={4}
          />
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setShowCreateForm(false);
                setError(null);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleCreateSession}
            >
              <Text style={styles.submitButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    padding: 8,
  },
  sessionsList: {
    flexGrow: 1,
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participants: {
    fontSize: 12,
    color: '#666',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  createForm: {
    flex: 1,
    padding: 16,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  submitButton: {
    marginLeft: 8,
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
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
  error: {
    margin: 16,
  },
});