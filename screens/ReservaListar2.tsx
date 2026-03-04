import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Button, TouchableOpacity, ImageBackground, Platform, UIManager} from 'react-native';
import { TextInput } from 'react-native-paper';
import { auth, firestore } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import styles from '../estilo';

import { Picker } from '@react-native-picker/picker';

import { Resvaga } from '../model/Resvaga';

import { AccordionItem } from 'react-native-accordion-list-view';
import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { Usuario } from '../model/Usuario';


export default function ListarResvaga() {
    const [resvagas, setResvagas] = useState<Resvaga[]>([]);  //Array das Reservas em branco

    const refResvaga = firestore.collection("Usuario")
        .doc(auth.currentUser?.uid)
        .collection("Resvaga")

    useEffect( () => {
        listar();
    })

    const listar = () => {
        const subscriber = refResvaga
        .onSnapshot( (query) => { 
            const reserva = [];
            query.forEach((documento) => {
                reserva.push({
                    ...documento.data(),
                    key: documento.id
                });
            });
            setResvagas(reserva);
        })
        return () => subscriber();
    }

    return (
        <ImageBackground source={require('../assets/tela.png')} resizeMode='stretch' style={styles.container}>

            {resvagas.map(item => (
                <AccordionItem 
                    key={item.id}
                    customTitle={() => <Text style={styles.listText}>ID Usuário: {item.id}</Text>}    
                    customBody={() => 
                        <TouchableOpacity>
                            <Text style={styles.listText}>Data: {item.data}</Text>
                            <Text style={styles.listText}>Tipo: {item.tipo}</Text>
                            <Text style={styles.listText}>Vaga: {item.vaga}</Text>
                        </TouchableOpacity> }
                    customIcon={() => <FontAwesome6 
                                        name='chevron-down' 
                                        size={20} 
                                        iconStyle='solid' 
                                        color={'#00474fff'}
                                      />}
                />
            ))}
            
        </ImageBackground>
    )
}