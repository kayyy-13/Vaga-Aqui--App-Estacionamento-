import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Button, TouchableOpacity, ImageBackground} from 'react-native';
import { TextInput } from 'react-native-paper';
import { auth, firestore } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import styles from '../estilo';

import { Picker } from '@react-native-picker/picker';

import { Resvaga } from '../model/Resvaga';


export default function ListarResvaga() {
    const [reserva, setReserva] = useState<Resvaga[]>([]); //array de vagas
    const [tipoUsuario, setTipoUsuario] = useState<string>(''); //tipo do usuário autenticado
    const [detalhesVagas, setDetalhesVagas] = useState<{[key: string]: {rua: string, vaga: string}}>({});
    const navigation = useNavigation();

    const refResvaga = firestore.collection("Usuario")
        .doc(auth.currentUser?.uid)
        .collection("Resvaga")

    useEffect( () => {
        listar();
        buscarTipoUsuario();
    }, [])

    const buscarTipoUsuario = async () => {
        try {
            const docSnap = await firestore.collection("Usuario")
                .doc(auth.currentUser?.uid)
                .get();
            if (docSnap.exists) {
                setTipoUsuario(docSnap.data()?.tipo);
            }
        } catch (e) {
            console.error("Erro ao buscar tipo de usuário:", e);
        }
    };

    const listar = () => {
        const subscriber = refResvaga
        .onSnapshot( async (query) => { 
            const reserva = [];
            query.forEach((documento) => {
                reserva.push({
                    ...documento.data(),
                    key: documento.id
                });
            });
            setReserva(reserva);

            // Buscar detalhes das vagas
            const ids = reserva.map(r => r.idVaga).filter(id => id);
            const detalhes: {[key: string]: {rua: string, vaga: string}} = {};
            for (const id of ids) {
                const doc = await firestore.collection("Ruas").doc(id).get();
                if (doc.exists) {
                    detalhes[id] = { rua: doc.data()?.rua || '', vaga: doc.data()?.vaga || '' };
                }
            }
            setDetalhesVagas(detalhes);
        })
        return () => subscriber();
    }

    const excluir = async(item) => {
        const resultado = await refResvaga
         .doc(item.id)
         .delete()
         .then( () => {
            alert('Vaga excluída com sucesso!')
            listar()
         })
    }

    const cancelar = async(item) => {
        try {
            await refResvaga.doc(item.id).delete();
            // Liberar a vaga
            await firestore.collection("Ruas").doc(item.idVaga).update({ status: "livre" });
            alert('Reserva cancelada com sucesso!');
            listar();
        } catch (e) {
            console.error("Erro ao cancelar reserva:", e);
            alert("Erro ao cancelar reserva!");
        }
    }

    const editar = 
    (item: Resvaga) => {
        navigation.navigate
        ("Cadastro de Reserva", {resvaga:item});
    }

    return (
        <ImageBackground source={require('../assets/tela.png')} resizeMode='stretch' style={styles.container}>
            <FlatList
                data={reserva}
                renderItem={ ({item}) => (
                    <View style={styles.listItem}>
                        <Text style={styles.listText}>Data: {item.data}</Text>
                        <Text style={styles.listText}>Hora: {item.hora}</Text>
                        <Text style={styles.listText}>Tipo: {item.tipo}</Text>
                        <Text style={styles.listText}>Vaga: {detalhesVagas[item.idVaga] ? `${detalhesVagas[item.idVaga].rua} - ${detalhesVagas[item.idVaga].vaga}` : item.idVaga}</Text>
                        
                        <View style={{flexDirection: 'row', marginTop: 10, gap: 10}}>
                            {tipoUsuario === '2' && (
                                <>
                                    <TouchableOpacity 
                                        style={[styles.button, {flex: 1}]}
                                        onPress={() => editar(item)}
                                    >
                                        <Text style={styles.buttonText}>Editar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.button, {flex: 1, backgroundColor: '#d32f2f'}]}
                                        onPress={() => excluir(item)}
                                    >
                                        <Text style={styles.buttonText}>Excluir</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                            {tipoUsuario === '1' && (
                               <>
                             <TouchableOpacity 
                                        style={[styles.button, {flex: 1}]}
                                        onPress={() => editar(item)}
                                    >
                                        <Text style={styles.buttonText}>Editar</Text>
                                    </TouchableOpacity>
                               <TouchableOpacity 
                                    style={[styles.button, {flex: 1}]}
                                    onPress={() => cancelar(item)}
                                >
                                    <Text style={styles.buttonText}>Cancelar</Text>
                                </TouchableOpacity>
                                </>
                            )}
                        </View>                                                     
                    </View>
                )}
            />
        </ImageBackground>
    )
}