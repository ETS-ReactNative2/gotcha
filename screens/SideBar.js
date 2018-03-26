import React, { Component } from 'react';
import { Image, View, Dimensions } from 'react-native'
import { Container, Content, Card, CardItem, Thumbnail, Header, Title, Button, Left, Right, Body, Icon, Text, Drawer, List, ListItem, Footer, FooterTab } from 'native-base';

export default class SideBar extends Component {
  render() {
    const { name, uid, photoURL } = this.props.user

    return (
      <Content scrollEnabled={false} style={{ flex: 1, backgroundColor: '#FFFFFF', height: Dimensions.get('window').height }} >
        <Header style={{height: 120, flex: 3, backgroundColor: '#fa8700' }} >
          <Left style={{flex: 1.25, marginLeft: 10}} >
            <Image
              source={require('../assets/images/gotcha-logo.png')}
              style={{height: 75, width: 75}}
            />
          </Left>
          <Body style={{flex: 1}} >
            <Text style={{color: 'white', fontSize: 16, left: -30}} >Capture</Text>
            <Text style={{color: 'white', fontSize: 16, left: -5}} >reactions...</Text>
          </Body>
          
        </Header>
        <List>
          <ListItem >
            <Thumbnail style={{width: 50, height: 50}} source={{uri: photoURL}} />
            <Text style={{marginLeft: 10, fontSize: 15}} >{name.first} {name.last}</Text>
          </ListItem>
          <ListItem style={{height: 70}} >
            <Button transparent onPress={this.props.logout} >
              <Text>Logout</Text>
            </Button>
          </ListItem>
          {/* <ListItem style={{height: 300}} /> */}
        </List>
      </Content>
    )

  }
}