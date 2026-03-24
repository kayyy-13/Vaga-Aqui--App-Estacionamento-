import { useEffect, useState } from 'react';
import { Alert, FlatList, ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import { firestore } from '../firebase';
import styles from '../estilo';

type ReservaAdmin = {
    id: string;
    idUsuario: string;
    nomeUsuario: string;
    idVaga: string;
    data: string;
    hora: string;
    dia: string;
};

export default function ReservaListar2() {
    const [reservas, setReservas] = useState<ReservaAdmin[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [detalhesVagas, setDetalhesVagas] = useState<{ [key: string]: { rua: string; vaga: string } }>({});

    useEffect(() => {
        listarReservas();
    }, []);

    const obterDiaSemana = (data?: string) => {
        if (!data) {
            return '';
        }

        const partes = data.split('/');
        if (partes.length !== 3) {
            return '';
        }

        const [dia, mes, ano] = partes.map(Number);
        const dataReserva = new Date(ano, mes - 1, dia);

        if (Number.isNaN(dataReserva.getTime())) {
            return '';
        }

        const diasSemana = [
            'Domingo',
            'Segunda-feira',
            'Terça-feira',
            'Quarta-feira',
            'Quinta-feira',
            'Sexta-feira',
            'Sábado',
        ];

        return diasSemana[dataReserva.getDay()];
    };

    const listarReservas = async () => {
        try {
            setCarregando(true);

            const usuariosSnapshot = await firestore.collection('Usuario').get();
            const reservasColetadas: ReservaAdmin[] = [];

            for (const usuarioDoc of usuariosSnapshot.docs) {
                const dadosUsuario = usuarioDoc.data();
                const reservasSnapshot = await firestore
                    .collection('Usuario')
                    .doc(usuarioDoc.id)
                    .collection('Resvaga')
                    .get();

                reservasSnapshot.forEach((reservaDoc) => {
                    const dadosReserva = reservaDoc.data();

                    reservasColetadas.push({
                        id: reservaDoc.id,
                        idUsuario: usuarioDoc.id,
                        nomeUsuario: dadosUsuario?.nome || 'Usuário sem nome',
                        idVaga: dadosReserva?.idVaga || '',
                        data: dadosReserva?.data || '',
                        hora: dadosReserva?.hora || '',
                        dia: obterDiaSemana(dadosReserva?.data),
                    });
                });
            }

            const idsVagas = [...new Set(reservasColetadas.map((item) => item.idVaga).filter(Boolean))];
            const detalhes: { [key: string]: { rua: string; vaga: string } } = {};

            for (const idVaga of idsVagas) {
                const vagaDoc = await firestore.collection('Ruas').doc(idVaga).get();

                if (vagaDoc.exists) {
                    detalhes[idVaga] = {
                        rua: vagaDoc.data()?.rua || '',
                        vaga: vagaDoc.data()?.vaga || '',
                    };
                }
            }

            reservasColetadas.sort((a, b) => {
                const [diaA, mesA, anoA] = (a.data || '').split('/').map(Number);
                const [diaB, mesB, anoB] = (b.data || '').split('/').map(Number);
                const dataA = new Date(anoA || 0, (mesA || 1) - 1, diaA || 1).getTime();
                const dataB = new Date(anoB || 0, (mesB || 1) - 1, diaB || 1).getTime();

                if (dataA !== dataB) {
                    return dataA - dataB;
                }

                return (a.hora || '').localeCompare(b.hora || '');
            });

            setDetalhesVagas(detalhes);
            setReservas(reservasColetadas);
        } catch (error) {
            console.error('Erro ao listar reservas do administrador:', error);
        } finally {
            setCarregando(false);
        }
    };

    const cancelarReserva = (item: ReservaAdmin) => {
        Alert.alert(
            'Confirmação',
            'Deseja cancelar esta reserva?',
            [
                { text: 'Não', style: 'cancel' },
                {
                    text: 'Sim',
                    onPress: async () => {
                        try {
                            await firestore
                                .collection('Usuario')
                                .doc(item.idUsuario)
                                .collection('Resvaga')
                                .doc(item.id)
                                .delete();

                            if (item.idVaga) {
                                await firestore.collection('Ruas').doc(item.idVaga).update({ status: 'livre' });
                            }

                            alert('Reserva cancelada com sucesso!');
                            listarReservas();
                        } catch (error) {
                            console.error('Erro ao cancelar reserva do administrador:', error);
                            alert('Erro ao cancelar reserva!');
                        }
                    },
                },
            ]
        );
    };

    return (
        <ImageBackground source={require('../assets/fundo.png')} resizeMode="stretch" style={styles.container}>
            <Text style={styles.titulo}>Reservas do App</Text>

            {carregando ? (
                <Text style={styles.listText}>Carregando reservas...</Text>
            ) : (
                <FlatList
                    data={reservas}
                    keyExtractor={(item) => `${item.idUsuario}-${item.id}`}
                    contentContainerStyle={styles.flatlistContentContainer}
                    ListEmptyComponent={<Text style={styles.listText}>Nenhuma reserva encontrada.</Text>}
                    renderItem={({ item }) => (
                        <View style={styles.listItem}>
                            <Text style={styles.listText}>Usuário: {item.nomeUsuario}</Text>
                            <Text style={styles.listText}>Dia: {item.dia || 'Não informado'}</Text>
                            <Text style={styles.listText}>Data: {item.data || 'Não informada'}</Text>
                            <Text style={styles.listText}>Hora: {item.hora || 'Não informada'}</Text>
                            <Text style={styles.listText}>
                                Vaga:{' '}
                                {detalhesVagas[item.idVaga]
                                    ? `${detalhesVagas[item.idVaga].rua} - vaga ${detalhesVagas[item.idVaga].vaga}`
                                    : item.idVaga || 'Não informada'}
                            </Text>

                            <TouchableOpacity
                                style={[styles.button, { marginTop: 10, backgroundColor: '#d32f2f' }]}
                                onPress={() => cancelarReserva(item)}
                            >
                                <Text style={styles.buttonText}>Cancelar Reserva</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </ImageBackground>
    );
}
