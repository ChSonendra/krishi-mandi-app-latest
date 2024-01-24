import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Button,
  TouchableHighlight,
} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import MapView, {Marker} from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome'; // You can choose any icon library you prefer
import {store} from '../redux/store';
import {makeApiRequest} from '../services/api';
import {useFocusEffect} from '@react-navigation/native';
import RazorpayCheckout from 'react-native-razorpay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Modal,
  List,
  Portal,
  RadioButton,
  ActivityIndicator,
} from 'react-native-paper';
import LottieView from 'lottie-react-native';
const CartScreen = ({navigation}) => {
  const state = store.getState();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [visible, setVisible] = useState(false);
  const [cartData, setCartData] = useState([]);
  const [cartAddress, setCartAddress] = useState([]);
  const [loading, setLoading] = useState(true);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const handleAddressSelection = address => {
    setSelectedAddress(address);
    hideModal();
  };
  const handleAddressSelected = item => {
    // Handle actions after the address is selected
    console.log('Address selected:', selectedAddress);
    // You can perform additional actions here if needed
    setSelectedAddress(item);
    // Proceed with the payment or any other steps
    handlePayment();
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
            renderItem={({item}) => (
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

  const calculateTotal = () => {
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
      Body,
      state?.userData?.userData,
    ).then(response => {
      console.log(response);
      fetchData();
    });
    setCartData(prevCartData =>
      prevCartData.map(item =>
        item.productId === itemId
          ? {...item, quantity: item.quantity + 1}
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
      Body,
      state?.userData?.userData,
    ).then(response => {
      console.log(state?.userData?.userData);
      fetchData();
    });
    setCartData(prevCartData =>
      prevCartData.map(item =>
        item.productId === itemId && item.quantity > 1
          ? {...item, quantity: item.quantity - 1}
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
      completeObject,
      state?.userData?.userData,
    ).then(response => {
      console.log(response);
    });
    setCartData(prevCartData =>
      prevCartData.filter(item => item.productId !== itemId),
    );
  };
  const renderItem = ({item}) => (
    <View style={styles.card}>
      {item?.images ? (
        <Image
          style={styles.itemImage}
          source={{uri: item?.images[0]}} // Placeholder image, replace with actual URL
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

  const handlePayment = () => {
    // if (!selectedAddress) {
    //   alert('Please select a delivery address.');
    //   return;
    // }
    var options = {
      description: 'Credits towards consultation',
      image: 'https://i.imgur.com/3g7nmJC.jpg',
      currency: 'INR',
      key: 'rzp_test_MTii2pjxumPAbE',
      amount: calculateTotal().toFixed(2) * 100,
      // amount:1000, // Replace with the actual amount in paise
      name: 'Krishi Mandi',
      // order_id: 'order_NGUbZHsmizyi8U',//Replace this with an order_id created using Orders API.
      prefill: {
        email: 'chaudhary.sonendra@gmail.com',
        contact: '9369318609',
        name: 'Ekarigari system private limited',
      },
      theme: {color: '#53a20e'},
    };
    RazorpayCheckout.open(options)
      .then(data => {
        // handle success
        // alert(`Success: ${data.razorpay_payment_id}`);
        navigation.navigate('Orders', {
          orderNumber: '123456',
          date: new Date(),
          totalAmount: calculateTotal().toFixed(2),
        });
      })
      .catch(error => {
        // handle failure
        alert(`Error: ${error.code} | ${error.description}`);
      });
  };

  return (
    <View style={styles.container}>
   <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-left" size={20} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}> Cart</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#4CAF50"
          style={styles.loadingIndicator}
        />
      ) : (
        <>
          {cartData?.length !== 0 ? (
            <FlatList
              data={cartData}
              keyExtractor={item => item.productId}
              renderItem={renderItem}
              style={styles.flatList}
            />
          ) : (
            <View
              style={{
                flex: 0.5,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{marginTop: 20, color: 'black', textAlign: 'center'}}>
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

          {renderAddressSelectorModal()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 22,
    left: 15,
    zIndex: 1,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff', // White background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft:16,
    color: '#333',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff', // White background
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
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
