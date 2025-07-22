import Navigation from 'navigation';
import './global.css';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { useEffect } from 'react';
import { initializeAuth } from 'utils/auth';
export default function App() {
  useEffect(() => {
    // Check for existing token on app start
    initializeAuth();
  }, []);
  return (
     <GestureHandlerRootView style={{ flex: 1 }}>

    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Navigation />
      </PersistGate>
    </Provider>
     </GestureHandlerRootView>
  );
}
