import React, { Component } from 'react';
import {
  Image,
  WebView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Clipboard,
  CameraRoll,
  Animated,
  Easing
} from 'react-native';
import { WebBrowser, Video } from 'expo';
import { Constants, Camera, FileSystem, Permissions } from 'expo';
import { ImagePicker } from 'expo';

// import { Ionicons } from '@expo/vector-icons';
import { Container, Header, Title, Button, Left, Right, Body, Icon } from 'native-base';
import validator from 'validator';

export default class FromClipboard extends Component {
  constructor() {
    super()
    this.state = {
      playState: false,
      hasCameraPermission: null,
      type: Camera.Constants.Type.front,
      photoId: 1,
      lastPhotoURI: null,
      photos: []
    };
    this.animatedValue = []
    this.state.photos.forEach(value => {
      this.animatedValue[value] = new Animated.Value(0)
    })
    // this.takePicture = this.takePicture.bind(this)
  }

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  componentDidMount() {
    FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'photos').catch(e => {
      console.log(e, 'Directory exists');
    });
  }

  animate = () => {
    const animations = this.state.photos.map((item) => {
      return Animated.timing(
        this.animatedValue[item],
        {
          toValue: 1,
          duration: 50
        }
      )
    })
    Animated.sequence(animations).start()
  }

  async takePicture () {
    // console.log("hello camera pls work")
    // console.log(this.camera)
    if (this.camera) {
      this.camera.takePictureAsync().then(data => {
        // console.log("took the photo...")
        FileSystem.moveAsync({
          from: data.uri,
          to: `${FileSystem.documentDirectory}photos/Photo_${this.state.photoId}.jpg`,
        }).then(() => {
          // console.log("moved the photo...")
          this.setState({
            photoId: this.state.photoId + 1,
            lastPhotoURI: `${FileSystem.documentDirectory}photos/Photo_${this.state.photoId}.jpg`,
            photos: this.state.photos.concat(`${FileSystem.documentDirectory}photos/Photo_${this.state.photoId}.jpg`)
          });
          console.log(this.state.photoId)
          // Vibration.vibrate();
        }).catch((err) => {console.log(err)})
      });
    }
  };

  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    console.log(result);

    if (!result.cancelled) {
      this.setState({ image: result.uri });
    }
  };

  onPressPlay = () => {
    const jsInject = this.state.playState ? 'player.pauseVideo()' : 'player.playVideo()'
    console.log(jsInject)
    // const jsInject = `player.playVideo()` 
    this.webview.injectJavaScript(jsInject);
    this.animate()
    // this.webview.postMessage("Hello from RN");
    // setTimeout(this.takePicture.bind(this), 1000); 
    // this.takePicture()
    // console.log(this.state.playState)
    if(!this.state.playState) {
      this.snapshots = setInterval(this.takePicture.bind(this), 3000);
      console.log('injected play');
    } else {
      clearInterval(this.snapshots)
      this.snapshots = false
      console.log('injected pause')
    }
    this.setState({playState: !this.state.playState})
    // if(this.state.photoId > 5) { clearInterval(snapshots) }
  }
  onPressStop = () => {
    const jsInject = `player.pauseVideo()`
    this.setState({playState: false})
    this.webview.injectJavaScript(jsInject);
    clearInterval(this.snapshots)
    this.snapshots = false
    console.log('injected Stop');
  }
  
  onMessage = (data) => {
    //Prints out data that was passed.
    console.log(data);
  }

  onSaveImage = (tag) => {
    CameraRoll.saveToCameraRoll(tag).then(response => {
      console.log(response)
    }).catch(err => {
      console.log(err)
    })
  }

  render() {
    const styles = StyleSheet.create({
      WebViewContainer: {
        marginTop: (Platform.OS === 'ios') ? 20 : 0,
      },
      flipButton: {
        flex: 0.3,
        height: 40,
        marginHorizontal: 2,
        borderRadius: 8,
        borderColor: 'white',
        borderWidth: 1,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
      }
    })
    const animations = this.state.photos.map((a, i) => {
      return <Animated.Image key={i} source={{uri: a}} style={{opacity: this.animatedValue[a], height: 50, width:50}} />
      // return this.animatedImage.source({uri, a})
      // this.animatedImage.set = {uri: a}
    })
    const {clipboard} = this.props
    console.log(clipboard)
    console.log(this.state.playState)

    //?modestbranding=0&rel=0&showinfo=0&enablejsapi=1"
  //  const type = validator.isURL(clipboard) ? 'video' : 'text'
   const type = 'video'
   const youtubeJS = `<iframe id="existing-iframe-example"
   width="320" height="180"
   src="https://www.youtube.com/embed/0Bmhjf0rKe8?enablejsapi=1&rel=0&modestbranding=1&showinfo=0&controls=0&iv_load_policy=3"
   frameborder="0"
   style="border: solid 4px #37474F"
></iframe>

<script type="text/javascript">
var tag = document.createElement('script');
tag.id = 'iframe-demo';
tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
player = new YT.Player('existing-iframe-example', {
  events: {
    'onReady': onPlayerReady,
    'onStateChange': onPlayerStateChange
  }
});
}
function onPlayerReady(event) {
document.getElementById('existing-iframe-example').style.borderColor = '#FF6D00';
}
function changeBorderColor(playerStatus) {
var color;
if (playerStatus == -1) {
color = "#37474F"; // unstarted = gray
} else if (playerStatus == 0) {
color = "#FFFF00"; // ended = yellow
} else if (playerStatus == 1) {
color = "#33691E"; // playing = green
} else if (playerStatus == 2) {
color = "#DD2C00"; // paused = red
} else if (playerStatus == 3) {
color = "#AA00FF"; // buffering = purple
} else if (playerStatus == 5) {
color = "#FF6DOO"; // video cued = orange
}
if (color) {
document.getElementById('existing-iframe-example').style.borderColor = color;
}
}
function onPlayerStateChange(event) {
  changeBorderColor(event.data);
}
</script>`
    
const { hasCameraPermission } = this.state;
  switch(type) {
    case 'video': 
      if (hasCameraPermission === null) {
        return <View />;
      } else if (hasCameraPermission === false) {
        return <Text>No access to camera</Text>;
      } else {
        return (
          <View style={{ 
            flex: 1, 
            flexDirection: 'column', 
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {/* <Text> Clipboard: {clipboard} </Text>  */}
            <View style={{ flex: 1 }} pointerEvents="none">
              <WebView
                ref={ref => (this.webview = ref)}
                // onMessage={this.onMessage}
                style={{height: 200, width:350}} 
                bounces={false}
                // style={ styles.WebViewContainer }
                javaScriptEnabledAndroid={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                automaticallyAdjustContentInsets={true}
                scrollEnabled={true}
                source={{html: `${youtubeJS}`}}
                // source={{html: `${youtubeJS} <iframe width="200" height="200" src="https://www.youtube.com/embed/IQI9aUlouMI?showinfo=0&modestbranding=1" frameborder="0" enablejsapi="1" allow="encrypted-media" allowfullscreen></iframe>'`}}
                // source={{uri: 'https://www.youtube.com/embed/IQI9aUlouMI?rel=0&autoplay=0&showinfo=0&modestbranding=1&controls=0' }}
                mediaPlaybackRequiresUserAction={true}
                // style={{height: 200}}
                startInLoadingState={true}
              />
            </View>
            <View style={{ flexDirection: 'row' }} >
              <Button light onPress={this.onPressPlay} >
                <Icon name={!this.state.playState ? 'play' :'pause'} />
              </Button>
              <Button light onPress={this.onPressStop} >
                <Icon name='close'/>
                {/* <Text>Pause</Text> */}
              </Button>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
                flexWrap: 'wrap'
              }}>
            {/* <Image source={{uri: this.state.lastPhotoURI }} style={{height: 50, width: 50, flex: 1}}/> */}
            {/* {animations} */}
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

            </View>
            {/* <Button onPress={this._pickImage}><Text> Select an Image</Text></Button> */}
            <View style={{ flex: 1}}>
              <Camera style={{ flex: 1, height: 200, width: 150, alignSelf: 'center' }} type={this.state.type} ref={ref => { this.camera = ref; }}>
              </Camera>
            </View>


          {/* <Video
            source={{ uri: clipboard }}
            rate={1.0}
            volume={1.0}
            isMuted={true}
            resizeMode="cover"
            useNativeControls
            // shouldPlay
            // isLooping
            style={{ width: 200, height: 200 }}
          /> */}
        </View>
      )}
    case 'image':
      return (
        <View>
          <Image src={clipboard} />
        </View>
      )
    default:
      return (
        <View>
          <Text> Clipboard: {clipboard} </Text>
        </View>
      )
  }
  }
}