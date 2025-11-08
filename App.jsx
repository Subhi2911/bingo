import { StyleSheet } from 'react-native';
import React, { useState } from 'react';
import Home from './src/components/Home';
import Dashboard from './src/components/Dashboard';
import Signup from './src/components/Signup';
import Classic from './src/components/Classic';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Fast from './src/components/Fast';
import Power from './src/components/Power';
import Private from './src/components/Private';
import { SocketProvider } from "./src/context/SocketContext";

const Stack = createNativeStackNavigator();

const App = () => {


  return (
    <SocketProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false, }}>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="Classic" component={Classic} />
          <Stack.Screen name="Fast" component={Fast} />
          <Stack.Screen name="Power" component={Power} />
          <Stack.Screen name="Private" component={Private} />
        </Stack.Navigator>
      </NavigationContainer>
    </SocketProvider>
  );
}

export default App;

const styles = StyleSheet.create({});
