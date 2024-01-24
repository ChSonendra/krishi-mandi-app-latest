import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
const numColumns = 2
import { Card, Button, IconButton, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import CustomHeader from './customHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeApiRequest } from '../services/api';
import { store } from '../redux/store';
import { DrawerActions } from '@react-navigation/native';
import CategoryScreen from './category';
import ProductListingPage from './products';
import Swiper from 'react-native-swiper';
import Carousel from 'react-native-snap-carousel';
import { ScrollView } from 'react-native-gesture-handler';
const windowHeight = Dimensions.get('window').height;
const isLoaded = false;
const HomeScreen = ({ navigation, route }) => {
  const state = store.getState();
  // console.log(state);
  const [productQuantities, setProductQuantities] = useState({});
  const [selectedCategory, setSelectedCategory] = useState([])
  const [product, setProduct] = useState([]);
  const [searchTerm, setSearchTerm] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [categories, setCategories] = useState([
    { id: 1, name: 'Crops', color: 'orange', selected: false },
    { id: 2, name: 'Vegetable', color: 'green', selected: false },
    { id: 3, name: 'Fruit', color: '#4CAF50', selected: false },
    { id: 4, name: 'Dairy Products', color: 'lightblue', selected: false }
  ]);
  const [phoneNumber, setPhoneNumber] = useState('');

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
  useEffect(() => {
    getProducts({});
    fetchCartItems();
  }, [navigation]);
  const fetchData = async () => {
  
  };
  const fetchCartItems = async () => {
    // Fetch cart items from storage or API
    // For example, you can use AsyncStorage to get the cart items
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
      setCartItems(response?.payload?.cart);
      console.log(simplifiedList);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
 
  };
  const isProductInCart = (productId) => {
    return cartItems[productId] !== undefined;
  };
  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  const adjustQuantity = (productId, change) => {
    const inCart = isProductInCart(productId);
    if (inCart) {
      // Product is in the cart, navigate to the Cart screen
      navigation.navigate('Cart');
    } else {
    setProductQuantities({
      ...productQuantities,
      [productId]: (productQuantities[productId] || 0) + change,
    });
    let product = {
      ...productQuantities,
      [productId]: (productQuantities[productId] || 0) + change,
    };
    console.log(product);
    // Iterate through the quantityMap and retrieve product details
    for (const productId in product) {
      const quantity = product[productId];
      const productDetails = getProductDetails(productId, quantity);

      if (productDetails) {
        console.log(`Product ID: ${productId}, Quantity: ${quantity}`);
        console.log('Product Details:', productDetails);
        console.log('-----------------------------');
      
        let Body = {
          item: productDetails,
          mobileNumber: phoneNumber,
        };
        makeApiRequest(
          'consumer/addItemToCart',
          'POST',
          Body,
          state?.userData?.userData,
        ).then(response => {
          console.log(response.apiResponseData);
          // setProducts(response.apiResponseData);
        });
   
      } else {
        console.log(`Product with ID ${productId} not found.`);
      }
    }
    setCartItems({
      ...cartItems,
      [productId]: true,
    });
  }
  };
  const onSelectCategory = async (item) => {
    console.log("is item selected ", item.selected)
    setLoading(true)
    if (item.selected) {
      let newArray = []
      const updatedArray = categories.map(element => {
        if (element.name === item.name) {
          return { ...element, selected: false };
        }
        return element;
      });
      updatedArray.map(element => {
        if (element.selected === true) {
          newArray.push(element.name)
        }
      });
      console.log("newArray ====================", newArray)
      console.log("updated array", updatedArray)
      setCategories(updatedArray)
      await getProducts({ category: newArray })
    }
    else {
      let newArray = [];
      console.log("is it here means not selected")
      const updatedArray = categories.map(element => {
        if (element.name === item.name) {
          return { ...element, selected: true };
        }
        return element;
      });
      updatedArray.map(element => {
        if (element.selected === true) {
          newArray.push(element.name)
        }
      });
      console.log("newArray ====================", newArray)
      console.log("updated array", updatedArray)
      setCategories(updatedArray)
      await getProducts({ category: newArray })
    }
  }
  const getProducts = async (bodyData) => {
    let token = await AsyncStorage.getItem('token');
    const result = await makeApiRequest('consumer/getProducts', 'POST', bodyData, token)
    if (result.status) {
      console.log("size of products for bodydata", bodyData, " size ", result.payload.length)
      setProduct(result?.payload)
      setProducts(result?.payload)
      setLoading(false)
    }
    else {
      console.log("in else case i dont know what to do")
    }
  };
  const showProduct=(item)=>{
    navigation.navigate('Product', { item })
  }
  const renderProductItem = ({ item }) => (
    <TouchableOpacity style={styles1.productItem} onPress={() => showProduct(item)}>
      <Image source={{ uri: item.images[0] }} style={styles1.productImage} />
      <View style={styles1.productDetails}>
        <Text style={[styles1.productName, { color: "black" }]}>{item.name}</Text>
        <Text style={styles1.productPrice}>₹{`${item.pricePerUnit.toFixed(0)} / ${item.unit}`}</Text>
        <TouchableOpacity style={styles1.addButton} onPress={() =>   adjustQuantity(item.productId, 1)}>
        <Text style={[styles1.addButtonText, { justifyContent: "center", alignContent: "center", alignItems: "center", alignSelf: "center" }]}>
            {isProductInCart(item.productId) ? 'Go to Cart' : 'Add to Cart'}
          </Text>
          {/* <Text style={[styles1.addButtonText, { justifyContent: "center", alignContent: "center", alignItems: "center", alignSelf: "center" }]}>Add to Cart</Text> */}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
  
  const handleSearch = text => {
    setSearchTerm([]);
    const filteredData = product.filter(item =>
      item.name.toLowerCase().includes(text.toLowerCase()),
    );
    // console.log(filteredData);
    setSearchTerm(filteredData);
  };
  const images = [
    require('../../assets/images/Krishi.png'),
    require('../../assets/images/krishi2.jpeg'),

    // Add more image paths as needed
  ];

  const renderItem2 = ({ item }) => (
    <View style={styles.slide}>
      <Image source={item} style={styles.image} resizeMode="cover" />
    </View>
  );
  function getProductDetails(productId, quantity) {
    const product = products.find(item => item.productId === productId);
    if (product) {
      const {
        name,
        type,
        color,
        pricePerUnit:pricePerUnit,
        quantity: avai,
        about,
        images,
      } = product;

      return {
        productId: productId,
        name,
        type,
        color,
        pricePerUnit:pricePerUnit,
        quantity: quantity,
        about,
        images,
      };
    }

    return null;
  }
  return (
    <View style={styles.container}>
      <CustomHeader
        onSearch={handleSearch}
        onCart={() => navigation.navigate('Cart')}
        onMenu={() => openDrawer()}
      />

      <View style={{ height: 200 }}>
        <Carousel
          data={images}
          renderItem={renderItem2}
          sliderWidth={Dimensions.get('window').width}
          itemWidth={Dimensions.get('window').width}
          loop={true}
          autoplay={true}
          autoplayInterval={3000}
          showsButtons={false}
          showsPagination={false} // Hide pagination dots
        />
      </View>
      <View>
        <Animated.View style={styles2.container}>
          <Text style={styles2.title}></Text>
          <View style={{ flex: 1 }}>

          <FlatList
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles2.categoryCard, {
                  backgroundColor: item.color,
                  borderColor: item.selected ? 'blue' : 'transparent',
                  borderWidth: item.selected ? 3 : 0,
                }]}
                onPress={() => onSelectCategory(item)}
              >
                <Text style={styles2.categoryText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          </View>
        </Animated.View>
        {/* <Text style={styles.title}></Text> */}
      </View>

      {loading ? (
        <View style={{ marginTop: 60, alignContent: "center", justifyContent: "center", alignItems: "center" }}>
          <Text>Loading products</Text>
          <ActivityIndicator style={{ marginTop: 20 }} />
        </View>
      ) : (
        <View style={styles1.container}>
          { !(product.length > 0) ? (
            <Text style={{ marginTop: 20, marginBottom:20,color: 'black', alignContent:"center",alignItems:"center",alignSelf:"center"}}>
              No Products to show
            </Text>
          ) : (
            <View style={{ flex: 1 }}>
            <FlatList 
              data={product}
              keyExtractor={(item) => item._id}
              renderItem={renderProductItem}
              numColumns={numColumns}
              columnWrapperStyle={styles1.columnWrapper}
            />
            </View>
          )}

        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: -10,
    height: 200,
  },
  slide: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200, // Adjust the height as needed
    borderRadius: 20,
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'scroll',
  },
  card: {
    margin: 4,
    width: '100%',
    height: 130, // Adjust the card height as needed
  },
  cardContent: {
    flexDirection: 'row',
    height: '100%',
  },
  imageContainer: {
    flex: 1,
    height: 120,
    borderRadius: 60,
    // alignItems:'center'
  },
  detailsContainer: {
    flex: 2,
    padding: 1,
  },
  descriptionText: {
    maxHeight: 40, // Set a maximum height for the description text
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 2,
    fontSize: 18,
  },
  // Add more styles as needed
});

const { width } = Dimensions.get('window');
const itemWidth = (width - 32 - 16) / 2; // Adjusted based on padding and margin

const styles1 = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  addButton: {
    marginTop:5,
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  productItem: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 12,
    marginRight: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: itemWidth,
    height: 100,
  },
  productDetails: {
    flex: 1,
    padding: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 14,
    color: '#888888',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});

const styles2 = StyleSheet.create({
  container: {
    // flex: 1,
    alignItems: "center",
    padding: 2,
    height: 120, // Adjust the height as needed
  },
  title: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  categoryCard: {
    width: 80, // Adjust the width as needed
    height: 80, // Adjust the height as needed
    marginRight: 10,
    borderRadius: 40,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: 'white',
  },
});

export default HomeScreen;
