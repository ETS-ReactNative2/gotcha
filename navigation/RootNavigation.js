import { Notifications, Facebook } from 'expo';
import React from 'react';
import { Dimensions, TouchableOpacity } from 'react-native'
import { StackNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
// import LoginScreen from '../screens/LoginScreen'

import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';

import { Container, Header, Content, Thumbnail, Text, Button } from 'native-base';


const RootStackNavigator = StackNavigator(
  {
    Main: {
      screen: MainTabNavigator,
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
      // Get the user's name using Facebook's Graph API
      const response = await fetch(
        `https://graph.facebook.com/me?access_token=${token}`)
        .then(success => {
          // console.log(success)
          // console.log(JSON.parse(success._bodyInit))
          const { name, id } = JSON.parse(success._bodyInit)
          console.log(id)
          const profileImage = fetch(`https://graph.facebook.com//v2.12/${id}/picture?type=normal`).then(res => {
            console.log(res)
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

  render() {
    // console.log(this.state.user)
    if (this.state.isLoggedIn) {
      return <RootStackNavigator screenProps={{user: this.state.user}} />;
    } else {
      if (this.state.loading) {
        return <Expo.AppLoading />;
      }
      return (
      <Container>
        <Content contentContainerStyle={{alignItems: 'center', backgroundColor: '#0678A5', height: Dimensions.get('screen').height }} >
          <Thumbnail square source={require('../assets/images/icon.png')} />
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
