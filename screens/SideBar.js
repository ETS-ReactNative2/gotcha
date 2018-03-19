import React, { Component } from 'react';
import { Image, View } from 'react-native'
import { Container, Content, Card, CardItem, Thumbnail, Header, Title, Button, Left, Right, Body, Icon, Text, Drawer, List, ListItem } from 'native-base';

export default class SideBar extends Component {
  render() {
    const { name, id, image } = this.props.user
    return (
      <View>
        <Container>
          <Header style={{height: 100}} >
            <Left >
              <Image
                source={require('../assets/images/icon.png')}
                style={{height: 50, width: 50}}
              />
            </Left>
            <Body>
              <Title>Gotcha</Title>
            </Body>
            <Right />
          </Header>
          <Content style={{backgroundColor: 'white'}} >
            <List>
              <ListItem>
                <Image source={{uri: image}} />
                <Text>{name}</Text>
              </ListItem>
            </List>
          </Content>
        </Container>
      </View>
    )
  }
}