import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import { SyncProvider } from './src/contexts/SyncContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SalesScreen from './src/screens/SalesScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NetworkProvider>
        <AuthProvider>
          <SyncProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <Stack.Navigator initialRouteName="Login">
                <Stack.Screen 
                  name="Login" 
                  component={LoginScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="Dashboard" 
                  component={DashboardScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="Sales" 
                  component={SalesScreen}
                  options={{ title: 'Sales Management' }}
                />
                <Stack.Screen 
                  name="Inventory" 
                  component={InventoryScreen}
                  options={{ title: 'Inventory Management' }}
                />
                <Stack.Screen 
                  name="Reports" 
                  component={ReportsScreen}
                  options={{ title: 'Reports & Analytics' }}
                />
                <Stack.Screen 
                  name="Profile" 
                  component={ProfileScreen}
                  options={{ title: 'Profile & Settings' }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </SyncProvider>
        </AuthProvider>
      </NetworkProvider>
    </PaperProvider>
  );
}
