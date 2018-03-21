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

function setupDataListener(userId) {
  firebase.database().ref('users/' + userId).on('value', (snapshot) => {
    const data = snapshot.val().data;
    console.log("New data: " + data);
  });
}

// Listen for authentication state to change.
firebase.auth().onAuthStateChanged((user) => {
  if (user != null) { 
    console.log(user.providerData[0])
    console.log('this is the user uri', user.providerData[0].uid)
    storeUserData(user, user.providerData[0])
    // firebase.database().ref('users/' + user.providerData.uid).set({
    //   data: user.providerData
    // });
    console.log("We are authenticated now!"); 
  }
  // Do other things
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
      firebase.auth().signInWithCredential(credential).catch((error) => {
        // Handle Errors here.
      });
      // Get the user's name using Facebook's Graph API
      const response = await fetch(
        `https://graph.facebook.com/me?access_token=${token}`)
        .then(success => {
          // console.log(success)
          // console.log(JSON.parse(success._bodyInit))
          const { name, id } = JSON.parse(success._bodyInit)
          console.log(id)
          

          const profileImage = fetch(`https://graph.facebook.com//v2.12/${id}/picture?type=normal`).then(res => {
            // console.log(res)
            this.setState({
              user: {
                name: name,
                id: id,
                image: res.url
              },
              isLoggedIn: true //change back to true!!!!!!!!!
            })      
          })
        })
        .catch(err => { console.log(err)})
      // console.log(response)
    }
  }

  logout = () => {
    console.log('Logging out...')
    this.setState({
      isLoggedIn: false
    })
  }

  render() {
    // console.log(this.state.user)
    if (this.state.isLoggedIn) {
      return <RootStackNavigator 
        screenProps={{
          user: this.state.user, 
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
