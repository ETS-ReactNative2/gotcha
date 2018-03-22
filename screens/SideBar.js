import React, { Component } from 'react';
import { Image, View, Dimensions } from 'react-native'
import { Container, Content, Card, CardItem, Thumbnail, Header, Title, Button, Left, Right, Body, Icon, Text, Drawer, List, ListItem } from 'native-base';

export default class SideBar extends Component {
  render() {
    const { name, uid, photoURL } = this.props.user

    return (
      <Content style={{ flex: 1, backgroundColor: '#FFFFFF', height: Dimensions.get('window').height }} >
        <Header style={{height: 120, flex: 3 }} >
          <Left style={{flex: 1.25, marginLeft: 10}} >
            <Image
              source={require('../assets/images/icon.png')}
              style={{height: 75, width: 75}}
            />
          </Left>
          <Body style={{flex: 1}} >
            <Text style={{color: 'white', fontSize: 20}} >Gotcha</Text>
          </Body>
          <Right />
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
        </List>
      </Content>
    )

  }
}