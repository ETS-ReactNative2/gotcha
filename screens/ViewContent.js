import React from 'react';
import { ScrollView, StyleSheet, View, Image, TouchableOpacity, CameraRoll, Platform } from 'react-native';
import { Text, Container, Content, Card, CardItem, Thumbnail, Header, Title, Button, Left, Right, Body, Icon, Footer, FooterTab } from 'native-base';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

import { Constants, FileSystem, Camera, Permissions } from 'expo'

export default class ViewContent extends React.Component {
  constructor() {
    super()
    this.state = {
      loading: true,
      pressStatus: false,
      hasCameraPermission: null,
      type: Camera.Constants.Type.front,
      photoId: 1,
      photos: [],
    }
  }

  static navigationOptions = {
    title: 'View Contents',
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    await Expo.Font.loadAsync({
      Roboto: require('../node_modules/native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('../node_modules/native-base/Fonts/Roboto_medium.ttf'),
      Ionicons: require('@expo/vector-icons/fonts/Ionicons.ttf'),
    })
    this.setState({
      loading: false,
      hasCameraPermission: status === 'granted'
    })
  }

  componentDidMount() {
    FileSystem.makeDirectoryAsync(
      // FileSystem.documentDirectory + 'photos', {
      FileSystem.documentDirectory + 'photos').catch(e => {
      console.log(e, 'Directory exists');
    });
  }

  async takePicture() {
    // console.log(this.camera)
    if (this.camera) {
      let photo = await this.camera.takePictureAsync()
      console.log(photo)
      this.camera.takePictureAsync().then(data => {
        console.log("took the photo...")
        FileSystem.moveAsync({
          from: data.uri,
          // to: `${FileSystem.documentDirectory}photos/Photo_${this.state.photoId}.jpg`,
          to: `${FileSystem.documentDirectory}photos/Photo_${this.state.photoId}.jpg`,
        }).then(() => {
          // console.log("moved the photo...")
          this.setState({
            photoId: this.state.photoId + 1,
            photos: this.state.photos.concat(`${FileSystem.documentDirectory}photos/Photo_${this.state.photoId}.jpg`)
          });
        }).catch((err) => {console.log(err)})
      }).catch(err => {
        console.log(err)
      })
    }
  };

  onSaveImage = (tag) => {
    CameraRoll.saveToCameraRoll(tag).then(response => {
      console.log(response)
    }).catch(err => {
      console.log(err)
    })
  }

  onDelete = () => {
    this.state.photos.forEach(uri => {
      console.log(`Deleted ${uri}...`)
      FileSystem.deleteAsync(uri).then(success=> {
        console.log(success)
      }).catch(err => {
        console.log(err)
      })
    })
    this.setState({photos : []})
  }

  async onPressHold() {
    this.setState({
      pressStatus: true
    })
    // this.takePicture()
    // this.snapshots = setInterval(this.takePicture, 1000);
    this.snapshots = setInterval(this.takePicture.bind(this), 700);
  }
  
  async onPressRelease() {
    this.setState({
      pressStatus: false
    })
    clearInterval(this.snapshots)
    this.snapshots = false 
  }

  render() {
    const { hasCameraPermission } = this.state;
    console.log(this.state.pressStatus)
    // console.log(hasCameraPermission)
    /* 2. Read the params from the navigation state */
    const { params } = this.props.navigation.state;
    const type = params ? params.type : null;
    const media = params ? params.media : null;
    const headline = params ? params.headline : null;
    console.log("hello from View Contents")
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
          <Container>
            <Header>
              <Left>
                <Button transparent onPress={() => this.props.navigation.goBack()}>
                  <Icon name='arrow-back'/>
                </Button>
              </Left>
              <Body style={{flex: 3}}>
                <Title>{headline}</Title>
              </Body>
              <Right />
            </Header>
            <Content>
              <View style={styles.container}>
                <ScrollView>
                  <Image 
                    source={{uri: media}}
                    style={{height: 200, width: null, flex: 1}}
                    blurRadius={this.state.pressStatus? 0 : Platform.OS === 'ios' ? 70 : 10}
                  />
                  <View 
                    style={{ 
                      flex: 1,
                      backgroundColor: 'transparent',
                      flexDirection: 'row',
                      flexWrap: 'wrap' }}>
                    {this.state.photos.map(photo => {
                      return (
                      <TouchableOpacity key={photo} onPress={() => { this.onSaveImage(photo) }}>
                        <Image 
                          source={{uri: photo }} 
                          style={{height: 50, width: 50}}
                        />
                      </TouchableOpacity>
                      )
                    })}
                    <View>
                      <Camera
                        ref={self => { this.camera = self }}
                        style={{ flex: 1, height: null, width: null, alignSelf: 'center' }}
                        type={this.state.type} />
                    </View>
                  </View>
                </ScrollView>
              </View>
            </Content>
            <Footer style={{backgroundColor: 'transparent'}} >
              <FooterTab style={{backgroundColor: 'transparent'}} >
                <Button transparent disabled style={{backgroundColor: 'transparent'}} />
                <Button
                  transparent
                  onPressIn={this.onPressHold.bind(this)}
                  onPressOut={this.onPressRelease.bind(this)}>
                  <MaterialIcons style={{fontSize: 50}} name='camera'/>
                </Button>
                <Button
                  transparent
                  onPress={this.onDelete}>
                  <MaterialIcons style={{fontSize: 25}} name='delete'/>
                </Button>
              </FooterTab>
            </Footer>
          </Container>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
