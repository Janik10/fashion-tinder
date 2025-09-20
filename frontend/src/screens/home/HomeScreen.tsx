import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useItemStore } from '../../store/items';
import type { Item } from '../../types/item';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const MAX_VISIBLE_CARDS = 3;
const ROTATION_FACTOR = 15; // degrees
const CARD_SCALE_FACTOR = 0.05;

type GestureContext = {
  startX: number;
  startY: number;
};

interface CardProps {
  item: Item;
  index: number;
  isTop: boolean;
  gestureHandler?: any;
  animatedStyle?: any;
  onSwipeComplete?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  item, 
  index,
  isTop,
  gestureHandler,
  animatedStyle,
  onSwipeComplete 
}) => {
  const cardStyle = useAnimatedStyle(() => {
    if (!isTop) {
      return {
        transform: [
          { scale: interpolate(
            index,
            [0, 3],
            [1, 1 - (CARD_SCALE_FACTOR * index)]
          )},
          { translateY: interpolate(
            index,
            [0, 3],
            [0, -10 * index]
          )}
        ],
        zIndex: MAX_VISIBLE_CARDS - index,
      };
    }
    return {};
  }, []);

  const combinedStyle = useMemo(() => [
    styles.card,
    cardStyle,
    animatedStyle,
  ], [cardStyle, animatedStyle]);

  const content = (
    <Animated.View style={combinedStyle}>
      <Image
        source={{ uri: item.images[0] }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.price}>
          ${Number(item.price).toFixed(2)} {item.currency}
        </Text>
        <View style={styles.tags}>
          {item.tags.map((tag: string, index: number) => (
            <Text key={index} style={styles.tag}>
              #{tag}
            </Text>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  if (isTop) {
    return (
      <PanGestureHandler onGestureEvent={gestureHandler}>
        {content}
      </PanGestureHandler>
    );
  }

  return content;
};

export default function HomeScreen() {
  const { feed, loadFeed, likeItem, passItem, saveItem } = useItemStore();
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    GestureContext
  >({
    onStart: (_, context) => {
      context.startX = x.value;
      context.startY = y.value;
    },
    onActive: (event, context) => {
      x.value = context.startX + event.translationX;
      y.value = context.startY + event.translationY;
      rotate.value = (event.translationX / SCREEN_WIDTH) * ROTATION_FACTOR;
    },
    onEnd: (event) => {
      const toss = 0.2;
      const velocity = event.velocityX * toss;
      
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD || Math.abs(velocity) > SWIPE_THRESHOLD) {
        const dir = Math.sign(event.translationX);
        x.value = withSpring(dir * SCREEN_WIDTH * 1.5, {
          velocity: velocity,
          damping: 15,
        });
        y.value = withSpring(0);
        rotate.value = withSpring(dir * ROTATION_FACTOR * 1.2);

        runOnJS(handleSwipeComplete)(dir > 0);
      } else {
        x.value = withSpring(0, { velocity: velocity });
        y.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    },
  });

  const handleSwipeComplete = async (liked: boolean) => {
    const currentItem = feed[0];
    if (!currentItem) return;

    try {
      if (liked) {
        await likeItem(currentItem.id);
      } else {
        await passItem(currentItem.id);
      }
    } catch (error) {
      console.error('Swipe action failed:', error);
    }
  };

  const topCardStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.abs(x.value),
      [0, SCREEN_WIDTH * 0.3],
      [1, 0.9]
    );

    return {
      transform: [
        { translateX: x.value },
        { translateY: y.value },
        { rotate: `${rotate.value}deg` },
        { scale },
      ],
      zIndex: MAX_VISIBLE_CARDS,
    };
  }, []);

  if (!feed.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.noItemsText}>No more items to show!</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={() => loadFeed()}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        {feed.slice(0, MAX_VISIBLE_CARDS).map((item, index) => (
          <Card
            key={item.id}
            item={item}
            index={index}
            isTop={index === 0}
            gestureHandler={index === 0 ? gestureHandler : undefined}
            animatedStyle={index === 0 ? topCardStyle : undefined}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleSwipeComplete(false)}
        >
          <Ionicons name="close-circle" size={64} color="#FF3B30" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => {
            if (feed[0]) {
              saveItem(feed[0].id);
            }
          }}
        >
          <Ionicons name="bookmark" size={64} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleSwipeComplete(true)}
        >
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
  cardContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.6,
    backgroundColor: 'white',
    borderRadius: 20,
    boxShadow: Platform.select({
      web: '0px 2px 4px rgba(0, 0, 0, 0.25)',
      default: 'none',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
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
    marginTop: 20,
  },
  actionButton: {
    padding: 10,
  },
  noItemsText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});