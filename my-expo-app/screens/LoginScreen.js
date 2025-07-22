import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { clearError, loginUser, selectAuthError, selectAuthLoading } from 'slices/authSlice';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false,
  });

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    dispatch(loginUser({ email, password }));
  };

  useEffect(() => {
    if (error) {
      Alert.alert('Login Error', error);
      dispatch(clearError());
    }
  }, [error]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleFocus = (field) => {
    setIsFocused({ ...isFocused, [field]: true });
  };

  const handleBlur = (field) => {
    setIsFocused({ ...isFocused, [field]: false });
  };

  return (
    <ImageBackground
      source={require('../assets/bg.png')}
      style={styles.bg}
      resizeMode="cover"
      blurRadius={2}>
      <LinearGradient colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)']} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Animated.View
              style={[
                styles.innerContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}>
              <View style={styles.logoContainer}>
                <Image source={require('../assets/delivery.png')} style={styles.logoImage} />
                <Text style={styles.logo}>FoodieXpress</Text>
                <Text style={styles.tagline}>Delicious meals at your doorstep</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Welcome Back!</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    placeholder="your@email.com"
                    placeholderTextColor="#aaa"
                    value={email}
                    onChangeText={setEmail}
                    style={[styles.input, isFocused.email && styles.inputFocused]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => handleFocus('email')}
                    onBlur={() => handleBlur('email')}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor="#aaa"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    style={[styles.input, isFocused.password && styles.inputFocused]}
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                  />
                </View>

                <TouchableOpacity>
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleLogin}
                  activeOpacity={0.8}
                  disabled={loading}>
                  <LinearGradient
                    colors={['#FF6B6B', '#FF8E8E']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}>
                    <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                  <Text style={styles.signupText}>
                    Don't have an account?{' '}
                    <Text onPress={() => navigation.navigate('SignUp')} style={styles.signupLink}>
                      Sign Up
                    </Text>
                  </Text>
                </View>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
};
export default LoginScreen;

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  innerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputFocused: {
    borderColor: '#FF6B6B',
    backgroundColor: '#fff',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  forgotPassword: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: -10,
    marginBottom: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  dividerText: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 10,
  },
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  socialButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  signupText: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 25,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  signupLink: {
    color: '#fff',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  signupText: {
    color: 'black',
    marginTop: 25,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  signupLink: {
    color: '#FF6B6B',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
