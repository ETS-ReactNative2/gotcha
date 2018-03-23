import React from 'react';
import { StyleSheet, Image, View, TouchableOpacity, Vibration, Dimensions, Modal } from 'react-native';
import { Constants, Camera, FileSystem, Permissions, ImageManipulator, ImagePicker } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import { Text, Container, Content, Card, CardItem, Thumbnail, Header, Title, Button, Left, Right, Body, Icon, Footer, FooterTab, Form, Item, Input } from 'native-base';
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

export default class CameraExample extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.front,
    photoId: 1,
    photoUri: null,
    modalVisible: false,
    title: ''
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  componentDidMount() {
    FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'photos').catch(e => {
      console.log(e, 'Directory exists');
    });
  }

  takePicture = async function() {
    this.setState({
      modalVisible: true
    })
    if (this.camera) {
      this.camera.takePictureAsync().then(data => {
        this.setState({
          photoId: this.state.photoId + 1,
          photoUri: data.uri,
        });
      });
    }
  };

  setModalVisible(visible) {
    this.setState({
      modalVisible: visible,
    });
    if(visible === false) {
      this.setState({
        title: ''
      })
    }
  }

  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync();
    console.log(result);

    if (!result.cancelled) {
      this.setState({ 
        photoUri: result.uri,
        modalVisible: true
      });
    }
  };

  onPost = async () => {
    const uri = this.state.photoUri
    const { title } = this.state
    const { uid, name, photoURL } = this.props.user
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

        let feedData = {
          userPoster: {
            name: { first: name.first, last: name.last },
            profileImage: photoURL,
          },
          content: {
            type: 'image',
            title: title,
            data: imageURL,
            dated: new Date()
          },
          reactions: [],
          readState: false
        }
        let newFeedKey = firebase.database().ref('feeds/').push().key;
        let updates = {};
        updates['feeds/' + newFeedKey] = feedData;
        firebase.database().ref().update(updates);
      }).catch(err => {
        console.log(err)
      })
      this.setModalVisible(!this.state.modalVisible)
    })
  }

  onChange = (title) => {
    console.log(title)
    this.setState({
      title: title
    })
  }

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <Container>
          <Modal
            animationType="fade"
            transparent={false}
            visible={this.state.modalVisible}
            onRequestClose={() => {this.setModalVisible(!this.state.modalVisible)} }>
            <View>
              <Header hasSegment style={{ backgroundColor: '#fa8700' }} >
                <Left>
                  <TouchableOpacity onPress={() => { this.setModalVisible(!this.state.modalVisible) }} >
                    <Button disabled transparent >
                      <Icon color='white' name='arrow-back'/>
                    </Button>
                  </TouchableOpacity>
                </Left>
                <Body style={{alignItems: 'center', backgroundColor: 'transparent', color: 'white'}}>
                  <Title style={{color: 'white'}} >Upload to Gotcha!</Title>
                </Body>
                <Right />
              </Header>
            </View>
            <Content>
              {this.state.photoUri && 
                <Image 
                  source={{uri: this.state.photoUri }} 
                  resizeMethod='resize'
                  resizeMode='contain'
                  style={{ height: Dimensions.get('screen').height/2, width: Dimensions.get('screen').width }}/>
              }
              <Form>
                <Item success>
                  <Input placeholder="Give it a title!" onChangeText={(title) => this.setState({ title: title }) } value={this.state.title} />
                  {/* <Icon name='checkmark-circle' /> */}
                </Item>
              </Form>
            </Content>
            <Footer style={{backgroundColor: 'transparent', height: 70}} >
              <FooterTab style={{backgroundColor: 'transparent'}} >
                <Button disabled transparent />
                <TouchableOpacity onPress={this.onPost}>
                  <Button disabled transparent style={{paddingBottom: 20}} >
                    <Thumbnail source={{uri: 'http://res.cloudinary.com/eugeneyu/image/upload/v1521716342/gotcha-send.png'}} />
                  </Button>
                </TouchableOpacity>
                <Button disabled transparent />
              </FooterTab>
            </Footer>
          </Modal>
          <Content>
           <View style={{ flex: 1}}>
            <Camera 
              style={{
                alignSelf: 'center',
                height: Dimensions.get('screen').height, 
                width: Dimensions.get('screen').height/4*3, 
              }} 
              type={this.state.type} ref={ref => { this.camera = ref; }} >
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  flexDirection: 'row',
                }}>
                
              </View>
            </Camera>
          </View>
          </Content>
          <Footer style={{backgroundColor: 'black'}} >
            <FooterTab style={{backgroundColor: 'black'}} >
              <TouchableOpacity style={{ flex: 1 }}
                onPress={this._pickImage} > 
                <Button disabled transparent  >
                  <Ionicons name="md-image" size={32} color='white' />
                </Button>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1 }}
                onPress={this.takePicture.bind(this)} > 
                <Button disabled transparent  >
                  <Ionicons name="ios-radio-button-on-outline" size={55} color='white' />
                </Button>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1 }}
                onPressOut={() => {
                  this.setState({
                    type: this.state.type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back,
                    });
                }}>
                <Button disabled transparent >
                  <Ionicons name='ios-reverse-camera' size={32} color='white' />
                </Button>
              </TouchableOpacity>
            </FooterTab>
          </Footer>
        </Container>
      );
    }
  }
}