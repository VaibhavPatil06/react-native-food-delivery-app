import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TextInput,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { selectAccessToken } from 'slices/authSlice';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { themeColor } from 'theme';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import LottieView from 'lottie-react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

const { BACKEND_URL, IMAGE_URL } = Constants.expoConfig.extra;
const { width } = Dimensions.get('window');
const API_URL = `${BACKEND_URL}/featured`;

export default function FillRestaurantDetailsScreen({ navigation }) {
  const accessToken = useSelector(selectAccessToken);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [mapVisible, setMapVisible] = useState(false);
  const [location, setLocation] = useState(null);
  const [success, setSuccess] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const successAnimation = useRef(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    stars: '4.5',
    reviews: '100+',
    categories: '',
  });

  const animateSuccess = () => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photos to upload an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
      setForm({
        ...form,
        latitude: String(location.coords.latitude),
        longitude: String(location.coords.longitude),
      });
      setMapVisible(true);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    // if (!image) newErrors.image = 'Image is required';
    if (!form.latitude || !form.longitude) newErrors.location = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    const data = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key]) data.append(key, form[key]);
    });

    if (image) {
      data.append('image', {
        uri: image.uri,
        name: 'restaurant.jpg',
        type: 'image/jpeg',
      });
    }

    try {
      const response = await axios.post(`${API_URL}/restaurants-add`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data.success) {
        setSuccess(true);
        animateSuccess();

        setTimeout(() => {
          navigation.navigate('Login');
        }, 2500);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to add restaurant');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  const onGestureEvent = Animated.event([{ nativeEvent: { translationY: translateY } }], {
    useNativeDriver: true,
  });

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <LottieView
          ref={successAnimation}
          style={styles.successAnimation}
          source={require('../assets/animations/success.json')}
          progress={progress}
          loop={false}
        />
        <Text style={styles.successText}>Restaurant Added Successfully!</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <LinearGradient colors={['#f9f9f9', '#ffffff']} style={styles.gradient}>
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}>
            <Animated.View
              style={{
                transform: [{ translateY: translateY }],
              }}>
              <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                  </TouchableOpacity>
                  <Text style={styles.title}>Add Your Restaurant</Text>
                  <View style={{ width: 24 }} />
                </View>

                {/* Image Upload */}
                <View style={styles.imageSection}>
                  <TouchableOpacity
                    style={styles.imageUploadButton}
                    onPress={pickImage}
                    activeOpacity={0.8}>
                    {image ? (
                      <>
                        <Image
                          source={{ uri: `${IMAGE_URL}${image.uri}` }}
                          style={styles.previewImage}
                        />
                        <View style={styles.editOverlay}>
                          <MaterialIcons name="edit" size={24} color="white" />
                        </View>
                      </>
                    ) : (
                      <View style={styles.uploadPlaceholder}>
                        <FontAwesome name="camera" size={32} color="#666" />
                        <Text style={styles.uploadText}>Add Restaurant Photo</Text>
                        {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <View style={styles.formContainer}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Restaurant Name *</Text>
                    <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                      <MaterialIcons
                        name="restaurant"
                        size={20}
                        color="#666"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. Taste of Italy"
                        value={form.name}
                        onChangeText={(text) => setForm({ ...form, name: text })}
                      />
                    </View>
                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description *</Text>
                    <View
                      style={[
                        styles.inputContainer,
                        styles.multilineContainer,
                        errors.description && styles.inputError,
                      ]}>
                      <MaterialIcons
                        name="description"
                        size={20}
                        color="#666"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[styles.input, styles.multilineInput]}
                        placeholder="Describe your restaurant"
                        value={form.description}
                        onChangeText={(text) => setForm({ ...form, description: text })}
                        multiline
                        numberOfLines={4}
                      />
                    </View>
                    {errors.description && (
                      <Text style={styles.errorText}>{errors.description}</Text>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Address *</Text>
                    <View style={[styles.inputContainer, errors.address && styles.inputError]}>
                      <MaterialIcons
                        name="location-on"
                        size={20}
                        color="#666"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Full address"
                        value={form.address}
                        onChangeText={(text) => setForm({ ...form, address: text })}
                      />
                    </View>
                    {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Location *</Text>
                    <View style={styles.locationContainer}>
                      <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                        <MaterialIcons
                          name="gps-fixed"
                          size={20}
                          color="#666"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Latitude"
                          value={form.latitude}
                          keyboardType="numeric"
                          onChangeText={(text) => setForm({ ...form, latitude: text })}
                        />
                      </View>
                      <View style={[styles.inputContainer, { flex: 1 }]}>
                        <TextInput
                          style={styles.input}
                          placeholder="Longitude"
                          value={form.longitude}
                          keyboardType="numeric"
                          onChangeText={(text) => setForm({ ...form, longitude: text })}
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.locationButton}
                        onPress={getCurrentLocation}
                        disabled={loading}>
                        {loading ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <MaterialIcons name="my-location" size={20} color="white" />
                        )}
                      </TouchableOpacity>
                    </View>
                    {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
                  </View>

                  {mapVisible && location && (
                    <View style={styles.mapContainer}>
                      <MapView
                        style={styles.map}
                        initialRegion={{
                          latitude: location.latitude,
                          longitude: location.longitude,
                          latitudeDelta: 0.005,
                          longitudeDelta: 0.005,
                        }}>
                        <Marker
                          coordinate={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                          }}
                          title="Your Restaurant">
                          <View style={styles.marker}>
                            <MaterialIcons
                              name="restaurant"
                              size={24}
                              color={themeColor.bgColor(1)}
                            />
                          </View>
                        </Marker>
                      </MapView>
                    </View>
                  )}

                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                      <Text style={styles.label}>Rating</Text>
                      <View style={styles.inputContainer}>
                        <MaterialIcons
                          name="star"
                          size={20}
                          color="#FFD700"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. 4.5"
                          value={form.stars}
                          keyboardType="numeric"
                          onChangeText={(text) => setForm({ ...form, stars: text })}
                        />
                      </View>
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Reviews</Text>
                      <View style={styles.inputContainer}>
                        <MaterialIcons
                          name="reviews"
                          size={20}
                          color="#666"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. 100+"
                          value={form.reviews}
                          onChangeText={(text) => setForm({ ...form, reviews: text })}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Categories</Text>
                    <View style={styles.inputContainer}>
                      <MaterialIcons
                        name="category"
                        size={20}
                        color="#666"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. Italian, Pizza, Pasta"
                        value={form.categories}
                        onChangeText={(text) => setForm({ ...form, categories: text })}
                      />
                    </View>
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.8}>
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      <MaterialIcons name="add-business" size={20} color="white" /> Submit
                      Restaurant
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </PanGestureHandler>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  imageSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageUploadButton: {
    width: width * 0.8,
    height: width * 0.6,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  uploadText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  multilineContainer: {
    alignItems: 'flex-start',
    paddingTop: 14,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButton: {
    backgroundColor: themeColor.bgColor(1),
    borderRadius: 12,
    padding: 12,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  marker: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  submitButton: {
    backgroundColor: themeColor.bgColor(1),
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: 'row',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  successAnimation: {
    width: 200,
    height: 200,
  },
  successText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
  },
});
