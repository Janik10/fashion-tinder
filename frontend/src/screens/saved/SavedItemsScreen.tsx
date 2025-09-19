import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useItemStore } from '../../store/items';
import type { Item } from '../../types/item';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SavedItemsScreen() {
  const { savedItems, loadSavedItems, isLoading, error } = useItemStore();

  useEffect(() => {
    loadSavedItems();
  }, []);

  if (isLoading) {
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
          onPress={() => loadSavedItems()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Items</Text>
      <FlatList
        data={savedItems}
        keyExtractor={(item: Item) => item.id}
        numColumns={2}
        renderItem={({ item }: { item: Item }) => (
          <TouchableOpacity style={styles.itemContainer}>
            <Image
              source={{ uri: item.images[0] }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemBrand} numberOfLines={1}>
                {item.brand}
              </Text>
              <Text style={styles.itemPrice}>
                ${Number(item.price).toFixed(2)} {item.currency}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No saved items yet!</Text>
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
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginLeft: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    flex: 1,
    margin: 5,
    backgroundColor: 'white',
    borderRadius: 10,
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
  image: {
    width: '100%',
    height: (SCREEN_WIDTH - 40) / 2,
  },
  itemInfo: {
    padding: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemBrand: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
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
});