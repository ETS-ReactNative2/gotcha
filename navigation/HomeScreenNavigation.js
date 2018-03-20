import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import ViewContent from '../screens/ViewContent';
import { StackNavigator } from 'react-navigation';

const HomeScreenNavigator = StackNavigator(
  {
    HomeScreen: {
      screen: HomeScreen,
    },
    ViewContent: {
      screen: ViewContent
    }
  },
  {
    headerMode: 'none',
    navigationOptions: () => ({
      headerTitleStyle: {
        top: 0,
        fontWeight: 'normal',
        lineHeight: 10,
        zIndex: 2
      },
    }),
  }
);

export default class HomeScreenNavigation extends React.Component {
  render() {
    // console.log(this.props)
    return <HomeScreenNavigator screenProps={this.props.screenProps } />;
  }
}