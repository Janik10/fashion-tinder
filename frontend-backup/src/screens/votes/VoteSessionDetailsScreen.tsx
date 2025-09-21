import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Loading } from '../../components/Loading';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Ionicons } from '@expo/vector-icons';
// Use the Item type directly from the store
type Item = {
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  images: string[];
  tags: string[];
  gender: string | null;
  season: string | null;
};
import type { StackScreenProps } from '@react-navigation/stack';
import { VotesStackParamList } from '../../navigation/votes.navigator';
import { useVotesStore } from '../../store/votes';

type Props = StackScreenProps<VotesStackParamList, 'VoteSessionDetails'>;

export default function VoteSessionDetailsScreen({ route, navigation }: Props) {
  const { 
    currentSession: session, 
    loading, 
    error, 
    loadSession, 
    submitVote,
    votes: sessionVotes,
    clearError 
  } = useVotesStore();

  useEffect(() => {
    loadSession(route.params.sessionId);
  }, [route.params.sessionId]);

  // Set the navigation title when session loads
  useEffect(() => {
    if (session) {
      navigation.setOptions({
        title: session.name,
      });
    }
  }, [session, navigation]);

  const handleVote = async (itemId: string, vote: boolean) => {
    try {
      await submitVote(session?.id || '', itemId, vote);

      // If all items have been voted on, show completion message
      const sessionVotesForItem = (sessionVotes[session?.id || ''] || []);
      if (sessionVotesForItem.length + 1 === session?.items.length) {
        Alert.alert(
          'Voting Complete',
          'Thank you for participating in this vote session!',
          [
            {
              text: 'View Results',
              onPress: () => loadSession(session.id),
            },
          ]
        );
      }
    } catch (error) {
      // Error handling is managed by the store
    }
  };

  const renderItem = ({ item }: { item: Item }) => {
    const hasVoted = (sessionVotes[session?.id || ''] || []).some((vote) => vote.itemId === item.id);
    const isWinner =
      session?.status === 'completed' &&
      session.results?.[0]?.itemId === item.id;

    return (
      <View style={styles.itemCard}>
        <Image
          source={{ uri: item.images[0] }}
          style={styles.itemImage}
          resizeMode="cover"
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemBrand}>{item.brand}</Text>
          <Text style={styles.itemPrice}>
            ${Number(item.price).toFixed(2)} {item.currency}
          </Text>
        </View>

        {session?.status === 'active' && !hasVoted && (
          <View style={styles.voteButtons}>
            <TouchableOpacity
              style={[styles.voteButton, styles.passButton]}
              onPress={() => handleVote(item.id, false)}
            >
              <Ionicons name="close-circle" size={32} color="#FF3B30" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.voteButton, styles.likeButton]}
              onPress={() => handleVote(item.id, true)}
            >
              <Ionicons name="heart" size={32} color="#4CD964" />
            </TouchableOpacity>
          </View>
        )}

        {(hasVoted || session?.status === 'completed') && (
          <View style={styles.voteResult}>
            {isWinner && (
              <View style={styles.winnerBadge}>
                <Ionicons name="trophy" size={24} color="#FFD700" />
                <Text style={styles.winnerText}>Winner!</Text>
              </View>
            )}
            {session?.status === 'completed' && (
              <Text style={styles.votesText}>
                {
                  session.results?.find(
                    (result) => result.itemId === item.id
                  )?.votes
                }{' '}
                votes
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return <Loading message="Loading vote session..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        retry={() => loadSession(route.params.sessionId)}
        style={styles.error}
      />
    );
  }

  if (!session) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{session.name}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                session.status === 'active' ? '#4CD964' : '#8E8E93',
            },
          ]}
        >
          <Text style={styles.statusText}>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </Text>
        </View>
      </View>

      {session.description && (
        <Text style={styles.description}>{session.description}</Text>
      )}

      <View style={styles.participants}>
        <Text style={styles.participantsTitle}>Participants:</Text>
        <Text style={styles.participantsList}>
          {session.participants
            .map((participant) => participant.name)
            .join(', ')}
        </Text>
      </View>

      <FlatList
        data={session.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.itemsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items in this session</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  participants: {
    marginBottom: 20,
  },
  participantsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  participantsList: {
    fontSize: 14,
    color: '#666',
  },
  itemsList: {
    flexGrow: 1,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
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
    height: 200,
  },
  itemInfo: {
    padding: 16,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
  },
  itemBrand: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  voteButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  voteButton: {
    padding: 8,
  },
  passButton: {
    backgroundColor: '#ffebeb',
    borderRadius: 20,
  },
  likeButton: {
    backgroundColor: '#ebffeb',
    borderRadius: 20,
  },
  voteResult: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
    alignItems: 'center',
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff9e6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  winnerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    marginLeft: 4,
  },
  votesText: {
    fontSize: 14,
    color: '#666',
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
    fontSize: 16,
    color: '#666',
  },
  error: {
    margin: 16,
  },
});