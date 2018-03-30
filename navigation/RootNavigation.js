import React, { Component } from 'react';
import { Notifications, Facebook, AppLoading } from 'expo';
import { Dimensions, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { Container, Header, Content, Thumbnail, Text, Button } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';

// Boilerplate Imports
import { StackNavigator } from 'react-navigation';
import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';

// Navigation Imports
import MainTabNavigator from './MainTabNavigator';
import HomeScreenNavigation from './HomeScreenNavigation';

// Debugging Console Log
console.disableYellowBox = true;

// Firebase Setup
import * as firebase from 'firebase';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBWlhoHRN3YtIamdrrdntfd03Y5TZHQTWs",
  authDomain: "gotchaapp-2018.firebaseapp.com",
  databaseURL: "https://gotchaapp-2018.firebaseio.com",
  storageBucket: "gotchaapp-2018.appspot.com"
};

// Initialize only once
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

// Listen for authentication state to change.
firebase.auth().onAuthStateChanged((user) => {
  if (user != null) { 
    console.log(user.providerData)
    const { displayName, email, phoneNumber, photoURL, providerId, uid } = user.providerData[0]
    
    let userRef = firebase.database().ref(`users/${uid}`)
    userRef.transaction(function(currentData) {
      if (currentData === null) {
        return { 
          name: { first: displayName.split(' ')[0] , last: displayName.split(' ')[1] },
          email: email,
          phoneNumber: phoneNumber,
          photoURL: photoURL,
          providerId: providerId,
          uid: uid,
          lastLogin: new Date().toString()
        }
      } else {
        console.log(`User ${displayName} already exists.`)
        return // Abort the transaction.
      }
    }, function(error, committed, snapshot) {
      if (error) {
        console.log('Transaction failed abnormally!', error)
      } else if (!committed) {
        console.log(`We aborted the transaction (because ${displayName} already exists).`)
        let lastLoginRef = firebase.database().ref(`users/${uid}/lastLogin`)
        lastLoginRef.transaction(function() {
          return new Date().toString()
        })
      } else {
        console.log(`User ${displayName} added!`)
      }
    })
    console.log("We are authenticated now!")
  }
})

const RootStackNavigator = StackNavigator(
  {
    Main: {
      // screen: MainTabNavigator,
      screen: HomeScreenNavigation,
    },
  },
  {
    headerMode: 'none',
    navigationOptions: () => ({
      headerTitleStyle: {
        fontWeight: 'normal'
      }
    })
  }
)

export default class RootNavigator extends React.Component {
  constructor() {
    super()
    this.state = {
      isLoggedIn: false,
      loading: true,
      user: null
    }
  }

  // 
  async componentWillMount() {
    await Expo.Font.loadAsync({
      Roboto: require('../node_modules/native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('../node_modules/native-base/Fonts/Roboto_medium.ttf'),
      Ionicons: require('@expo/vector-icons/fonts/Ionicons.ttf'),
    });
    this.setState({ loading: false });

  }

  componentDidMount() {
    this._notificationSubscription = this._registerForPushNotifications();
    
  }

  componentWillUnmount() {
    this._notificationSubscription && this._notificationSubscription.remove();
  }

  async logIn() {
    const { type, token } = await Facebook.logInWithReadPermissionsAsync('1302890223144184', {
        permissions: ['public_profile', 'email', 'user_friends'],
      });
    if (type === 'success') {
      // Build Firebase credential with the Facebook access token.
      const credential = firebase.auth.FacebookAuthProvider.credential(token);

      // Sign in with credential from the Facebook user.
      firebase.auth().signInWithCredential(credential)
      .then((success) => {
        console.log('sign in with credential is successful: ', success)
      })
      .catch((error) => {
        console.log(error)
      });

      // Get the user's id using Facebook's Graph API
      const response = await fetch(
        `https://graph.facebook.com/me?access_token=${token}`)
        .then(success => {
          const { name, id } = JSON.parse(success._bodyInit)
          let userRef = firebase.database().ref(`users/${id}`)
          let feedsRef = firebase.database().ref('feeds/')
          
          // Retrieve Global Feeds
          feedsRef.once('value', (snapshot) => {
            this.setState({
              feeds: snapshot.val()
            })
          })

          // Retrieve Logged In User Details
          userRef.once('value', (snapshot) => {
            this.setState({
              user: snapshot.val(),
              isLoggedIn: true
            })
          })

          // Listen and updated Global Feeds
          feedsRef.on('value', (snapshot) => {
            this.setState({
              feeds: snapshot.val()
            })
          })

          userRef.on('value', (snapshot) => {
            this.setState({
              user: snapshot.val()
            })
          }) 
        })
        .catch(err => { console.log(err)})
    }
  }

  logout = () => {
    console.log('Logging out...')
    firebase.auth().signOut()
    this.setState({
      isLoggedIn: false
    })
  }

  render() {
    if (this.state.isLoggedIn) {
      return <RootStackNavigator 
        screenProps={{
          user: this.state.user,
          feeds: this.state.feeds,
          logout: this.logout 
        }} />
    } else {
      if (this.state.loading) {
        return <AppLoading  />;
      }
      return (
      <Container >
        <Content 
          scrollEnabled={false} 
          contentContainerStyle={styles.loginPage} >
          <Thumbnail style={styles.logo} large source={require('../assets/images/gotcha-logo.png')} />
          <TouchableOpacity onPress={this.logIn.bind(this)} style={{paddingVertical: 25}} >
            <Button rounded disabled primary >
              <FontAwesome style={styles.fbLogo} name='facebook-official' />
              <Text uppercase={false} style={styles.fbButtonText} >Login with Facebook</Text>
            </Button>
          </TouchableOpacity>
        </Content>
      </Container>
      )
    }
  } 

  _registerForPushNotifications() {
    // Send our push token over to our backend so we can receive notifications
    // You can comment the following line out if you want to stop receiving
    // a notification every time you open the app. Check out the source
    // for this function in api/registerForPushNotificationsAsync.js
    registerForPushNotificationsAsync();

    // Watch for incoming notifications
    this._notificationSubscription = Notifications.addListener(this._handleNotification);
  }

  _handleNotification = ({ origin, data }) => {
    console.log(`Push notification ${origin} with data: ${JSON.stringify(data)}`);
  };
}

// StyleSheets
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBarUnderlay: {
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  loginPage: {
    alignItems: 'center', 
    backgroundColor: '#fa8700', // orangg
    height: Dimensions.get('screen').height,
    paddingVertical: Dimensions.get('screen').height/5
  },
  logo: {
    width: 125, height: 125
  },
  fbLogo: {
    fontSize: 20, 
    paddingLeft: 20, 
    color: 'white'
  },
  fbButtonText: {
    fontSize: 15
  }
});
