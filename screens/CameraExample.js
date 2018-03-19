import React from 'react';
import { StyleSheet, Text, Image, View, TouchableOpacity, Vibration } from 'react-native';
import { Constants, Camera, FileSystem, Permissions } from 'expo';
import { Ionicons } from '@expo/vector-icons';


export default class CameraExample extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.front,
    photoId: 1,
    lastPhotoURI: null

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
    if (this.camera) {
      this.camera.takePictureAsync().then(data => {
        FileSystem.moveAsync({
          from: data.uri,
          to: `${FileSystem.documentDirectory}photos/Photo_${this.state.photoId}.jpg`,
        }).then(() => {

          this.setState({
            photoId: this.state.photoId + 1,
            lastPhotoURI: `${FileSystem.documentDirectory}photos/Photo_${this.state.photoId}.jpg`
          });
          console.log(this.state.photoId)
          // Vibration.vibrate();
        })
      });
    }
  };

  render() {
    const styles = StyleSheet.create({
      flipButton: {
        flex: 0.3,
        height: 40,
        marginHorizontal: 2,
        // marginBottom: 10,
        // marginTop: 20,
        borderRadius: 8,
        borderColor: 'white',
        borderWidth: 1,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
      }
    })
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1}}>
          <Camera style={{ flex: 1, height: 200, width: 150, alignSelf: 'center' }} type={this.state.type} ref={ref => { this.camera = ref; }}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
              }}>
              <Image source={{uri: this.state.lastPhotoURI }} style={{height: 150, width: null, flex: 1}}/>
              <TouchableOpacity
                style={[{ flex: 0.3, alignSelf: 'flex-end' }]}
                onPress={this.takePicture.bind(this)}>
                <Ionicons name="ios-radio-button-on-outline" size={32} color="green" />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                }}
                onPress={() => {
                  this.setState({
                    type: this.state.type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back,
                  });
                }}>
                <Text
                  style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                  {' '}Flip{' '}
                </Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      );
    }
  }
}