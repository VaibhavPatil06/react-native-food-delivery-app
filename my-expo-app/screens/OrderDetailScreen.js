import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from 'react-native';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from 'slices/authSlice';
import * as Icon from 'react-native-feather';
import { useNavigation, useRoute } from '@react-navigation/native';
import { themeColor } from 'theme';
import { getOrderById } from 'api/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { format } from 'date-fns';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { IMAGE_URL } from '@env';

const OrderDetailScreen = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const user = useSelector(selectCurrentUser);
  const route = useRoute();
  const { orderId } = route.params;
  const navigation = useNavigation();

  const fetchOrderDetails = async () => {
    try {
      const orderData = await getOrderById(orderId, user.token);
      setOrder(orderData);
      setError(null);
    } catch (error) {
      console.error('Order fetch error:', error);
      setError(error.message || 'Failed to load order details');

      if (error.message.includes('Unauthorized') || error.message.includes('not found')) {
        navigation.goBack();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId, user?.token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrderDetails();
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+1234567890');
  };

  const handleTrackOrder = () => {
    if (order?.restaurantId?.latitude && order?.restaurantId?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${order.restaurantId.latitude},${order.restaurantId.longitude}`;
      Linking.openURL(url);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColor.bgColor(1)} />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.emptyContainer}>
        <Icon.AlertCircle width={48} height={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error || 'Order details not available'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrderDetails}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.retryButton, { marginTop: 12, backgroundColor: '#f0f0f0' }]}
          onPress={() => navigation.goBack()}>
          <Text style={[styles.retryButtonText, { color: '#333' }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeColor.bgColor(1)]}
          />
        }>
        {/* Header with back button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon.ChevronLeft width={24} height={24} stroke="#333" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Order Details</Text>
          <View style={{ width: 24 }} /> 
        </View>

        {/* Order status timeline */}
        <Animated.View style={styles.statusTimeline} entering={FadeIn.delay(100)}>
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineTitle}>Order Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusBadgeText}>{order.status.replace('-', ' ')}</Text>
            </View>
          </View>
          {order.status !== 'cancelled' ?
          <View style={styles.timelineSteps}>
            {['preparing', 'on-the-way', 'delivered'].map((step, index) => (
              <View key={step} style={styles.timelineStep}>
                <View
                  style={[
                    styles.timelineDot,
                    {
                      backgroundColor:
                      getStatusLevel(order.status) >= index ? themeColor.bgColor(1) : '#e0e0e0',
                      borderColor:
                      getStatusLevel(order.status) >= index ? themeColor.bgColor(1) : '#e0e0e0',
                    },
                  ]}>
                  {getStatusLevel(order.status) > index && (
                    <Icon.Check width={12} height={12} stroke="white" />
                  )}
                </View>
                <Text
                  style={[
                    styles.timelineLabel,
                    {
                      color: getStatusLevel(order.status) >= index ? '#333' : '#999',
                      fontWeight: getStatusLevel(order.status) >= index ? '600' : '400',
                    },
                  ]}>
                  {step.replace('-', ' ')}
                </Text>
                {index < 2 && (
                  <View
                  style={[
                    styles.timelineConnector,
                    {
                      backgroundColor:
                      getStatusLevel(order.status) > index ? themeColor.bgColor(1) : '#e0e0e0',
                    },
                  ]}
                  />
                )}
              </View>
            ))}
          </View>
      :""}
        </Animated.View>

        {/* Restaurant Card */}
        <Animated.View style={styles.card} entering={FadeInDown.delay(200)}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Restaurant</Text>
            <TouchableOpacity onPress={handleTrackOrder}>
              <Text style={styles.trackButton}>Track Order</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.restaurantInfo}>
            <Image
              source={{ uri: `${IMAGE_URL}${order.restaurantId.image}` }}
              style={styles.restaurantImage}
              defaultSource={require('../assets/restaurants/download (7).jpeg')}
            />
            <View style={styles.restaurantDetails}>
              <Text style={styles.restaurantName}>{order.restaurantId.name}</Text>
              <View style={styles.ratingContainer}>
                <Icon.Star width={16} height={16} fill="#FFD700" stroke="#FFD700" />
                <Text style={styles.ratingText}>
                  {order.restaurantId.stars} ({order.restaurantId.reviews} reviews)
                </Text>
              </View>
              <View style={styles.restaurantAddress}>
                <Icon.MapPin width={14} height={14} stroke="#666" />
                <Text style={styles.addressText}>{order.restaurantId.address}</Text>
              </View>
            </View>
          </View>

          {order.restaurantId.latitude && order.restaurantId.longitude && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: order.restaurantId.latitude,
                  longitude: order.restaurantId.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                onLayout={() => setMapReady(true)}>
                {mapReady && (
                  <Marker
                    coordinate={{
                      latitude: order.restaurantId.latitude,
                      longitude: order.restaurantId.longitude,
                    }}
                    title={order.restaurantId.name}>
                    <View style={styles.marker}>
                      <Icon.MapPin
                        width={24}
                        height={24}
                        fill={themeColor.bgColor(1)}
                        stroke="#fff"
                      />
                    </View>
                  </Marker>
                )}
              </MapView>
            </View>
          )}
        </Animated.View>

        {/* Order Items */}
        <Animated.View style={styles.card} entering={FadeInDown.delay(300)}>
          <Text style={styles.cardTitle}>Your Order</Text>
          {order.items.map((item, index) => (
            <View key={`${item._id}-${index}`} style={styles.orderItem}>
              <View style={styles.itemQuantity}>
                <Text style={styles.quantityText}>{item.quantity}x</Text>
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.dishId?.description && (
                  <Text style={styles.itemDescription}>{item.dishId.description}</Text>
                )}
              </View>
              <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Order Summary */}
        <Animated.View style={styles.card} entering={FadeInDown.delay(400)}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${order.totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>${order.deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>$0.00</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ${(order.totalAmount + order.deliveryFee).toFixed(2)}
            </Text>
          </View>
        </Animated.View>

        {/* Delivery Information */}
        <Animated.View style={styles.card} entering={FadeInDown.delay(500)}>
          <Text style={styles.cardTitle}>Delivery Information</Text>
          <View style={styles.infoItem}>
            <Icon.MapPin width={18} height={18} stroke="#666" />
            <Text style={styles.infoText}>{order.deliveryAddress}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon.CreditCard width={18} height={18} stroke="#666" />
            <Text style={styles.infoText}>{order.paymentMethod}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon.Calendar width={18} height={18} stroke="#666" />
            <Text style={styles.infoText}>
              {format(new Date(order.createdAt), 'MMMM d, yyyy - h:mm a')}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon.Clock width={18} height={18} stroke="#666" />
            <Text style={styles.infoText}>Estimated delivery: 30-45 minutes</Text>
          </View>
        </Animated.View>

        {/* Support Section */}
        <Animated.View style={[styles.card, { marginBottom: 24 }]} entering={FadeInDown.delay(600)}>
          <Text style={styles.cardTitle}>Need Help?</Text>
          <TouchableOpacity style={styles.supportButton} onPress={handleCallSupport}>
            <Icon.Phone width={20} height={20} stroke={themeColor.bgColor(1)} />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper functions
const getStatusColor = (status) => {
  switch (status) {
    case 'preparing':
      return '#FFA500';
    case 'on-the-way':
      return '#1E90FF';
    case 'delivered':
      return '#32CD32';
    case 'cancelled':
      return '#FF0000';
    default:
      return '#666';
  }
};

const getStatusLevel = (status) => {
  switch (status) {
    case 'preparing':
      return 0;
    case 'on-the-way':
      return 1;
    case 'delivered':
      return 2;
    default:
      return 0;
  }
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f8f8',
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: themeColor.bgColor(1),
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  trackButton: {
    color: themeColor.bgColor(1),
    fontSize: 14,
    fontWeight: '600',
  },
  restaurantInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  restaurantDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapContainer: {
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 12,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  marker: {
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemQuantity: {
    backgroundColor: '#f5f5f5',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: themeColor.text,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  statusTimeline: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
  },
  timelineSteps: {
    paddingLeft: 8,
    display:"flex"
  },
  timelineStep: {
    display: "flex",
    flexDirection:"row",
    position: 'relative',
    paddingBottom: 24,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineLabel: {
    fontSize: 14,
    paddingLeft:10,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  timelineConnector: {
    position: 'absolute',
    left: 11,
    top: 24,
    width: 2,
    height: '100%',
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColor.bgColor(1),
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: themeColor.bgColor(1),
    marginLeft: 8,
  },
});

export default OrderDetailScreen;
