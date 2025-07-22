import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { selectAccessToken } from 'slices/authSlice';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { BACKEND_URL, IMAGE_URL } from '@env';

const { width, height } = Dimensions.get('window');
const API_URL = `${BACKEND_URL}/featured`;

const RestaurantOwnerHomePage = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [editingDish, setEditingDish] = useState(null);

  const [newDish, setNewDish] = useState({
    name: '',
    price: '',
    description: '',
    image: null,
  });
  const [errors, setErrors] = useState({
    name: '',
    price: '',
    image: '',
    general: '',
  });
  const [loading, setLoading] = useState({
    orders: false,
    dishes: false,
    addDish: false,
    deleteDish: false,
    statusUpdate: false,
  });
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const accessToken = useSelector(selectAccessToken);

  useEffect(() => {
    fetchOrders();
    fetchDishes();
  }, []);

  const validateForm = () => {
    const newErrors = {
      name: !newDish.name ? 'Dish name is required' : '',
      price: !newDish.price
        ? 'Price is required'
        : isNaN(newDish.price)
          ? 'Price must be a number'
          : '',
      image: !newDish.image ? 'Image is required' : '',
      general: '',
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const fetchOrders = async () => {
    try {
      setLoading((prev) => ({ ...prev, orders: true }));
      const res = await axios.get(`${API_URL}/restaurant/orders`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setOrders(res.data.orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      showErrorAlert('Failed to fetch orders', err.response?.data?.message || err.message);
    } finally {
      setLoading((prev) => ({ ...prev, orders: false }));
    }
  };

  const fetchDishes = async () => {
    try {
      setLoading((prev) => ({ ...prev, dishes: true }));
      const res = await axios.get(`${API_URL}/restaurant/dishes`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setDishes(res.data.dishes);
    } catch (err) {
      console.error('Error fetching dishes:', err);
      showErrorAlert('Failed to fetch dishes', err.response?.data?.message || err.message);
    } finally {
      setLoading((prev) => ({ ...prev, dishes: false }));
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showErrorAlert('Permission required', 'Please allow media access to select an image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setNewDish((prev) => ({ ...prev, image: result.assets[0] }));
        setErrors((prev) => ({ ...prev, image: '' }));
      }
    } catch (err) {
      console.error('Error picking image:', err);
      showErrorAlert('Image Selection Error', 'Failed to select image');
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      setLoading((prev) => ({ ...prev, statusUpdate: true }));
      await axios.patch(
        `${API_URL}/order?orderId=${orderId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      showErrorAlert('Failed to update order status', err.response?.data?.message || err.message);
    } finally {
      setLoading((prev) => ({ ...prev, statusUpdate: false }));
    }
  };

 const handleEditDish = (dish) => {
   setEditingDish(dish);
   setNewDish({
     name: dish.name,
     price: dish.price.toString(),
     description: dish.description,
     image: dish.image ? { uri: `${IMAGE_URL}${dish.image}` } : null,
   });
   setShowAddDishModal(true);
 };

 const handleAddOrUpdateDish = async () => {
   if (!validateForm()) return;

   try {
     setLoading((prev) => ({ ...prev, addDish: true }));

     const formData = new FormData();
     formData.append('name', newDish.name);
     formData.append('price', newDish.price);
     formData.append('description', newDish.description);

     if (newDish.image && newDish.image.uri) {
       // Only append if it's a new image (has uri property)
       formData.append('image', {
         uri: newDish.image.uri,
         name: `dish-${Date.now()}.jpg`,
         type: 'image/jpeg',
       });
     }

     const url = editingDish
       ? `${API_URL}/update-dish?dishId=${editingDish?._id}`
       : `${API_URL}/restaurant/dishes`;


     const response = await axios.post(url, formData, {
       headers: {
         Authorization: `Bearer ${accessToken}`,
         'Content-Type': 'multipart/form-data',
       },
     });

     // Update state based on whether we're adding or editing
     if (editingDish) {
       setDishes((prevDishes) =>
         prevDishes.map((dish) => (dish?._id === editingDish?._id ? response.data.dish : dish))
       );
     } else {
       setDishes((prevDishes) => [...prevDishes, response.data.dish]);
     }

     resetDishForm();
     Alert.alert('Success', `Dish ${editingDish ? 'updated' : 'added'} successfully!`);
   } catch (err) {
     console.error('Error saving dish:', err);
     showErrorAlert(
       `Failed to ${editingDish ? 'update' : 'add'} dish`,
       err.response?.data?.message || err.message
     );
   } finally {
     setLoading((prev) => ({ ...prev, addDish: false }));
   }
 };

 const resetDishForm = () => {
   setNewDish({ name: '', price: '', description: '', image: null });
   setEditingDish(null);
   setShowAddDishModal(false);
 };
  const handleDeleteDish = async (dishId) => {
    try {
      setLoading((prev) => ({ ...prev, deleteDish: true }));
      await axios.delete(`${API_URL}/restaurant/dishes?dishId=${dishId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      fetchDishes();
      Alert.alert('Success', 'Dish deleted successfully!');
    } catch (err) {
      console.error('Error deleting dish:', err);
      showErrorAlert('Failed to delete dish', err.response?.data?.message || err.message);
    } finally {
      setLoading((prev) => ({ ...prev, deleteDish: false }));
    }
  };

  const showErrorAlert = (title, message) => {
    Alert.alert(title, message, [
      { text: 'OK', onPress: () => setErrors((prev) => ({ ...prev, general: '' })) },
    ]);
  };

  const statusColors = {
    preparing: '#3498db',
    'on-the-way': '#f39c12',
    delivered: '#9b59b6',
  };

  const statusIcons = {
    preparing: 'progress-clock',
    'on-the-way': 'truck-delivery',
    delivered: 'check-circle',
  };

  const nextStatus = {
    preparing: 'on-the-way',
    'on-the-way': 'delivered',
  };

  const statusLabels = {
    preparing: 'Preparing',
    'on-the-way': 'On The Way',
    delivered: 'Delivered',
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item?._id.substring(0, 6)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
          <MaterialCommunityIcons
            name={statusIcons[item.status]}
            size={16}
            color="#fff"
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text>Customer: {item.customerName || 'Guest'}</Text>
        <Text>Items: {item.items.length}</Text>
        <Text>Total: ₹{item.totalAmount.toFixed(2)}</Text>
      </View>

      {/* Status Progress Bar */}
      <View style={styles.progressContainer}>
        {Object.keys(statusColors).map((status, index) => (
          <React.Fragment key={status}>
            <TouchableOpacity
              onPress={() => handleStatusUpdate(item._id, status)}
              style={styles.progressStep}
              disabled={loading.statusUpdate}>
              <View
                style={[
                  styles.progressCircle,
                  {
                    backgroundColor: item.status === status ? statusColors[status] : '#e0e0e0',
                  },
                ]}>
                <MaterialCommunityIcons name={statusIcons[status]} size={16} color="#fff" />
              </View>
              <Text>{statusLabels[status]}</Text>
            </TouchableOpacity>

            {index < Object.keys(statusColors).length - 1 && <View style={styles.progressLine} />}
          </React.Fragment>
        ))}
      </View>

      {/* Quick Advance Status Button */}
      {nextStatus[item.status] && (
        <TouchableOpacity
          style={[
            styles.quickActionButton,
            { backgroundColor: statusColors[nextStatus[item.status]] },
          ]}
          onPress={() => handleStatusUpdate(item._id, nextStatus[item.status])}
          disabled={loading.statusUpdate}>
          <Text style={styles.quickActionText}>
            Mark as {statusLabels[nextStatus[item.status]]}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

 const renderDishItem = ({ item }) => {
   const imageUrl = item.image
     ? `${IMAGE_URL}${item.image}`
     : 'https://via.placeholder.com/150';
(imageUrl)
   return (
     <View style={styles.dishCard}>
       <Image source={{ uri: imageUrl }} style={styles.dishImage} />
       <View style={styles.dishDetails}>
         <Text style={styles.dishName}>{item.name}</Text>
         <View style={styles.priceRatingContainer}>
           <Text style={styles.dishPrice}>₹{item.price}</Text>
           <View style={styles.popularTag}>
             <MaterialIcons name="star" size={14} color="#FFD700" />
             <Text style={styles.popularText}>Popular</Text>
           </View>
         </View>
         <Text style={styles.dishDescription} numberOfLines={2}>
           {item.description || 'No description'}
         </Text>

         <View style={styles.dishActions}>
           <TouchableOpacity
             style={[styles.actionButton, styles.editButton]}
             onPress={() => handleEditDish(item)}
             disabled={loading.deleteDish}>
             <Icon name="edit" size={26} color="#fff" />
           </TouchableOpacity>
           <TouchableOpacity
             style={[styles.actionButton, styles.deleteButton]}
             onPress={() => handleDeleteDish(item._id)}
             disabled={loading.deleteDish}>
             {loading.deleteDish ? (
               <ActivityIndicator size="small" color="#fff" />
             ) : (
               <>
                 <Icon name="delete" size={26} color="#fff" />
               </>
             )}
           </TouchableOpacity>
         </View>
       </View>
     </View>
   );
 };


  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'preparing':
        return '#FFA500'; // Orange
      case 'on-the-way':
        return '#3498db'; // Blue
      case 'delivered':
        return '#2ecc71'; // Green
      case 'cancelled':
        return '#e74c3c'; // Red
      default:
        return '#95a5a6'; // Grey
    }
  };

  if ((loading.orders || loading.dishes) && !showAddDishModal) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#FF6B6B', '#FF8E8E']} style={styles.header}>
        <Text style={styles.headerTitle}>Restaurant Dashboard</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => {
            fetchOrders();
            fetchDishes();
          }}>
          <Icon name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Orders Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeader}>Incoming Orders</Text>
            <Text style={styles.sectionCount}>{orders.length}</Text>
          </View>

          {orders.length > 0 ? (
            <FlatList
              data={orders}
              renderItem={renderOrderItem}
              keyExtractor={(item) => item?._id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="receipt" size={40} color="#ddd" />
              <Text style={styles.emptyText}>No orders yet</Text>
            </View>
          )}
        </View>

        {/* Dishes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeader}>Your Menu</Text>
            <Text style={styles.sectionCount}>{dishes.length}</Text>
          </View>

          {dishes.length > 0 ? (
            <FlatList
              data={dishes}
              renderItem={renderDishItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="fastfood" size={40} color="#ddd" />
              <Text style={styles.emptyText}>Add your first dish</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setErrors({ name: '', price: '', image: '', general: '' });
          setShowAddDishModal(true);
        }}>
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Add Dish Modal */}
      <Modal
        visible={showAddDishModal}
        animationType="slide"
        transparent={true}
        onRequestClose={resetDishForm}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingDish ? 'Edit Dish' : 'Add New Dish'}</Text>
              <TouchableOpacity onPress={resetDishForm}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {errors.general && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{errors.general}</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.imageUploadButton}
                onPress={pickImage}
                activeOpacity={0.8}>
                {newDish.image ? (
                  <>
                    <Image source={{ uri: `${IMAGE_URL}${newDish.image.uri}` }} style={styles.previewImage} />
                    <View style={styles.editOverlay}>
                      <MaterialIcons name="edit" size={24} color="white" />
                    </View>
                  </>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <FontAwesome name="camera" size={32} color="#666" />
                    <Text style={styles.uploadText}>Add Dish Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}

              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Dish Name"
                placeholderTextColor="#999"
                value={newDish.name}
                onChangeText={(text) => {
                  setNewDish({ ...newDish, name: text });
                  setErrors({ ...errors, name: '' });
                }}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

              <TextInput
                style={[styles.input, errors.price && styles.inputError]}
                placeholder="Price (₹)"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={newDish.price}
                onChangeText={(text) => {
                  setNewDish({ ...newDish, price: text });
                  setErrors({ ...errors, price: '' });
                }}
              />
              {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}

              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Description"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={newDish.description}
                onChangeText={(text) => setNewDish({ ...newDish, description: text })}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={resetDishForm}
                disabled={loading.addDish}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, loading.addDish && styles.saveButtonDisabled]}
                onPress={handleAddOrUpdateDish}
                disabled={loading.addDish}>
                {loading.addDish ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingDish ? 'Update Dish' : 'Save Dish'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    padding: 5,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  sectionCount: {
    backgroundColor: '#FF6B6B',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 14,
  },
  dishCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dishImage: {
    width: 120,
    height: 120,
  },
  dishDetails: {
    flex: 1,
    padding: 12,
  },
  dishName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  priceRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dishPrice: {
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginRight: 10,
  },
  popularTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  popularText: {
    fontSize: 12,
    color: '#FFA500',
    marginLeft: 4,
  },
  dishDescription: {
    fontSize: 13,
    color: '#777',
    marginBottom: 12,
  },
  dishActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#f39c12',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 5,
    fontWeight: '500',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 10,
  },
  emptyText: {
    marginTop: 10,
    color: '#999',
    fontSize: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderId: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  orderText: {
    fontSize: 14,
    marginBottom: 6,
    color: '#666',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#333',
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  activeStatusButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 12,
  },
  dishCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dishImage: {
    width: 150,
    height: 120,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  dishDetails: {
    flex: 1,
    padding: 12,
  },
  dishName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  dishPrice: {
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 6,
  },
  dishDescription: {
    fontSize: 12,
    color: '#777',
    marginBottom: 10,
  },
  dishActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#f39c12',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 20,
  },
  imageUploadButton: {
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    height: 180,
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    padding: 20,
  },
  uploadText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 5,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#FFB6B6',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginBottom: 15,
    marginLeft: 5,
  },
  errorBanner: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorBannerText: {
    color: 'white',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 8,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  orderTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusIcon: {
    marginRight: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  orderDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressStep: {
    alignItems: 'center',
    zIndex: 1,
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
    textAlign: 'center',
  },
  progressLine: {
    height: 2,
    flex: 1,
    marginHorizontal: -5,
    marginTop: 15,
  },
  quickActionButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickActionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default RestaurantOwnerHomePage;
