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
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { LinearGradient } from 'expo-linear-gradient';
import { clearError, registerUser, selectAuthError, selectAuthLoading } from 'slices/authSlice';

const SignUpScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user', // default role
  });
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

const handleSignUp = async () => {
  if (formData.password !== formData.confirmPassword) {
    Alert.alert('Error', 'Passwords do not match');
    return;
  }

  try {
 const result = await dispatch(
   registerUser({
     name: formData.name,
     email: formData.email,
     password: formData.password,
     role: formData.role, // 👈 Add this
   })
 );


    if (result.error) {
      Alert.alert('Registration Failed', result.error.message);
    } else {
      Alert.alert('Success', 'Registration successful! Please login');
      navigation.navigate('Login'); // Redirect to login instead of Home
    }
  } catch (error) {
    Alert.alert('Error', 'Registration failed');
  }
};
  useEffect(() => {
    if (error) {
      Alert.alert('Registration Error', error);
      dispatch(clearError());
    }
  }, [error]);

  React.useEffect(() => {
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

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
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
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <Animated.View
                style={[
                  styles.innerContainer,
                  { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}>
                <View style={styles.logoContainer}>
                  <Image source={require('../assets/delivery.png')} style={styles.logoImage} />
                  <Text style={styles.logo}>FoodieXpress</Text>
                  <Text style={styles.tagline}>Join our foodie community</Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Create Account</Text>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <TextInput
                      placeholder="John Doe"
                      placeholderTextColor="#aaa"
                      value={formData.name}
                      onChangeText={(text) => handleChange('name', text)}
                      style={[styles.input, isFocused.name && styles.inputFocused]}
                      onFocus={() => handleFocus('name')}
                      onBlur={() => handleBlur('name')}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                      placeholder="your@email.com"
                      placeholderTextColor="#aaa"
                      value={formData.email}
                      onChangeText={(text) => handleChange('email', text)}
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
                      value={formData.password}
                      onChangeText={(text) => handleChange('password', text)}
                      style={[styles.input, isFocused.password && styles.inputFocused]}
                      onFocus={() => handleFocus('password')}
                      onBlur={() => handleBlur('password')}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <TextInput
                      placeholder="••••••••"
                      placeholderTextColor="#aaa"
                      secureTextEntry
                      value={formData.confirmPassword}
                      onChangeText={(text) => handleChange('confirmPassword', text)}
                      style={[styles.input, isFocused.confirmPassword && styles.inputFocused]}
                      onFocus={() => handleFocus('confirmPassword')}
                      onBlur={() => handleBlur('confirmPassword')}
                    />
                  </View>
                  <View style={styles.roleSelection}>
                    <Text style={styles.roleLabel}>Register as:</Text>
                    <View style={styles.roleButtons}>
                      <TouchableOpacity
                        style={[
                          styles.roleButton,
                          formData.role === 'user' && styles.selectedRoleButton,
                        ]}
                        onPress={() => handleChange('role', 'user')}>
                        <Text
                          style={[
                            styles.roleButtonText,
                            formData.role === 'user' && styles.selectedRoleButtonText,
                          ]}>
                          User
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.roleButton,
                          formData.role === 'restaurantOwner' && styles.selectedRoleButton,
                        ]}
                        onPress={() => handleChange('role', 'restaurantOwner')}>
                        <Text
                          style={[
                            styles.roleButtonText,
                            formData.role === 'restaurantOwner' && styles.selectedRoleButtonText,
                          ]}>
                          Restaurant Owner
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleSignUp}
                    activeOpacity={0.8}
                    disabled={loading}>
                    <LinearGradient
                      colors={['#FF6B6B', '#FF8E8E']}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}>
                      <Text style={styles.buttonText}>
                        {loading ? 'Creating account...' : 'Sign Up'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                      <Text style={styles.loginLink}>Login</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
};

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
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoImage: {
    width: 80,
    height: 80,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#FF6B6B',
    fontWeight: '700',
    fontSize: 14,
  },
  roleSelection: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
    marginLeft: 5,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 5,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  selectedRoleButton: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FF6B6B',
  },
  roleButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  selectedRoleButtonText: {
    color: '#fff',
  },
});

export default SignUpScreen;
