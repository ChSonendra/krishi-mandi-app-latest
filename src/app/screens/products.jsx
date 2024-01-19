import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Card, IconButton, Button } from 'react-native-paper';
import CustomHeader from './customHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeApiRequest } from '../services/api';
import { store } from '../redux/store';
import { DrawerActions } from '@react-navigation/native';
import CategoryScreen from './category';
import { useNavigation } from '@react-navigation/native';
const numColumns = 2
const ProductListingPage = (props) => {
  // const windowWidth = Dimensions.get('window').width;
  // const windowHeight = Dimensions.get('window').height;
  // const navigation = useNavigation();
  // const state = store.getState();
  // const [productQuantities, setProductQuantities] = useState({});
  // const [products, setProducts] = useState(props.products);
  // const [searchText, setSearchText] = useState(''); // Declare setSearchText
  console.log("great === ", props.product)
  // console.log(product)
  // useEffect(() => {
  //   getProducts();
  // }, []);

  // const getProducts = async () => {
  //   const result = await makeApiRequest(
  //     'consumer/getProducts',
  //     'POST',
  //     {})
  //   if (result.status) {
  //     console.log("haya haya", result.payload)
  //     setProducts(result.payload)
  //   }
  //   else {
  //     console.log("in else case i dont know what to do")
  //   }

  // };

  // const adjustQuantity = (productId, change) => {
  //   setProductQuantities({
  //     ...productQuantities,
  //     [productId]: (productQuantities[productId] || 0) + change,
  //   });
  //   let product = {
  //     ...productQuantities,
  //     [productId]: (productQuantities[productId] || 0) + change,
  //   };
  //   console.log(product);
  //   // Iterate through the quantityMap and retrieve product details
  //   for (const productId in product) {
  //     const quantity = product[productId];
  //     const productDetails = getProductDetails(productId, quantity);

  //     if (productDetails) {
  //       console.log(`Product ID: ${productId}, Quantity: ${quantity}`);
  //       console.log('Product Details:', productDetails);
  //       console.log('-----------------------------');

  //       let Body = {
  //         item: productDetails,
  //         mobileNumber: '9477245638',
  //       };
  //       makeApiRequest(
  //         'consumer/addItemToCart',
  //         'POST',
  //         Body,
  //         state?.userData?.userData,
  //       ).then(response => {
  //         console.log(response.apiResponseData);
  //         // setProducts(response.apiResponseData);
  //       });

  //     } else {
  //       console.log(`Product with ID ${productId} not found.`);
  //     }
  //   }
  // };
  // function getProductDetails(productId, quantity) {
  //   const product = products.find(item => item.productId === productId);

  //   if (product) {
  //     const {
  //       name,
  //       type,
  //       color,
  //       pricePerUnit,
  //       minQuantity: avai,
  //       about,
  //       images,
  //     } = product;

  //     return {
  //       productId: productId,
  //       name,
  //       type,
  //       color,
  //       quality,
  //       price,
  //       quantity: quantity,
  //       about,
  //       images,
  //     };
  //   }

  //   return null;
  // }
  // console.log(products);
  // const renderItem = ({ item }) => (

  //   // <Card style={styles.card} onPress={() => navigation.navigate('Product', { item })}>
  //   //   <Image
  //   //     style={styles.image}
  //   //     source={{
  //   //       uri: item?.images
  //   //       // Replace this with the actual image source
  //   //     }}
  //   //     resizeMode="cover"
  //   //   />
  //   //   <Card.Content style={styles.detailsContainer}>
  //   //     <Text style={styles.title}>{item.name}</Text>
  //   //     <Text numberOfLines={1} style={styles.descriptionText}>
  //   //       {item.about}
  //   //     </Text>
  //   //     <Text style={styles.price}>Price: ₹{item.price}</Text>
  //   //     {/* Call adjustQuantity when Buy Button is pressed */}
  //   //     <Button
  //   //       mode="contained"
  //   //       compact
  //   //       onPress={() => {
  //   //         adjustQuantity(item.productId, 1); // Adjust quantity as needed
  //   //         handleBuy(item);
  //   //       }}
  //   //       style={styles.buyButton}
  //   //     >
  //   //       Buy
  //   //     </Button>
  //   //   </Card.Content>
  //   // </Card>
  // );

  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{`$${item.pricePerUnit.toFixed(2)} per ${item.unit}`}</Text>
      </View>
    </View>
  );


  // const handleSearch = text => {
  //   setSearchText(text);
  // };

  // const handleBuy = product => {
  //   // Implement your buy logic here
  //   console.log(`Buying ${product.name}`);
  // };
  // console.log(props?.search);

  return (
    <View style={styles.container}>
      <FlatList nestedScrollEnabled
        data={product}
        keyExtractor={(item) => item._id}
        renderItem={renderProductItem}
        numColumns={numColumns}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     overflow: 'scroll',
//   },
//   card: {
//     flexDirection: 'row',
//     margin: 2,
//     width: '48%',
//     height: 220, // Increased height to accommodate content
//     borderRadius: 10,
//     overflow: 'hidden',
//     backgroundColor: 'white',
//   },
//   descriptionText: {
//     maxHeight: 40,
//   },
//   imageContainer: {
//     width: '100%',
//     height: '50%',
//     overflow: 'hidden',
//   },
//   image: {
//     flex: 1,
//     width: 200,
//   },
//   detailsContainer: {
//     flex: 1,
//     padding: 8,
//   },
//   title: {
//     fontSize: 14, // Increased font size
//     fontWeight: 'bold',
//     marginBottom: 4,
//   },
//   description: {
//     fontSize: 12, // Increased font size
//     //   marginBottom: 4,
//   },
//   price: {
//     fontSize: 10, // Reduced font size
//     marginTop: 2,
//     fontWeight: 'bold',
//   },
//   quantityContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 2, // Moved from marginBottom to marginTop
//   },
//   quantityText: {
//     marginHorizontal: 1, // Reduced margin
//     fontSize: 14, // Increased font size
//   },
//   buyButton: {
//     margin: 8,
//     color: '#4CAF50',
//     // height:50,
//     backgroundColor: '#4CAF50'
//   },
// });
const { width } = Dimensions.get('window');
const itemWidth = (width - 32 - 16) / 2; // Adjusted based on padding and margin

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
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

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#f0f0f0',
//   },
//   productItem: {
//     flexDirection: 'row',
//     backgroundColor: '#ffffff',
//     borderRadius: 8,
//     marginBottom: 12,
//     overflow: 'hidden',
//   },
//   productImage: {
//     width: 100,
//     height: 100,
//   },
//   productDetails: {
//     flex: 1,
//     padding: 10,
//   },
//   productName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   productPrice: {
//     fontSize: 14,
//     color: '#888888',
//   },
// });

export default ProductListingPage;
