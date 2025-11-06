import { StyleSheet } from 'react-native';
import React from 'react';
import Home from './src/components/Home';
import Dashboard from './src/components/Dashboard';
import Signup from './src/components/Signup';
import Classic from './src/components/Classic';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Fast from './src/components/Fast';
import Power from './src/components/Power';
import Private from './src/components/Private';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false, }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Classic" component={Classic} options={{
          headerShown: true, headerStyle: { borderBottomColor: '#F49BAB', borderBottomWidth: 2, backgroundColor: '#FFE1E0' },
          headerTintColor: '#52357B'
        }} />
        <Stack.Screen name="Fast" component={Fast} options={{
          headerShown: true, headerStyle: { borderBottomColor: '#F49BAB', borderBottomWidth: 2 ,backgroundColor: '#FFE1E0'},
          headerTintColor: '#52357B'
        }} />
        <Stack.Screen name="Power" component={Power} options={{
          headerShown: true, headerStyle: { borderBottomColor: '#F49BAB', borderBottomWidth: 2 ,backgroundColor: '#FFE1E0'},
          headerTintColor: '#52357B'
        }} />
        <Stack.Screen name="Private" component={Private} options={{
          headerShown: true, headerStyle: { borderBottomColor: '#F49BAB', borderBottomWidth: 2 ,backgroundColor: '#FFE1E0'},
          headerTintColor: '#52357B'
        }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

const styles = StyleSheet.create({});
