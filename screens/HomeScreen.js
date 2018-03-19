import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Clipboard
} from 'react-native';
import { WebBrowser } from 'expo';
import { Constants, Camera, FileSystem, Permissions, Svg } from 'expo';

import { Ionicons, FontAwesome } from '@expo/vector-icons';

import { Container, Content, Card, CardItem, Thumbnail, Header, Title, Button, Left, Right, Body, Icon, Text } from 'native-base';
import { MonoText } from '../components/StyledText';
import FromClipboard from '../components/FromClipboard'

const imagePlaceholder = require('../assets/images/image-placeholder.jpg')

import { StackNavigator } from 'react-navigation';
import ViewContent from './ViewContent'

const App = StackNavigator({
  ViewContent: { screen: ViewContent}
})
export default class HomeScreen extends React.Component {
  constructor() {
    super() 
    this.state = {
      clipboard: 'testing123',
      loading: true
    };
  }

  async componentWillMount() {
    await Expo.Font.loadAsync({
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

  static navigationOptions = {
    header: null,
  };

  render() { 
    if (this.state.loading) {
      return <Expo.AppLoading />;
    }
    return (
      // <View style={styles.container}>
      <Container>
        <Header hasSegment>
          <Left />
          <Body style={{alignItems: 'center'}}>
            <Title>Gotcha</Title>
          </Body>
          <Right />
        </Header>
        <Content>
          <ScrollView style={styles.container}>
            <Card>
              <CardItem>
                <Left>
                  <Thumbnail source={{ uri: 'https://scontent.fyvr4-1.fna.fbcdn.net/v/t1.0-1/p240x240/10984308_10152809530953375_2703448129335287047_n.jpg?oh=8fa73fade43f74d7e10f15dd73662450&oe=5B39DB7D'}} />
                  <Body>
                    <Text>The cutest cat ever!</Text>
                    <Text note>Eugene</Text>
                  </Body>
                </Left>
              </CardItem>
              <CardItem cardBody>
                {/* <Svg height={200} >
                  {imagePlaceholder}
                </Svg> */}
                <Image source={require('../assets/images/image-placeholder.jpg')} style={{height: 200, width: null, flex: 1}}/>
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
                      headline: 'The cutest cat ever!',
                      type: 'image',
                      media: 'http://kittenrescue.org/wp-content/uploads/2017/03/KittenRescue_KittenCareHandbook.jpg',
                    })
                  }}
                    style={{justifyContent: 'center'}}>
                    <FontAwesome style={{fontSize: 50}} name='eye'/>
                  </Button>
                </Body>
                <Right>
                  <Text>? hrs ago</Text>
                </Right>
              </CardItem>
            </Card>
            <View style={styles.getStartedContainer}>
              {/* <TouchableOpacity
                // style={[{ flex: 0.3, alignSelf: 'flex-end' }]}
                onPress={this._getContent.bind(this)}>
                <Ionicons name="ios-radio-button-on-outline" size={32} color="green" />
              </TouchableOpacity> */}
              {/* <FromClipboard clipboard={this.state.clipboard} /> */}
            </View>


          </ScrollView>
        </Content>
      </Container>
       /* </View> */
    );
  }
}

const styles = StyleSheet.create({
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
