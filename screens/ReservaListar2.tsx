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
    status: 'Ativa' | 'Finalizada';
};

export default function ReservaListar2() {
    const [reservas, setReservas] = useState<ReservaAdmin[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [detalhesVagas, setDetalhesVagas] = useState<{ [key: string]: { rua: string; vaga: string } }>({});
    const [filtro, setFiltro] = useState<'Ativas' | 'Finalizadas'>('Ativas');

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
                    const agora = Date.now();
                    let status: 'Ativa' | 'Finalizada' = 'Finalizada';

                    if (dadosReserva?.expiraEm != null) {
                        status = dadosReserva.expiraEm > agora ? 'Ativa' : 'Finalizada';
                    } else if (dadosReserva?.data && dadosReserva?.hora) {
                        const partes = dadosReserva.data.split('/').map(Number);
                        const [dia, mes, ano] = partes;
                        const [horaStr, minutoStr] = (dadosReserva.hora || '').split(':').map(Number);
                        const dataHora = new Date(ano, (mes || 1) - 1, dia || 1, horaStr || 0, minutoStr || 0);
                        status = dataHora.getTime() > agora ? 'Ativa' : 'Finalizada';
                    }

                    reservasColetadas.push({
                        id: reservaDoc.id,
                        idUsuario: usuarioDoc.id,
                        nomeUsuario: dadosUsuario?.nome || 'Usuário sem nome',
                        idVaga: dadosReserva?.idVaga || '',
                        data: dadosReserva?.data || '',
                        hora: dadosReserva?.hora || '',
                        dia: obterDiaSemana(dadosReserva?.data),
                        status,
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

    const reservasFiltradas = reservas.filter(item => {
        if (filtro === 'Ativas') return item.status === 'Ativa';
        return item.status === 'Finalizada';
    });

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

            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filtro === 'Ativas' ? styles.filterButtonActive : styles.filterButtonInactive,
                    ]}
                    onPress={() => setFiltro('Ativas')}
                >
                    <Text
                        style={filtro === 'Ativas' ? styles.filterButtonTextActive : styles.filterButtonTextInactive}
                    >
                        Ativas
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        filtro === 'Finalizadas' ? styles.filterButtonActive : styles.filterButtonInactive,
                    ]}
                    onPress={() => setFiltro('Finalizadas')}
                >
                    <Text
                        style={filtro === 'Finalizadas' ? styles.filterButtonTextActive : styles.filterButtonTextInactive}
                    >
                        Finalizadas
                    </Text>
                </TouchableOpacity>
            </View>

            {carregando ? (
                <Text style={styles.listText}>Carregando reservas...</Text>
            ) : (
                <FlatList
                    data={reservasFiltradas}
                    keyExtractor={(item) => `${item.idUsuario}-${item.id}`}
                    contentContainerStyle={styles.flatlistContentContainer}
                    ListEmptyComponent={<Text style={styles.listText}>Nenhuma reserva encontrada.</Text>}
                    renderItem={({ item }) => (
                        <View style={styles.listItem}>
                            <Text style={styles.listText}>Usuário: {item.nomeUsuario}</Text>
                            <Text style={styles.listText}>
                                Rua:{' '}
                                {detalhesVagas[item.idVaga]
                                    ? `${detalhesVagas[item.idVaga].rua} - vaga ${detalhesVagas[item.idVaga].vaga}`
                                    : item.idVaga || 'Não informada'}
                            </Text>
                            <Text style={styles.listText}>Horário: {item.data || 'Não informada'} {item.hora || ''}</Text>
                            <Text style={[styles.listText, item.status === 'Ativa' ? styles.activeText : styles.expiredText]}>
                                Status: {item.status}
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
