import { Notifications, Facebook, AppLoading } from 'expo';
import React from 'react';
import { Dimensions, TouchableOpacity } from 'react-native'
import { StackNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import HomeScreenNavigation from './HomeScreenNavigation';

// import LoginScreen from '../screens/LoginScreen'

import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';

import { Container, Header, Content, Thumbnail, Text, Button } from 'native-base';

import * as firebase from 'firebase';
console.disableYellowBox = true;

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBWlhoHRN3YtIamdrrdntfd03Y5TZHQTWs",
  authDomain: "gotchaapp-2018.firebaseapp.com",
  databaseURL: "https://gotchaapp-2018.firebaseio.com",
  storageBucket: "gotchaapp-2018.appspot.com"
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

function storeUserData(user, data) {
  if (user != null) {
    firebase.database().ref('users/' + user.providerData[0].uid).set({
      data: data
    }); 
  }
}

// let feedsData1 = {
//   userPoster: {
//     name: { first: 'Gotcha', last: null },
//     profileImage: 'http://res.cloudinary.com/eugeneyu/image/upload/v1521621258/gotcha-logo.png',
//   },
//   content: {
//     type: 'image',
//     title: 'Much Wow!',
//     data: 'http://res.cloudinary.com/eugeneyu/image/upload/v1521657919/dogefeed.png',
//     dated: new Date()
//   },
//   reactions: [],
//   readState: false
// }

// let feedsData2 = {
//   userPoster: {
//     name: { first: 'Gotcha', last: null },
//     profileImage: 'http://res.cloudinary.com/eugeneyu/image/upload/v1521621258/gotcha-logo.png',
//   },
//   content: {
//     type: 'image',
//     title: 'The cutest cat ever!',
//     data: 'http://kittenrescue.org/wp-content/uploads/2017/03/KittenRescue_KittenCareHandbook.jpg',
//     dated: new Date()
//   },
//   reactions: [],
//   readState: false
// }

// // Get a key for a new Feed.
// let newFeedKey1 = firebase.database().ref('feeds/').push().key;
// let newFeedKey2 = firebase.database().ref('feeds/').push().key;
// let updates = {};
// updates['feeds/' + newFeedKey1] = feedsData1;
// updates['feeds/' + newFeedKey2] = feedsData2
// firebase.database().ref().update(updates);


function setupDataListener(userId) {
  firebase.database().ref('users/' + userId).on('value', (snapshot) => {
    const data = snapshot.val().data;
    console.log("New data: " + data);
  });
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
          // feeds: [
          //   {
          //     userPoster: {
          //       name: { first: 'Gotcha', last: null },
          //       profileImage: 'http://res.cloudinary.com/eugeneyu/image/upload/v1521621258/gotcha-logo.png',
          //     },
          //     content: {
          //       type: 'image',
          //       title: 'Much Wow!',
          //       data: 'http://res.cloudinary.com/eugeneyu/image/upload/v1521657919/dogefeed.png',
          //       dated: new Date().toDateString()
          //     },
          //     reactions: [],
          //     readState: false
          //   },
          //   {
          //     userPoster: {
          //       name: { first: 'Gotcha', last: null },
          //       profileImage: 'http://res.cloudinary.com/eugeneyu/image/upload/v1521621258/gotcha-logo.png',
          //     },
          //     content: {
          //       type: 'image',
          //       title: 'The cutest cat ever!',
          //       data: 'http://kittenrescue.org/wp-content/uploads/2017/03/KittenRescue_KittenCareHandbook.jpg',
          //       dated: new Date().toDateString()
          //     },
          //     reactions: [],
          //     readState: false
          //   }
          // ],
          lastLogin: new Date().toString(),
        };
      } else {
        console.log(`User ${displayName} already exists.`);
        return; // Abort the transaction.
      }
    }, function(error, committed, snapshot) {
      if (error) {
        console.log('Transaction failed abnormally!', error);
      } else if (!committed) {
        console.log(`We aborted the transaction (because ${displayName} already exists).`);
        let lastLoginRef = firebase.database().ref(`users/${uid}/lastLogin`)
        lastLoginRef.transaction(function() {
          return new Date().toString()
        })
      } else {
        console.log(`User ${displayName} added!`);
      }
      // console.log(`${displayName}'s data: `, snapshot.val());
    })
    console.log("We are authenticated now!"); 
  }
});

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
        fontWeight: 'normal',
      },
    }),
  }
);

export default class RootNavigator extends React.Component {
  constructor() {
    super()
    this.state = {
      isLoggedIn: false,
      loading: true,
      user: null
    }
  }

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
    console.log('clicked fb')
    const { type, token } = await Facebook.logInWithReadPermissionsAsync('1302890223144184', {
        permissions: ['public_profile', 'email', 'user_friends'],
      });
    if (type === 'success') {
      // Build Firebase credential with the Facebook access token.
      const credential = firebase.auth.FacebookAuthProvider.credential(token);
      // console.log('credential', credential)
      // Sign in with credential from the Facebook user.
      firebase.auth().signInWithCredential(credential)
      .then((success) => {
        console.log('sign in with credential is successful: ', success)
        this.setState({
          isLoggedIn: true
        })
      })
      .catch((error) => {
        // Handle Errors here.
        console.log(error)
      });
      // Get the user's name using Facebook's Graph API
      const response = await fetch(
        `https://graph.facebook.com/me?access_token=${token}`)
        .then(success => {
          const { name, id } = JSON.parse(success._bodyInit)
          let userRef = firebase.database().ref(`users/${id}`)
          let feedsRef = firebase.database().ref('feeds/')

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
        return <AppLoading />;
      }
      return (
      <Container>
        <Content contentContainerStyle={{alignItems: 'center', backgroundColor: '#0678A5', height: Dimensions.get('screen').height }} >
          <Thumbnail square source={require('../assets/images/gotcha-logo.png')} />
          <Button block onPress={this.logIn.bind(this)} >
            <Text>Login with Facebook</Text>
          </Button>
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
