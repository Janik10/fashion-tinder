import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Ionicons>['name'];

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import SavedItemsScreen from '../screens/saved/SavedItemsScreen';
import FriendsScreen from '../screens/friends/FriendsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import VoteSessionsScreen from '../screens/votes/VoteSessionsScreen';
import VoteSessionDetailsScreen from '../screens/votes/VoteSessionDetailsScreen';
import { useAuthStore } from '../store/auth';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const VotesStack = createNativeStackNavigator();

function VotesNavigator() {
  return (
    <VotesStack.Navigator>
      <VotesStack.Screen name="VoteSessions" component={VoteSessionsScreen} options={{ headerShown: false }} />
      <VotesStack.Screen
        name="VoteSessionDetails"
        component={VoteSessionDetailsScreen}
        options={({ route }) => ({
          title: 'Vote Session Details',
          headerShown: true,
          headerBackTitle: 'Back',
        })}
      />
    </VotesStack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: IconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Saved':
              iconName = focused ? 'bookmark' : 'bookmark-outline';
              break;
            case 'Votes':
              iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
              break;
            case 'Friends':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Saved" component={SavedItemsScreen} />
      <Tab.Screen name="Votes" component={VotesNavigator} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { token } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}