import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Button, TouchableOpacity, ImageBackground} from 'react-native';
import { TextInput } from 'react-native-paper';
import { auth, firestore } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import styles from '../estilo';

import { Picker } from '@react-native-picker/picker';

import { Rua } from '../model/Rua'; 


export default function ListarRua() {
    const [ruas, setRuas] = useState<Rua[]>([]);  //Array das Ruas em branco

    const navigation = useNavigation();

    const refRua = firestore.collection("Usuario")
        .doc(auth.currentUser?.uid)
        .collection("Rua")

    useEffect( () => {
        listar();
    })

    const listar = () => {
        const subscriber = refRua
        .onSnapshot( (query) => { 
            const ruas = [];
            query.forEach((documento) => {
                ruas.push({
                    ...documento.data(),
                    key: documento.id
                });
            });
            setRuas(ruas);
        })
        return () => subscriber();
    }

    const excluir = async(item) => {
        const resultado = await refRua
         .doc(item.id)
         .delete()
         .then( () => {
            alert('Excluído com sucesso!')
            listar()
         })
    }

    const editar = (item: Rua) => {
        navigation.navigate("Cadastro de Ocupação de Vagas", {rua: item});
    }

    return (
        <ImageBackground source={require('../assets/tela.png')} resizeMode='stretch' style={styles.container}>
            <FlatList
                data={ruas}
                renderItem={ ({item}) => (
                    <TouchableOpacity style={styles.listItem}
                        onPress={ () => editar(item) }
                        onLongPress={ () => excluir(item) }
                    >
                        <Text style={styles.listText}>Rua: {item.rua}</Text>
                        <Text style={styles.listText}>N° da Vaga: {item.vaga}</Text>
                        <Text style={styles.listText}>Status: {item.status}</Text>
                    </TouchableOpacity>
                )}
            />
        </ImageBackground>
    )
}