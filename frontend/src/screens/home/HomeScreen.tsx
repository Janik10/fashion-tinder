import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useItemStore } from '../../store/items';
import type { Item } from '../../types/item';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

type GestureContext = {
  startX: number;
};

export default function HomeScreen() {
  const { feed, loadFeed, likeItem, passItem, saveItem } = useItemStore();
  const x = useSharedValue(0);

  useEffect(() => {
    loadFeed();
  }, []);

  const currentItem: Item | undefined = feed[0];

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    GestureContext
  >({
    onStart: () => {},
    onActive: (event: { translationX: number }) => {
      x.value = event.translationX;
    },
    onEnd: (event: { translationX: number }) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        if (event.translationX > 0) {
          runOnJS(handleLike)();
        } else {
          runOnJS(handlePass)();
        }
      } else {
        x.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  const handleLike = async () => {
    if (currentItem) {
      await likeItem(currentItem.id);
      loadFeed();
    }
  };

  const handlePass = async () => {
    if (currentItem) {
      await passItem(currentItem.id);
      loadFeed();
    }
  };

  const handleSave = async () => {
    if (currentItem) {
      await saveItem(currentItem.id);
    }
  };

  if (!currentItem) {
    return (
      <View style={styles.container}>
        <Text style={styles.noItemsText}>No more items to show!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <Image
            source={{ uri: currentItem.images[0] }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.info}>
            <Text style={styles.name}>{currentItem.name}</Text>
            <Text style={styles.brand}>{currentItem.brand}</Text>
            <Text style={styles.price}>
              ${Number(currentItem.price).toFixed(2)} {currentItem.currency}
            </Text>
            <View style={styles.tags}>
              {currentItem.tags.map((tag: string, index: number) => (
                <Text key={index} style={styles.tag}>
                  #{tag}
                </Text>
              ))}
            </View>
          </View>
        </Animated.View>
      </PanGestureHandler>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handlePass}>
          <Ionicons name="close-circle" size={64} color="#FF3B30" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
          <Ionicons name="bookmark" size={64} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons name="heart" size={64} color="#4CD964" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 1.2,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '70%',
  },
  info: {
    padding: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  brand: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 5,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 5,
    marginBottom: 5,
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  actionButton: {
    padding: 10,
  },
  noItemsText: {
    fontSize: 18,
    color: '#666',
  },
});