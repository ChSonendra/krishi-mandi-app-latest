import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const CartHeader = ({goBack}) => {
    return (
        <View style={styles.container}>
            <Text style={{fontWeight:'900',fontSize:18}}> Items in Cart</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        alignContent:'center',
        paddingHorizontal: 16,
        paddingVertical: 16, // Increased header height
        backgroundColor: '#4CAF50',
    },
    backButton: {
        position: 'absolute',
        top: 22,
        left: 15,
        zIndex: 1,
    },
    logo: {
        width: 80,
        height: 40, // Adjust the dimensions according to your logo
    },
    searchBox: {
        flex: 1,
        borderColor: 'transparent', // Remove border color
        borderWidth: 1,
        borderRadius: 5,
        color: '#000', // Change text color to black
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.5)', // Slightly transparent white background
    },
    iconContainer: {
        paddingHorizontal: 16,
    },
});

export default CartHeader;
