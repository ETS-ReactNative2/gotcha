import React, { Component } from 'react'
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View, 
  Clipboard,
  Dimensions
} from 'react-native'
import { 
  WebBrowser, 
  AppLoading, 
  Constants, 
  Camera, 
  FileSystem, 
  Permissions 
} from 'expo'
import { 
  Ionicons, 
  FontAwesome, 
  Entypo, 
  Octicons 
} from '@expo/vector-icons'

// Native Base
import { 
  Container, 
  Content, 
  Card, 
  CardItem, 
  Thumbnail, 
  Header, 
  Title, 
  Button, 
  Left, 
  Right, 
  Body, 
  Icon, 
  Text, 
  Drawer, 
  Badge 
} from 'native-base'

// Modules
import Swiper from 'react-native-swiper'
import { StackNavigator } from 'react-navigation'

// Screens
import ViewContent from './ViewContent'
import SideBar from './SideBar'
import CameraExample from './CameraExample'

// Components
import FromClipboard from '../components/FromClipboard'

// Navigator Setup
const App = StackNavigator({
  ViewContent: { screen: ViewContent}
})

class HomeScreen extends Component {
  constructor() {
    super() 
    this.state = {
      loading: true
    }
  }

  async componentWillMount() {
    await Expo.Font.loadAsync({
      Arial: require('../assets/fonts/Arial.ttf'),
      Roboto: require('../node_modules/native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('../node_modules/native-base/Fonts/Roboto_medium.ttf'),
      Ionicons: require('@expo/vector-icons/fonts/Ionicons.ttf'),
      Priscillia: require('../assets/fonts/Priscillia.ttf')
    })
    this.setState({ loading: false })
  }

  async _getContent() { 
    const content = await Clipboard.getString();
    console.log('content:', content)
    if (content) {
      this.setState({
        clipboard: content
      })
    }
  }

  closeDrawer = () => {
    this.drawer._root.close()
  }

  openDrawer = () => {
    this.drawer._root.open()
  }

  static navigationOptions = {
    header: null,
  }

  scrollToTop = () => {
    console.log('scrolling')
    
    // this.refs['scrollFeeds'].scrollTo({y: 0, x: 0, animated: true}, 0, true)
    this.refs['scrollFeeds'].scrollTo({y: 0})
    // this.scrollFeeds.scrollTo({y: 0})
  }

   timeConversion = (millisec) => {
    let seconds = Number(millisec / 1000)
    let minutes = Number(millisec / (1000 * 60))
    let hours = Number(millisec / (1000 * 60 * 60))
    let days = Number(millisec / (1000 * 60 * 60 * 24))

    if (seconds < 60) {
      if (Math.round(seconds) === 1 ) return "1 sec ago"
        return Math.round(seconds) + " secs ago"
    } else if (minutes < 60) {
        if (Math.round(minutes) === 1 ) return "1 min ago"
        return Math.round(minutes) + " mins ago"
    } else if (hours < 24) {
        if (Math.round(hours) === 1 ) return "1 hr ago"
        return Math.round(hours) + " hrs ago"
    } else {
      if (Math.round(days) === 1 ) return "1 day ago"
        return Math.round(days) + " days ago"
    }
}

  render() { 
    const { name, uid, image } = this.props.screenProps.user
    const logout  = this.props.screenProps.logout
    // const { feeds } = this.props.screenProps.user

    const globalfeeds = this.props.screenProps.feeds
    let feedsMap = new Map(Object.entries(globalfeeds))
    // let feedsKeyMap = new Map(Object.keys(globalfeeds))
    
    let feedsKeyArray = [...feedsMap.entries()] 
    let feedsArray = [...feedsMap.values()]
    // console.log(feedsKeyArray)
    
    let feedKeys = feedsKeyArray.map(feedArray => {
      return feedArray[0]
    })
    feedKeys.reverse()
    feedsArray.reverse()
    // console.log(feedKeys)
    // console.log(feedsArray)
    // console.log('globalfeeds', globalfeeds)
    let feedsJSX = feedsArray.map((feed, i) => {
      const hasReaction = feed.reactions
      let timeDiff = this.timeConversion(new Date() - new Date(feed.content.dated))
      
      // console.log(timeDiff)
      return (
        <Card key={feedKeys[i]} >
          <CardItem>
            <Left>
              <Thumbnail source={{ uri: feed.userPoster.profileImage}} />
              <Body>
                <Text>{feed.content.title}</Text>
                <Text note>{feed.userPoster.name.first} {feed.userPoster.name.last}</Text>
              </Body>
            </Left>
          </CardItem>
          <TouchableOpacity 
                onPress={() => {
                  this.props.navigation.navigate('ViewContent', {
                    headline: feed.content.title,
                    type: feed.content.type,
                    media: feed.content.data,
                    index: i,
                    feedUid: feedKeys[i]
                  })
                }} >
          <CardItem cardBody >
            <Image 
              source={{uri: feed.content.data}}
              style={{ height: Dimensions.get('screen').height/3, flex: 1 }}
              blurRadius={this.state.pressStatus? 0 : Platform.OS === 'ios' ? 70 : 10}
            />
          </CardItem>
          </TouchableOpacity>
          <CardItem>
            <Left >
              <TouchableOpacity
                disabled={!feed.reactions}
                onPress={() => {
                  this.props.navigation.navigate('ViewReactions', {
                    reactions: feed.reactions,
                    index: i
                  })
                }} >
                <Button disabled transparent style={{ paddingVertical: 5 }} >
                  <Octicons 
                    style={feed.reactions 
                      ? {fontSize: 30, textAlign: 'center', color: 'black' }
                      : {fontSize: 30, textAlign: 'center', color: 'lightgrey' }} 
                    name='smiley' 
                  />
                  {feed.reactions && (
                    <Badge style={{top: -5, left: -10, width: 23, height: 23, zIndex: 10}}>
                      <Text style={{fontSize: 12}} >{Object.keys(feed.reactions).length}</Text>
                    </Badge>) 
                  }
                </Button>
              </TouchableOpacity>
            </Left>
            <Body >
              {/* <TouchableOpacity 
                onPress={() => {
                  this.props.navigation.navigate('ViewContent', {
                    headline: feed.content.title,
                    type: feed.content.type,
                    media: feed.content.data,
                    index: i,
                    feedUid: feedKeys[i]
                  })
                }} >
                <Button disabled transparent 
                  style={{justifyContent: 'center' }}>
                  <FontAwesome style={{fontSize: 50, left: 8}} name='eye'/>
                </Button>
              </TouchableOpacity> */}
            </Body>
            <Right style={{flex: 0.5}} >
              <Text style={{ fontSize: 12, alignContent: 'center', left: 1 }} >{timeDiff}</Text>
            </Right>
          </CardItem>
        </Card>
      )
    })

    if (this.state.loading) {
      return <AppLoading />;
    }
    return (
      <Drawer
        ref={(ref) => { this.drawer = ref; }}
        content={<SideBar user={this.props.screenProps.user} logout={this.props.screenProps.logout}/>}
        onClose={() => this.closeDrawer()} >
        <Swiper 
          style={{backgroundColor: 'transparent'}}
          loadMinimal={true}
          loadMinimalSize={0}
          showsButtons={false}
          loop={false}
          showsPagination={false} >
          <View style={styles.slide1}>
            <Container>
              <Header hasSegment style={{ backgroundColor: '#fa8700' }} >
                <Left >
                  <Button style={{zIndex: 2}} transparent onPress={this.openDrawer} >
                    <Entypo style={{fontSize: 30, color: 'white'}} name='menu' />
                  </Button>
                </Left >
                <Body style={{alignItems: 'center', backgroundColor: 'transparent'}}>
                  <Image resizeMode='contain' style={{height: 31}} source={require('../assets/images/gotcha-h-logo.png')} />
                </Body> 
                <Right />
              </Header>
              <Content>
                <ScrollView onco style={styles.container} ref={self => { this.scrollFeeds = self }} >
                  {feedsJSX}
                </ScrollView>
              </Content>
            </Container>
          </View>
        <View style={styles.slide2}>
          <CameraExample user={this.props.screenProps.user}/>
        </View>
      </Swiper>
    </Drawer>

    );
  }
}

export default HomeScreen

const styles = StyleSheet.create({
  slide1: {
    flex: 1,
  },
  slide2: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',

    // marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 20,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  navigationFilename: {
    marginTop: 5,
  }
});
