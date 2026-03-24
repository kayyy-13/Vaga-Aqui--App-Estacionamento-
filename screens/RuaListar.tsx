import { useEffect, useState } from 'react';
import { Text, View, FlatList, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import { auth, firestore } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import styles from '../estilo';

import { Rua } from '../model/Rua';

/**
 * Tela para listar ruas disponíveis (apenas para administradores).
 * Permite visualizar, editar e excluir ruas.
 */
export default function ListarRua() {
    const [ruas, setRuas] = useState<Rua[]>([]); // Estado para armazenar lista de ruas
    const [tipoUsuario, setTipoUsuario] = useState<string>(''); // Tipo do usuário logado

    const navigation = useNavigation();
    const refRua = firestore.collection("Ruas");

    useEffect(() => {
        if (tipoUsuario && tipoUsuario !== '2') {
            Alert.alert('Acesso negado', 'Apenas administradores podem visualizar ruas.');
            navigation.goBack();
        }
    }, [tipoUsuario, navigation]);

    useEffect(() => {
        if (tipoUsuario === '2') {
            const subscriber = refRua.onSnapshot((query) => {
                const ruas = [];
                query.forEach((documento) => {
                    ruas.push({
                        ...documento.data(),
                        key: documento.id
                    });
                });
                setRuas(ruas);
            });
            return () => subscriber(); // Limpa listener ao desmontar
        }
    }, [tipoUsuario]); // Executa quando tipoUsuario muda

    /**
     * Busca o tipo do usuário logado e define permissões.
     */
    const buscarTipoUsuario = async () => {
        try {
            const docSnap = await firestore.collection("Usuario")
                .doc(auth.currentUser?.uid)
                .get();
            if (docSnap.exists) {
                const tipo = docSnap.data()?.tipo;
                setTipoUsuario(tipo);
            }
        } catch (e) {
            console.error("Erro ao buscar tipo de usuário:", e);
        }
    };

    /**
     * Exclui uma rua do Firestore com confirmação.
     */
    const excluir = async (item: Rua) => {
        Alert.alert(
            "Confirmação",
            "Deseja excluir esta rua?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    onPress: async () => {
                        try {
                            await refRua.doc(item.id).delete();
                            Alert.alert('Sucesso', 'Rua excluída com sucesso!');
                        } catch (e) {
                            console.error("Erro ao excluir rua:", e);
                            Alert.alert('Erro', 'Falha ao excluir rua.');
                        }
                    }
                }
            ]
        );
    };

    /**
     * Navega para a tela de edição da rua selecionada.
     */
    const editar = (item: Rua) => {
        navigation.navigate("Cadastro de Ocupação de Vagas", { rua: item });
    };

    return (
        <ImageBackground source={require('../assets/fundo.png')} resizeMode='stretch' style={styles.container}>
            <FlatList
                data={ruas}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.listItem}
                        onPress={() => editar(item)}
                        onLongPress={() => excluir(item)}
                    >
                        <Text style={styles.listText}>Rua: {item.rua}</Text>
                        <Text style={styles.listText}>N° da Vaga: {item.vaga}</Text>
                        <Text style={styles.listText}>Status: {item.status}</Text>
                    </TouchableOpacity>
                )}
            />
        </ImageBackground>
    );
}