import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Button,
  ScrollView,
  TouchableHighlight,
} from 'react-native';
import * as config from "../configs/config.json"
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome'; // You can choose any icon library you prefer
import { store } from '../redux/store';
import { makeApiRequest } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import RazorpayCheckout from 'react-native-razorpay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PPButton from "../pages/Container/PPButton";
import PPTextField from "../pages/Container/PPTextField";
import { style } from "../pages/stylesheets/Style"

import {
  Modal,
  List,
  Portal,
  RadioButton,
  ActivityIndicator,
} from 'react-native-paper';
import LottieView from 'lottie-react-native';
import CartHeader from './cartHeader';
const CartScreen = ({ navigation }) => {
  const state = store.getState();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [visible, setVisible] = useState(false);
  const [cartData, setCartData] = useState([]);
  const [cartAddress, setCartAddress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false)
  const [creatingOrderisible, setcreatingOrderisible] = useState(false)


  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const showCreatingOrderModal = () => setcreatingOrderisible(true)
  const hideCreatingOrderModal = () => setcreatingOrderisible(false)

  const showApiRequestModal = () => setApiLoading(true)
  const hideApiResponseModal = () => setApiLoading(false)

  const handleAddressSelection = async (address) => {
    setSelectedAddress(address);
    hideModal();
  };

  const listProductsFroApi = async () => {
    let proQuan = []
    for (var i = 0; i < cartData.length; i++) {
      let singleProQuan = {
        productId: cartData[i].productId,
        quantityRequired: cartData[i].cartQuantity
      }
      proQuan.push(singleProQuan);
    }
    return proQuan;
  }
  const handleAddressSelected = async (item) => {
    // Handle actions after the address is selected
    console.log('Address selected:', selectedAddress);
    // You can perform additional actions here if needed
    setSelectedAddress(item);
    hideModal();
    setApiLoading(true)
    showCreatingOrderModal();
    const response = await makeApiRequest(
      'consumer/getUserProfile',
      'POST',
      config.serverNames.lightOne,
      completeObject,
      state?.userData?.userData
    );
    const listProductandQuantites = await listProductsFroApi();
    const TotalPrice = await calculateTotal()
    const bodyData = {
      userId: response.payload.userId,
      addresses: {
        addressId: "greatId",
        address: cartAddress.address,
        city: cartAddress.city,
        pin: cartAddress.pin,
        street: cartAddress.street,
      },
      orderSecretCode: config.secrets.orderFrontendSecret,
      totalAmountInRuppes: TotalPrice,
      productIdsAndQuantities: listProductandQuantites
    }
    console.log("body data ================================== 888888888888888888888 ++++++++++++ ", JSON.stringify(bodyData))
    await makeApiRequest("consumer/receiveOrder", "POST", config.serverNames.heavyOne, bodyData, state?.userData?.userData)
    setApiLoading(false)

  };
  const renderAddressSelectorModal = () => {
    return (
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.addressSelectorContainer}>
          <Text style={styles.addressLabel}>Select Delivery Address</Text>
          <FlatList
            data={cartAddress}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.addressItem}
                onPress={() => handleAddressSelected(item)}>
                <RadioButton
                  value={item.id}
                  status={
                    selectedAddress && selectedAddress.id === item.id
                      ? 'checked'
                      : 'unchecked'
                  }
                  onPress={() => handleAddressSelected(item)}
                  color="#4CAF50"
                />
                <Text style={styles.addressText}>
                  {item?.address}
                  {item?.street} {item?.city}, {item?.pin}
                </Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={hideModal} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Modal>
      </Portal>
    );
  };

  const renderOrderCreatingModal = () => {
    return (
      <Portal>
        <Modal
          visible={creatingOrderisible}
          onDismiss={hideCreatingOrderModal}
          contentContainerStyle={styles.addressSelectorContainer}>
          <Text style={styles.addressLabel}>Creating Order</Text>
          <TouchableOpacity onPress={hideCreatingOrderModal} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Modal>
      </Portal>
    );
  };

  useEffect(() => {
    // Check if there is a stored phone number and populate the state
    const getStoredPhoneNumber = async () => {
      try {
        const storedNumber = await AsyncStorage.getItem('phoneNumber');
        if (storedNumber) {
          setPhoneNumber(storedNumber);
        }
      } catch (error) {
        console.error('Error retrieving phone number:', error);
      }
    };

    getStoredPhoneNumber();
  }, []);
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const mobileNumber = '9477245638';
        let completeObject = {
          mobileNumber: phoneNumber,
        };

        try {
          const response = await makeApiRequest(
            'consumer/getUserProfile',
            'POST',
            config.serverNames.lightOne,
            completeObject,
            state?.userData?.userData,
          );
          console.log(response);
          let inputData = response?.payload?.cart;
          const simplifiedList = Object.keys(inputData).map(key => ({
            ...inputData[key],
            id: inputData[key].productId,
            name:
              inputData[key].name.charAt(0).toUpperCase() +
              inputData[key].name.slice(1),
            price: parseFloat(inputData[key].price),
            quantity: inputData[key].quantity,
          }));
          const addressesArray = Object.values(response?.payload?.addresses);
          setCartData(simplifiedList);
          setCartAddress(addressesArray);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData(); // Call the fetchData function when the screen is focused
    }, [state?.userData?.userData]),
  );

  console.log("cart data =======+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ ", cartData)
  const calculateTotal = async () => {
    return cartData?.reduce(
      (total, item) =>
        total + item.pricePerUnit * parseInt(item?.cartQuantity, 10),
      0,
    );
  };

  const fetchData = async () => {
    const mobileNumber = '9477245638';
    let completeObject = {
      mobileNumber: phoneNumber,
    };

    try {
      const response = await makeApiRequest(
        'consumer/getUserProfile',
        'POST',
        config.serverNames.lightOne,
        completeObject,
        state?.userData?.userData,
      );

      console.log(response);
      let inputData = response?.payload?.cart;
      const simplifiedList = Object.keys(inputData).map(key => ({
        ...inputData[key],
        id: inputData[key].productId,
        name:
          inputData[key].name.charAt(0).toUpperCase() +
          inputData[key].name.slice(1),
        price: parseFloat(inputData[key].price),
        quantity: inputData[key].quantity,
      }));
      const addressesArray = Object.values(response?.payload?.addresses);
      setCartData(simplifiedList);
      setCartAddress(addressesArray);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  const increaseQuantity = itemId => {
    let Body = {
      changeType: 'increase',
      itemId: itemId,
    };
    makeApiRequest(
      'consumer/changeCartItemQuantity',
      'POST',
      config.serverNames.lightOne,
      Body,
      state?.userData?.userData,
    ).then(response => {
      console.log(response);
      fetchData();
    });
    setCartData(prevCartData =>
      prevCartData.map(item =>
        item.productId === itemId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  };

  const decreaseQuantity = itemId => {
    let Body = {
      changeType: 'decrease',
      itemId: itemId,
    };
    makeApiRequest(
      'consumer/changeCartItemQuantity',
      'POST',
      config.serverNames.lightOne,
      Body,
      state?.userData?.userData,
    ).then(response => {
      console.log(state?.userData?.userData);
      fetchData();
    });
    setCartData(prevCartData =>
      prevCartData.map(item =>
        item.productId === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );
  };

  const deleteItem = itemId => {
    const mobileNumber = '9477245638';

    let completeObject = {
      itemId: itemId,
      mobileNumber: phoneNumber,
    };

    makeApiRequest(
      'consumer/removeItemFromCart',
      'POST',
      config.serverNames.lightOne,
      completeObject,
      state?.userData?.userData,
    ).then(response => {
      console.log(response);
    });
    setCartData(prevCartData =>
      prevCartData.filter(item => item.productId !== itemId),
    );
  };
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item?.images ? (
        <Image
          style={styles.itemImage}
          source={{ uri: item?.images[0] }} // Placeholder image, replace with actual URL
        />
      ) : (
        ''
      )}
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{item?.pricePerUnit?.toFixed(2)}</Text>
        <Text style={styles.total}>
          Total: ₹
          {(item?.pricePerUnit * parseInt(item?.cartQuantity, 10))?.toFixed(2)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => deleteItem(item.productId)}
        style={styles.deleteIconContainer}>
        <Icon name="trash-o" size={18} color="#ff4d4d" />
      </TouchableOpacity>
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => decreaseQuantity(item.productId)}>
          <Text style={styles.quantityButton}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.cartQuantity}</Text>
        <TouchableOpacity onPress={() => increaseQuantity(item.productId)}>
          <Text style={styles.quantityButton}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Items in Cart</Text>
      </View> */}
      <View>
        <CartHeader />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#4CAF50"
          style={styles.loadingIndicator}
        />
      ) : (
        <>

          {cartData?.length !== 0 ? (
            <View style={{ padding: 10 }}>
              <FlatList
                data={cartData}
                keyExtractor={item => item.productId}
                renderItem={renderItem}
                style={styles.flatList}
              />
            </View>
          ) : (
            <View
              style={{
                flex: 0.5,
                padding: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{ marginTop: 20, color: 'black', textAlign: 'center' }}>
                Your Cart is Empty!
              </Text>
              <LottieView
                style={styles.logo}
                source={require('../../assets/images/cart.json')}
                autoPlay
                loop
              />
            </View>
          )}
          <View style={{ paddingRight: 16, paddingLeft: 16 }}>
            <View style={styles.billContainer}>
              <Text style={styles.billLabel}>Bill Details</Text>
              <Text>Total Items: {cartData?.length}</Text>
              <Text>Total Amount: ₹{calculateTotal()}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => {
                showModal();
              }}>
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>

          {renderAddressSelectorModal()}
        </>
      )}
    </View>
  );
};





const styles = StyleSheet.create({

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  container: {
    flex: 1,
    paddingBottom: 16,
    backgroundColor: '#fff', // White background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 16,
    color: '#333',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff', // White background
    borderRadius: 12,
    padding: 12,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    elevation: 3,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemPrice: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  quantityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'gray',
    fontSize: 12,
  },
  quantity: {
    paddingHorizontal: 12,
    fontSize: 12,
    marginHorizontal: 6,
    color: '#333',
  },
  total: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 6,
    color: '#333',
  },
  deleteIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  flatList: {
    flexGrow: 0,
  },
  addressContainer: {
    backgroundColor: '#fff', // White background
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  billContainer: {
    backgroundColor: '#fff', // White background
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  billLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  checkoutButton: {
    backgroundColor: '#4CAF50', // Red color (you can change it to your preferred color)
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff', // White color
    fontWeight: 'bold',
    fontSize: 18,
  },

  addressSelectorContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  addressLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  cancelButton: {
    marginTop: 16,
    backgroundColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#555',
  },
  logo: {
    // fontSize: 24,
    width: 200,
    height: 200,
    alignItems: 'center',
  },
});

export default CartScreen;
