import React, { useEffect, useState } from 'react';
import { FlatList, Alert, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

import { useAuth } from '@hooks/auth';

import { OrderCard, OrderProps } from '@components/OrderCard';
import { ItemSeparator } from '@components/ItemSeparator';

import {
  Container,
  Header,
  ContentHeader,
  Title,
} from './styles';
import { ButtonBack } from '@components/ButtonBack';


export function Orders() {
  const [orders, setOrders] = useState<OrderProps[]>([]);

  const { user } = useAuth();

  const navigation = useNavigation();

  function handlePizzaDelivered(id: string) {
    if(user?.isAdmin) {
      Alert.alert('Pedido', 'Confirmar que a pizza esta pronta?', [
        {
          text: 'Não',
          style: 'cancel'
        },
        {
          text: 'Sim',
          onPress: () => {
            firestore().collection('orders').doc(id).update({
              status: 'Pronto'
            });
          }
        }
      ]);
    } else {
      Alert.alert('Pedido', 'Confirmar que a pizza foi entregue?', [
        {
          text: 'Não',
          style: 'cancel'
        },
        {
          text: 'Sim',
          onPress: () => {
            firestore().collection('orders').doc(id).update({
              status: 'Entregue'
            });
          }
        }
      ]);
    }
  }

  function handleGoBack() {
    navigation.goBack();
  }

  useEffect(() => {
    if(user?.isAdmin) {
      const subscribe = firestore()
      .collection('orders')
      .onSnapshot(querySnapshot => {
        const data = querySnapshot.docs.map(doc => {
          return {
            id: doc.id,
            ...doc.data()
          }
        }) as OrderProps[];

        setOrders(data);
      });

      return () => subscribe();
    }
      const subscribe = firestore()
      .collection('orders')
      .where('waiter_id', '==', user?.id)
      .onSnapshot(querySnapshot => {
        const data = querySnapshot.docs.map(doc => {
          return {
            id: doc.id,
            ...doc.data()
          }
        }) as OrderProps[];

        setOrders(data);
      });

      return () => subscribe();

  }, []);

  return (
    <Container>
      <Header>
        {user?.isAdmin
        ?
          <ContentHeader>
            <ButtonBack 
              onPress={handleGoBack}
            />
            <Title>Pedidos feitos</Title>
            <View />
          </ContentHeader>
        :
          <Title>Pedidos feitos</Title>
        }
        
      </Header>

      <FlatList 
        data={orders}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <OrderCard 
            index={index} 
            data={item}
            disabled={user?.isAdmin ? item.status === 'Entregue' || item.status === 'Pronto' : item.status === 'Entregue' || item.status === 'Preparando'}
            onPress={() => handlePizzaDelivered(item.id)}
          />
        )}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 125 }}
        ItemSeparatorComponent={() => <ItemSeparator />}
      />
    </Container>
  );
}