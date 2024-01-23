import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import {Card, IconButton, Button} from 'react-native-paper';
import CustomHeader from './customHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {makeApiRequest} from '../services/api';
import {store} from '../redux/store';
import {DrawerActions} from '@react-navigation/native';
import CategoryScreen from './category';
import { useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
const ProductListingPage = (props) => {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const navigation = useNavigation();
  const state = store.getState();
  const [productQuantities, setProductQuantities] = useState({});
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState(''); // Declare setSearchText
  const [categories, setCategories] = useState([
    { id: 1, name: 'Crops', color: 'orange', selected: false },
    { id: 2, name: 'Vegetable', color: 'green', selected: false },
    { id: 3, name: 'Fruit', color: '#4CAF50', selected: false },
    { id: 4, name: 'Dairy Products', color: 'lightblue', selected: false }
  ]);
  useEffect(() => {
    getProducts();
  }, []);

  const getProducts = () => {
    makeApiRequest(
      'consumer/getProducts',
      'POST',
      {},
      state?.userData?.userData,
    ).then(response => {
      setProducts(response.apiResponseData);
    });
  };

  const adjustQuantity = (productId, change) => {
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
          mobileNumber: '9477245638',
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
  };
  function getProductDetails(productId, quantity) {
    const product = products.find(item => item.productId === productId);

    if (product) {
      const {
        name,
        type,
        color,
        price,
        quantity: avai,
        quality,
        about,
        images,
      } = product;

      return {
        productId: productId,
        name,
        type,
        color,
        quality,
        price,
        quantity: quantity,
        about,
        images,
      };
    }

    return null;
  }
console.log(products);
const renderItem = ({ item }) => (
  <Card style={styles.card} onPress={() => navigation.navigate('Product', { item })}>
    <Image
      style={styles.image}
      source={{
        uri: item?.images
        // Replace this with the actual image source
      }}
      resizeMode="cover"
    />
    <Card.Content style={styles.detailsContainer}>
      <Text style={styles.title}>{item.name}</Text>
      <Text numberOfLines={1} style={styles.descriptionText}>
        {item.about}
      </Text>
      <Text style={styles.price}>Price: ₹{item.price}</Text>
      {/* Call adjustQuantity when Buy Button is pressed */}
      <Button
        mode="contained"
        compact
        onPress={() => {
          adjustQuantity(item.productId, 1); // Adjust quantity as needed
          handleBuy(item);
        }}
        style={styles.buyButton}
      >
        Buy
      </Button>
    </Card.Content>
  </Card>
);


  const handleSearch = text => {
    setSearchText(text);
  };

  const handleBuy = product => {
    // Implement your buy logic here
    console.log(`Buying ${product.name}`);
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
console.log(props?.search);
  return (
    <View style={styles.container}>
        <View>
        <Animated.View style={styles2.container}>
          <Text style={styles2.title}>Categories</Text>
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
        </Animated.View>
        <Text style={styles.title}>Products</Text>
      </View>
      <Text style={styles.title}>Products</Text>
      {/* <ScrollView style={styles.container}> */}

      <FlatList
        data={props?.search.length!==0?props?.search:products}
        renderItem={renderItem}
        keyExtractor={item => item.productId}
        numColumns={2}
        style={{flexGrow: 1, padding: 2}}
      />
      {/* </ScrollView> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'scroll',
  },
  card: {
    flexDirection: 'row',
    margin: 2,
    width: '48%',
    height: 220, // Increased height to accommodate content
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  descriptionText: {
    maxHeight: 40,
  },
  imageContainer: {
    width: '100%',
    height: '50%',
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    width: 200,
  },
  detailsContainer: {
    flex: 1,
    padding: 8,
  },
  title: {
    fontSize: 14, // Increased font size
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 12, // Increased font size
    //   marginBottom: 4,
  },
  price: {
    fontSize: 10, // Reduced font size
    marginTop: 2,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2, // Moved from marginBottom to marginTop
  },
  quantityText: {
    marginHorizontal: 1, // Reduced margin
    fontSize: 14, // Increased font size
  },
  buyButton: {
    margin: 8,
    color:'#4CAF50',
    // height:50,
    backgroundColor:'#4CAF50'
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
export default ProductListingPage;
