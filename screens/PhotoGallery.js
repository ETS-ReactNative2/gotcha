import React, { Component } from 'react';
import { CameraRoll, Image, ScrollView, StyleSheet, Text } from 'react-native';
import { Constants, Permissions, Video } from 'expo';

export default class PhotoGallery extends Component {
  state = { photos: null };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    this.setState({ hasCameraRollPermission: status === 'granted' });
  }

  render() {
    let { photos } = this.state;
    const { hasCameraRollPermission } = this.state;
    if (hasCameraRollPermission === null) {
      return <View />;
    } else if (hasCameraRollPermission === false) {
      return <Text>No access to Camera Roll</Text>;
    } else {
        return (
          <ScrollView style={styles.container}>
            {photos
              ? this._renderPhotos(photos)
              : <Text style={styles.paragraph}>Fetching photos...</Text>}
          </ScrollView>
        )
      }
    }

  _renderPhotos(photos) {
    let images = [];
    for (let { node: photo } of photos.edges) {
      images.push(
        // <Image
        //   key={photo.image}
        //   source={photo.image}
        //   resizeMode="contain"
        //   style={{ height: 100, width: 100, resizeMode: 'contain' }}
        // />
        <Video
          key={photo.image.uri}
          source={{ uri: photo.image.uri }}
          rate={1.0}
          volume={1.0}
          isMuted={true}
          resizeMode="cover"
          useNativeControls
          // shouldPlay
          // isLooping
          style={{ width: 320, height: 320 }}
        />
      );
    }
    return images;
  }

  componentDidMount() {
    this._getPhotosAsync().catch(error => {
      console.error(error);
    });
  }

  async _getPhotosAsync() {
    let photos = await CameraRoll.getPhotos({ first: 10 , assetType: 'Videos'});
    console.log(photos)
    this.setState({ photos });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
});
