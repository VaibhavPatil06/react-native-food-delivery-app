import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Animated,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import * as Icon from 'react-native-feather';
import { useNavigation } from '@react-navigation/native';
import { themeColor } from 'theme';
import { getMyOrders } from 'api/api';
import { selectCurrentUser } from 'slices/authSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Swipeable } from 'react-native-gesture-handler';
import { IMAGE_URL } from '@env';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const MyOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const user = useSelector(selectCurrentUser);
  const navigation = useNavigation();
  const scrollY = new Animated.Value(0);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const data = await getMyOrders(user.token);
      setOrders(data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError(error.message || 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.token]);

  const onRefresh = () => {
    fetchOrders();
  };

  const renderRightActions = (progress, dragX, item) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100],
      outputRange: [0, 0, 1],
    });

    return (
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleCancelOrder(item._id)}>
        <Animated.View style={[styles.deleteButtonContent, { transform: [{ translateX: trans }] }]}>
          <Icon.Trash2 width={20} height={20} stroke="#fff" />
          <Text style={styles.deleteButtonText}>Cancel</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const handleCancelOrder = (orderId) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            // Implement cancel order logic
            Alert.alert('Order Cancelled', 'Your order has been cancelled');
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderOrderItem = ({ item, index }) => {
    const inputRange = [-1, 0, 100 * index, 100 * (index + 2)];
    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0],
    });
    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.9],
    });

    return (
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Swipeable
          renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
          rightThreshold={40}
          enabled={item.status === 'preparing'} // Only allow swipe for preparing orders
        >
          <TouchableOpacity
            style={[styles.orderCard, { borderLeftColor: getStatusColor(item.status) }]}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
            activeOpacity={0.8}>
            <Image
              source={{ uri: `${IMAGE_URL}${item.restaurantId?.image}` }}
              style={styles.restaurantImage}
              defaultSource={require('../assets/restaurants/rawImage (1).jpg')}
            />
            <View style={styles.orderInfo}>
              <Text style={styles.restaurantName} numberOfLines={1}>
                {item.restaurantId?.name || 'Unknown Restaurant'}
              </Text>
              <View style={styles.orderMeta}>
                <View
                  style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusBadgeText}>
                    {item.status?.replace('-', ' ') || 'N/A'}
                  </Text>
                </View>
                <Text style={styles.orderDate}>
                  {format(new Date(item.createdAt), 'MMM d, yyyy - h:mm a')}
                </Text>
              </View>
              <View style={styles.orderDetails}>
                <Text style={styles.itemsCount}>
                  {item.items.reduce((acc, curr) => acc + curr.quantity, 0)} items
                </Text>
                <Text style={styles.orderTotal}>
                  ${((item.totalAmount || 0) + (item.deliveryFee || 0)).toFixed(2)}
                </Text>
              </View>
            </View>
            <Icon.ChevronRight stroke="#999" width={20} height={20} />
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColor.bgColor(1)} />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Icon.AlertCircle width={48} height={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon.ArrowLeft stroke="#333" width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity onPress={fetchOrders} style={styles.refreshButton}>
          <Icon.RefreshCw stroke="#333" width={20} height={20} />
        </TouchableOpacity>
      </View>

      {orders?.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon.ShoppingBag width={64} height={64} stroke="#ccc" />
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySubtitle}>Your order history will appear here</Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('Home')}>
            <Text style={styles.exploreButtonText}>Explore Restaurants</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <AnimatedFlatList
          data={orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[themeColor.bgColor(1)]}
              tintColor={themeColor.bgColor(1)}
            />
          }
          scrollEventThrottle={16}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: true,
          })}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
      },
    }),
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
    marginRight: -8,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  orderInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemsCount: {
    fontSize: 14,
    color: '#666',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
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
  exploreButton: {
    backgroundColor: themeColor.bgColor(1),
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 16,
    marginVertical: 8,
    marginRight: 16,
    borderRadius: 12,
    width: 100,
  },
  deleteButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default MyOrdersScreen;
