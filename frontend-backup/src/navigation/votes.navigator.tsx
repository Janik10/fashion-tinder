import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import VoteSessionsScreen from '../screens/votes/VoteSessionsScreen';
import VoteSessionDetailsScreen from '../screens/votes/VoteSessionDetailsScreen';

export type VotesStackParamList = {
  VoteSessions: undefined;
  VoteSessionDetails: { sessionId: string };
};

const Stack = createStackNavigator<VotesStackParamList>();

export function VotesNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="VoteSessions" 
        component={VoteSessionsScreen}
        options={{ title: 'Vote Sessions' }}
      />
      <Stack.Screen
        name="VoteSessionDetails"
        component={VoteSessionDetailsScreen}
        options={{ title: 'Vote Session' }}
      />
    </Stack.Navigator>
  );
}