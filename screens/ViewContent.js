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
      modalUri: null,
      index: 0
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
    const { feedUid, type } = this.props.navigation.state.params;
    const { uid, name, photoURL } = this.props.screenProps.user
    const index = this.state.index
    const base64Image = await ImageManipulator.manipulate(uri, [{resize: {width: 500}}], {format: 'jpeg', base64: true}).then(success => {
      let base64Img = `data:image/jpeg;base64,${success.base64}`
      let apiUrl = 'https://api.cloudinary.com/v1_1/eugeneyu/image/upload'

      let data = {
        "file": base64Img,
        "upload_preset": "tn0itef2",
      }
      // Working Fetch!
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

        let reactionData = {
          date: new Date(),
          from: { uid: uid, name: name, photoURL: photoURL },
          type: type,
          url: imageURL
        }

        // Get a key for a new Reaction.
        let newReactionsKey = firebase.database().ref(`feeds/${feedUid}/reactions`).push().key;
        // Write the new post's data simultaneously in the posts list and the user's post list.
        let updates = {};
        updates[`/feeds/${feedUid}/reactions/` + newReactionsKey] = reactionData;

        return firebase.database().ref().update(updates);


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
  //     console.log(res)
  //   }).catch(err => {
  //     console.log(err)
  //   })
  //   // console.log(example)
  //   // console.log(base64Image)
  }

  setModalVisible(visible, uri, index) {
    this.setState({
      modalVisible: visible,
      modalUri: uri,
      index: index
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
    const index = params ? params.index : null;
    const feedUid = params ? params.feedUid : null;
    console.log(media)
    console.log(async () => {return await ImageManipulator.manipulate(media, [{}],{format: 'jpeg'})})
    
    console.log(feedUid)
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
              <Header hasSegment style={{ backgroundColor: '#fa8700' }} >
                <Left>
                  <TouchableOpacity onPress={() => { this.setModalVisible(!this.state.modalVisible) }} >
                    <Button disabled transparent >
                      <Icon name='arrow-back'/>
                    </Button>
                  </TouchableOpacity>
                </Left>
                <Body style={{alignItems: 'center', backgroundColor: 'transparent', color: 'white'}}>
                  <Title style={{color: 'white'}} >Send it!</Title>
                </Body>
                <Right />
              </Header>
            </View>
            <Content style={{backgroundColor: 'black'}} >
              <Image
                ref={self => { this.reactionImage = self }}
                source={{uri: this.state.modalUri }}
                resizeMethod='resize'
                resizeMode='contain'
                // resizeMode='contain'
                style={{ height: Dimensions.get('screen').height*0.75 }}
              />
            </Content>
            <Footer style={{backgroundColor: 'black'}} >
              <FooterTab style={{backgroundColor: 'black'}} >
                <Button
                  transparent
                  onPress={() => { this.onSend(this.state.modalUri) }}>
                  <FontAwesome style={{fontSize: 35, color: 'white'}} name='send'/>
                </Button>
              </FooterTab>
            </Footer>
          </Modal>
          <Header hasSegment style={{ backgroundColor: '#fa8700' }} >
            <Left>
              <TouchableOpacity onPress={() => this.props.navigation.goBack()} >
                <Button disabled transparent >
                  <Icon name='arrow-back'/>
                </Button>
              </TouchableOpacity>
            </Left>
            <Body style={{alignItems: 'center', backgroundColor: 'transparent', color: 'white'}}>
              <Title style={{color: 'white'}} >{headline}</Title>
            </Body>
            <Right />
          </Header>
          <Content scrollEnabled={false} style={{backgroundColor: 'white'}} >
            <View style={styles.container}>
              <View style={{backgroundColor: 'transparent'}} >
                <Image 
                  source={{uri: media}}
                  resizeMethod={'resize'}
                  style={{ minHeight: Dimensions.get('screen').height/1.75, width: Dimensions.get('screen').width}}
                  blurRadius={this.state.pressStatus? 0 : Platform.OS === 'ios' ? 70 : 10}
                />
                <View style={{backgroundColor: 'transparent'}}>
                  <Text style={{textAlign: 'center', backgroundColor: 'transparent'}} >
                  {this.state.photos.length}</Text>
                  <Text style={{textAlign: 'center', backgroundColor: 'transparent'}}>Press and hold to reveal.</Text>
                </View>
                <ScrollView horizontal style={{top: -35}} > 
                  {this.state.photos.map(photo => {
                    return (
                    <TouchableOpacity 
                      key={photo} 
                      onPress={() => {
                        this.setModalVisible(true, photo, index);
                      }}>
                      <Image 
                        source={{uri: photo }} 
                        resizeMode='contain'
                        style={{height: Dimensions.get('screen').height/4 , width: Dimensions.get('screen').width/6}}
                      />
                    </TouchableOpacity>
                    )
                  })}
                </ScrollView>
              </View>
              {/* <View style={{ display: 'none' }} > */}
              {/* Hiding the camera with left offset */}
              <View style={{ left: -100 }} > 
              {/* <View >  */}
                <Camera
                  ref={self => { this.camera = self }}
                  style={{ flex: 1, height: 40, width: 30 }}
                  type={this.state.type} />
              </View>
            </View>
          </Content>
          <Footer style={{backgroundColor: 'white'}} >
            <FooterTab style={{backgroundColor: 'white'}} >
              <Button disabled transparent style={{backgroundColor: 'transparent'}} />
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
