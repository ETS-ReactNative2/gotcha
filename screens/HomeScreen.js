import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Clipboard,
  Dimensions
} from 'react-native';
import { WebBrowser, AppLoading } from 'expo';
import { Constants, Camera, FileSystem, Permissions } from 'expo';

import { Ionicons, FontAwesome, Entypo } from '@expo/vector-icons';

import { Container, Content, Card, CardItem, Thumbnail, Header, Title, Button, Left, Right, Body, Icon, Text, Drawer } from 'native-base';
import { MonoText } from '../components/StyledText';
import FromClipboard from '../components/FromClipboard'

import { StackNavigator } from 'react-navigation';
import ViewContent from './ViewContent'
import SideBar from './SideBar'

import Swiper from 'react-native-swiper';


const App = StackNavigator({
  ViewContent: { screen: ViewContent}
})
export default class HomeScreen extends React.Component {
  constructor() {
    super() 
    this.state = {
      clipboard: 'testing123',
      feeds: [
        {
          userPoster: {
            name: 'Gotcha',
            profileImage: 'http://res.cloudinary.com/eugeneyu/image/upload/v1521621258/gotcha-logo.png',
          },
          content: {
            type: 'image',
            title: 'The cutest cat ever!',
            data: 'http://kittenrescue.org/wp-content/uploads/2017/03/KittenRescue_KittenCareHandbook.jpg',
            dated: 'March 19'
          },
          readState: false
        }
      ],
      loading: true
    };
  }

  async componentWillMount() {
    await Expo.Font.loadAsync({
      Arial: require('../assets/fonts/Arial.ttf'),
      Roboto: require('../node_modules/native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('../node_modules/native-base/Fonts/Roboto_medium.ttf'),
      Ionicons: require('@expo/vector-icons/fonts/Ionicons.ttf'),
    });
    this.setState({ loading: false });
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

  render() { 
    const { name, id, image } = this.props.screenProps.user
    console.log(name, id, image)
    const logout  = this.props.screenProps.logout
    console.log(logout)
    const { feeds } = this.state
    let feedsJSX = feeds.map((feed, i) => {
      console.log(feed.content) 
      return (
        <Card key={i} >
          <CardItem>
            <Left>
              <Thumbnail source={{ uri: feed.userPoster.profileImage}} />
              <Body>
                <Text>{feed.content.title}</Text>
                <Text note>{feed.userPoster.name}</Text>
              </Body>
            </Left>
          </CardItem>
          <CardItem cardBody>
            {/* <Image source={require('../assets/images/image-placeholder.jpg')} style={{height: 200, width: null, flex: 1}}/> */}
            <Image 
                source={{uri: feed.content.data}}
                style={{height: Dimensions.get('screen').height/3, width: null , flex: 1}}
                blurRadius={this.state.pressStatus? 0 : Platform.OS === 'ios' ? 70 : 10}
              />
          </CardItem>
          <CardItem>
            <Left >
              <Button transparent >
                <FontAwesome style={{fontSize: 25, textAlign: 'center'}} name='close'/>
              </Button>
            </Left>
            <Body >
              <Button transparent onPress={() => {
                this.props.navigation.navigate('ViewContent', {
                  headline: feed.content.title,
                  type: feed.content.title.type,
                  media: feed.content.data,
                })
              }}
                style={{justifyContent: 'center'}}>
                <FontAwesome style={{fontSize: 50}} name='eye'/>
              </Button>
            </Body>
            <Right>
              <Text>{feed.content.dated}</Text>
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
          showsButtons={false}
          loop={false}
          showsPagination={false} >
          <View style={styles.slide1}>
            <Container>
              <Header hasSegment>
                <Left >
                  <Button onPress={this.openDrawer} >
                    <Entypo 
                      style={{fontSize: 25, color: 'white'}} 
                      name='menu' />
                  </Button>
                </Left >
                <Body style={{alignItems: 'center'}}>
                  <Title>Gotcha</Title>
                </Body>
                <Right />
              </Header>
              <Content>
                <ScrollView style={styles.container}>
                  {feedsJSX}
                </ScrollView>
              </Content>
            </Container>
          </View>
        <View style={styles.slide2}>
          <Text style={styles.text}>Beautiful</Text>
        </View>
      </Swiper>
    </Drawer>

    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
  },
  slide1: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: '#9DD6EB',
  },
  slide2: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: '#97CAE5',
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
