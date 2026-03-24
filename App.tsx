import { Text, View } from 'react-native';

import Login       from './screens/Login';
import AdminLogin  from './screens/AdminLogin';
import Register    from './screens/Register';
import Menu        from './screens/Menu';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

/**
 * Componente principal da aplicação.
 * Configura a navegação entre telas usando React Navigation.
 */
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Login'       component={Login} options={{ headerShown: false }} />
        <Stack.Screen name='AdminLogin'  component={AdminLogin} options={{ headerShown: false }} />
        <Stack.Screen name='Register'    component={Register} options={{ headerShown: false }}/>
        <Stack.Screen name='Menu'        component={Menu} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
    
  );
}
