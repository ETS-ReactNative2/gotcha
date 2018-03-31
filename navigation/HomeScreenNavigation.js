import React, { Component } from 'react'
import HomeScreen from '../screens/HomeScreen'
import ViewContent from '../screens/ViewContent'
import ViewReactions from '../screens/ViewReactions'
import { StackNavigator } from 'react-navigation'

const HomeScreenNavigator = StackNavigator(
  {
    HomeScreen: {
      screen: HomeScreen,
    },
    ViewContent: {
      screen: ViewContent
    },
    ViewReactions: {
      screen: ViewReactions
    }
  },
  {
    headerMode: 'none'
  }
)

class HomeScreenNavigation extends Component {
  render() {
    return <HomeScreenNavigator screenProps={this.props.screenProps } />
  }
}

export default HomeScreenNavigation