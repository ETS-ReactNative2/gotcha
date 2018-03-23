import React, { Component } from 'react'
import {
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Clipboard,
  Dimensions,
  Modal,
  CameraRoll
} from 'react-native';
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
  Badge,
  Footer,
  FooterTab
 } from 'native-base';

import { FileSystem } from 'expo'

import { Feather } from '@expo/vector-icons';


export default class ViewReactions extends Component {
  constructor() {
    super()
    this.state = {
      modalVisible: false,
      modalUri: null,
      index: 0
    }
  }

  setModalVisible(visible, uri, index) {
    this.setState({
      modalVisible: visible,
      modalUri: uri,
      index: index
    })
  }

  onSaveImage = async (uri) => {
    console.log('original uri', uri)
    let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
    console.log('filename', filename)
    const { uri: localUri } = await FileSystem.downloadAsync(uri, FileSystem.documentDirectory + filename);
    console.log(localUri)

    CameraRoll.saveToCameraRoll(localUri).then(response => {
      console.log(response)
    }).catch(err => {
      console.log(err)
    })
  }

  render() {
    const { params } = this.props.navigation.state;
    const reactions = params ? params.reactions : null;
    const index = params ? params.index : null;

    let reactionsMap = new Map(Object.entries(reactions))
    let reactionsArray = [...reactionsMap.values()]
    // console.log(reactionsArray)
    let reactionsJSX = reactionsArray.map((reaction, index) => {
      const photoURL = reaction.url
      console.log(photoURL)
      return (
        <TouchableOpacity 
          key={index} 
          onPress={() => {
            this.setModalVisible(true, photoURL, index);
          }}>
          <Image 
            source={{uri: photoURL }} 
            style={{height: Dimensions.get('screen').height/4, width: Dimensions.get('screen').width/3}}
          />
        </TouchableOpacity>
      )
    })
    return (
      <Container>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {this.setModalVisible(!this.state.modalVisible)} }>
          <Content style={{ backgroundColor: 'black' }} >
            <ImageBackground
              source={{uri: this.state.modalUri }}
              style={{ height: Dimensions.get('screen').height - 25, width: null }} >
              <Header style={{ backgroundColor: 'transparent', backgroundColor: 'black', opacity: 0.3 }} >
                <Left>
                  <TouchableOpacity 
                    onPress={() => { this.setModalVisible(!this.state.modalVisible) }}
                    style={{paddingVertical: 10 }} >
                    <Icon style={{fontSize: 35, color: 'white' }} name='arrow-back'/>
                  </TouchableOpacity>
                </Left>
                <Body />
              </Header>
              <Content />
              <Footer style={{ backgroundColor: 'transparent' }} >
                <FooterTab style={{ backgroundColor: 'black', opacity: 0.3}} >
                  <Button transparent disabled style={{backgroundColor: 'transparent'}} />
                  <TouchableOpacity 
                    style={{ paddingVertical: 10 }}
                    onPressOut={() => { this.onSaveImage(this.state.modalUri) }} >
                    {/* <Button 
                      transparent
                      style={{opacity: 1}} > */}
                      <Feather style={{fontSize: 35, color: 'white'}} name='download'/>
                    {/* </Button> */}
                  </TouchableOpacity>
                  <Button transparent disabled style={{backgroundColor: 'transparent'}} />
                </FooterTab>
              </Footer>
            </ImageBackground>
          </Content>
        </Modal>
        <Header hasSegment style={{ backgroundColor: '#fa8700' }}  > 
          <Left>
            <TouchableOpacity onPress={() => this.props.navigation.goBack()} >
              <Button disabled transparent >
                <Icon name='arrow-back'/>
              </Button>
            </TouchableOpacity>
          </Left>
          <Body style={{alignItems: 'center', backgroundColor: 'transparent', color: 'white'}}>
            <Title style={{color: 'white'}} >Shared Reactions</Title>
          </Body>
          <Right />
        </Header>
        <ScrollView>
          <View style={{ flex: 1, backgroundColor: 'transparent', flexDirection: 'row', flexWrap: 'wrap' }} > 
            {reactionsJSX}
          </View>
        </ScrollView>
      </Container>
    )
  }
}
