import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import RecordingScreen from '../screens/RecordingScreen';
import PlaybackScreen from '../screens/PlaybackScreen';
import RewriteScreen from '../screens/RewriteScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Recorderly' }} 
      />
      <Stack.Screen 
        name="Recording" 
        component={RecordingScreen} 
        options={{ title: 'New Recording' }} 
      />
      <Stack.Screen 
        name="Playback" 
        component={PlaybackScreen} 
        options={{ title: 'Playback' }} 
      />
      <Stack.Screen 
        name="Rewrite" 
        component={RewriteScreen} 
        options={{ title: 'Rewrite Options' }} 
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
