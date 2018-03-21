import React from 'react';
import { ScrollView, StyleSheet, View, Image, TouchableOpacity, TouchableHighlight,  CameraRoll, Platform, Dimensions, Modal } from 'react-native';
import { Text, Container, Content, Card, CardItem, Thumbnail, Header, Title, Button, Left, Right, Body, Icon, Footer, FooterTab } from 'native-base';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

import { Constants, FileSystem, Camera, Permissions, ImageManipulator } from 'expo'

import * as firebase from 'firebase'
// import FirebaseStorage from 'firebase'

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


// Get the data from an ImageView as bytes
// imageView.setDrawingCacheEnabled(true);
// imageView.buildDrawingCache();
// Bitmap bitmap = imageView.getDrawingCache();
// ByteArrayOutputStream baos = new ByteArrayOutputStream();
// bitmap.compress(Bitmap.CompressFormat.JPEG, 100, baos);
// byte[] data = baos.toByteArray();

// let storage = firebase.storage()
// console.log('Hello')
// console.log(storage.ref('images/wink.png'))


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
      modalVisible: false,
      modalUri: null
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
      FileSystem.documentDirectory + 'photos').catch(e => {
      console.log(e, 'Directory exists');
    });
  }

  async componentWillUnmount() {
    await FileSystem.deleteAsync(`${FileSystem.documentDirectory}photos`).then(success=> {
      console.log(`Deleted the folder!!`)
    }).catch(err => {
      console.log(err)
    })
    // let allFiles = await FileSystem.readDirectoryAsync(`${FileSystem.documentDirectory}photos`).then(directoryContents => {
    //   console.log(directoryContents)
    //   directoryContents.forEach(filename => {
    //     // console.log(filename)
    //     FileSystem.deleteAsync(`${FileSystem.documentDirectory}photos/${filename}`).then(success=> {
    //       console.log(`Deleted ${filename}...`)
    //     }).catch(err => {
    //       console.log(err)
    //     })
    //   })
    // }).catch(err => {
    //   console.log(err)
    // })
  }

  async takePicture() {
    if (this.camera) {
      this.camera.takePictureAsync({ base64: true }).then(data => {
        console.log("took the photo...")
        console.log(data.uri)
        this.setState({
          photoId: this.state.photoId + 1,
          photos: this.state.photos.concat(data.uri)
        })
        // FileSystem.moveAsync({
        //   from: data.uri,
        //   to: `${FileSystem.documentDirectory}photos/Photo_${this.state.photoId}.jpg`,
        // }).then(() => {
        //   this.setState({
        //     photoId: this.state.photoId + 1,
        //     photos: this.state.photos.concat(`${FileSystem.documentDirectory}photos/Photo_${this.state.photoId}.jpg`)
        //   });
        // }).catch((err) => {console.log(err)})
      }).catch(err => {
        console.log(err)
      })
    }
  };

  onSaveImage = (photoUri) => {
    CameraRoll.saveToCameraRoll(photoUri).then(response => {
      console.log(response)
    }).catch(err => {
      console.log(err)
    })
  }

  async onDelete() {
    console.log('Deleting temp photos...')
    // let allFiles = await FileSystem.readDirectoryAsync(`${FileSystem.documentDirectory}photos`).then(directoryContents => {
    //   console.log(directoryContents)
    //   directoryContents.forEach(filename => {
    //     // console.log(filename)
    //     FileSystem.deleteAsync(`${FileSystem.documentDirectory}photos/${filename}`).then(success=> {
    //       console.log(`Deleted ${filename}...`)
    //     }).catch(err => {
    //       console.log(err)
    //     })
    //   })
    // }).catch(err => {
    //   console.log(err)
    // })
    this.setState({
      photoId: 0,
      photos: [] 
    })
  }

  async onPressHold() {
    this.setState({
      pressStatus: true
    })
    this.snapshots = setInterval(this.takePicture.bind(this), 500);
  }
  
  async onPressRelease() {
    this.setState({
      pressStatus: false
    })
    clearInterval(this.snapshots)
    this.snapshots = false 
  }

 


  onSend = async (uri) => {
    console.log(uri)
    const base64Image = await ImageManipulator.manipulate(uri, [{resize: {width: 500}}], {format: 'jpeg', base64: true}).then(success => {
      let base64Img = `data:image/jpeg;base64,${success.base64}`
      let apiUrl = 'https://api.cloudinary.com/v1_1/eugeneyu/image/upload'

      let data = {
        "file": base64Img,
        "upload_preset": "tn0itef2",
      }
      //Working Fetch!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      fetch(apiUrl, {
        body: JSON.stringify(data),
        headers: {
          'content-type': 'application/json'
        },
        method: 'POST',
      }).then(response => {
        let data = response._bodyText
        let imageURL = JSON.parse(data).secure_url
        console.log(imageURL)
        firebase.database().ref('users/' + this.props.screenProps.user.id + '/firstReaction').transaction(function(){
          return imageURL
        })
      }).catch(err => {
        console.log(err)
      })
      this.setModalVisible(!this.state.modalVisible)

      // var metadata = {
      //   contentType: 'image/jpeg',
      // };
      
      // firebase.storage().ref().child('images/firstimage.jpg').put(this.convertToByteArray(success.base64), metadata).then(success => {
      // // firebase.storage().ref().child('images/firstimage.jpg').putString('data:image/jpeg;base64, ' + success.base64, 'base64', metadata).then(success => {
      //   console.log(success)
      //   console.log('Uploaded a base64 string!');
      // }).catch(error => {
      //   console.log(error)
      // })
      // firebase.storage().ref().put(uri).then(function(snapshot) {
      //   console.log('Uploaded a blob or file!');
      // });
    })
      // console.log(data)
  //   const data = new FormData();
  //   data.append('reaction', {
  //     uri: uri, // your file path string
  //     name: 'my_photo.jpg',
  //     type: 'image/jpeg'
  //   })
    
  //   fetch('https://gotcha-2018.herokuapp.com/imageblob', {
  //     headers: {
  //       'Accept': 'application/json',
  //       'Content-Type': 'multipart/form-data'
  //     },
  //     method: 'POST',
  //     body: JSON.stringify(data)
  //   }).then(res => {
  //     console.log('heloooooooooooooooooooooooooo')
  //     console.log(res)
  //   }).catch(err => {
  //     console.log(err)
  //   })
  //   // console.log(example)
  //   // console.log(base64Image)
  }

  setModalVisible(visible, uri) {
    this.setState({
      modalVisible: visible,
      modalUri: uri
    });
  }

  render() {
    const { hasCameraPermission } = this.state;
    console.log('pressStatus', this.state.pressStatus)
    console.log('modalUri', this.state.modalUri)

    /* 2. Read the params from the navigation state */
    const { params } = this.props.navigation.state;
    const type = params ? params.type : null;
    const media = params ? params.media : null;
    const headline = params ? params.headline : null;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <Container>
          <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.modalVisible}
            onRequestClose={() => {this.setModalVisible(!this.state.modalVisible)} }>
            <View>
              <Header>
                <Left>
                  <Button transparent onPress={() => { this.setModalVisible(!this.state.modalVisible) }}>
                    <Icon name='arrow-back'/>
                  </Button>
                </Left>
                <Body style={{flex: 3}}>
                  <Title>Send it!</Title>
                </Body>
                <Right />
              </Header>
            </View>
            <Content>
              <Image
                ref={self => { this.reactionImage = self }}
                source={{uri: this.state.modalUri }}
                style={{ height: Dimensions.get('screen').height/2, width: null }}
              />
            </Content>
            <Footer style={{backgroundColor: 'transparent'}} >
              <FooterTab style={{backgroundColor: 'transparent'}} >
                <Button
                  transparent
                  onPress={() => { this.onSend(this.state.modalUri) }}>
                  <FontAwesome style={{fontSize: 35}} name='send'/>
                </Button>
              </FooterTab>
            </Footer>
          </Modal>
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
              <ScrollView style={{backgroundColor: 'transparent'}} >
                <Image 
                  source={{uri: media}}
                  style={{height: Dimensions.get('screen').height/3, width: null , flex: 1}}
                  blurRadius={this.state.pressStatus? 0 : Platform.OS === 'ios' ? 70 : 10}
                />
                <View style={{flex: 1, flexWrap: 'nowrap', backgroundColor: 'transparent'}}>
                  <Text style={{textAlign: 'center', backgroundColor: 'transparent'}} >
                  {this.state.photos.length}</Text>
                </View>
                <View style={{flex: 1, flexWrap: 'nowrap', backgroundColor: 'transparent'}}>
                  <Text style={{textAlign: 'center', backgroundColor: 'transparent'}}>Press and hold to reveal.</Text>
                  </View>
                <View 
                  style={{ 
                    flex: 1,
                    backgroundColor: 'transparent',
                    flexDirection: 'row',
                    flexWrap: 'wrap' }}> 
                  {this.state.photos.map(photo => {
                    return (
                    <TouchableOpacity 
                      key={photo} 
                      onPress={() => {
                        this.setModalVisible(true, photo);
                      }}>
                      {/* onPress={() => { this.onSaveImage(photo) }}> */}
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
                onPress={this.onDelete.bind(this)}>
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
