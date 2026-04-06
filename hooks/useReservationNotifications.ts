import { useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { auth, firestore } from '../firebase';

export const useReservationNotifications = () => {
  // Verificar e cancelar reservas expiradas
  const verificarReservasExpiradas = useCallback(async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const agora = Date.now();
      const snapshot = await firestore
        .collection("Usuario")
        .doc(userId)
        .collection("Resvaga")
        .get();

      for (const doc of snapshot.docs) {
        const reserva = doc.data();
        
        // Se a reserva expirou, cancelar automaticamente a vaga!!
        if (reserva.expiraEm && reserva.expiraEm < agora) {
          try {
            // Liberar a vaga
            await firestore
              .collection("Ruas")
              .doc(reserva.idVaga)
              .update({ status: "livre" });

            // Deletar a reserva
            await doc.ref.delete();

            // Notificar o usuário que a reserva foi cancelada
            Alert.alert(
              '❌ Reserva Cancelada',
              `Sua reserva expirou após 30 minutos sem ocupação. A vaga foi liberada.`,
              [{ text: 'OK', onPress: () => {} }]
            );

            console.log(`Reserva ${doc.id} cancelada automaticamente`);
          } catch (error) {
            console.error(`Erro ao cancelar reserva ${doc.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar reservas expiradas:', error);
    }
  }, []);

  // Mostrar notificação para reservas prestes a expirar
  const verificarReservasProximasAExpirar = useCallback(async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const agora = Date.now();
      const minutosAvanço = 5 * 60 * 1000; // Notificar 5 minutos antes de expirar
      
      const snapshot = await firestore
        .collection("Usuario")
        .doc(userId)
        .collection("Resvaga")
        .get();

      for (const doc of snapshot.docs) {
        const reserva = doc.data();
        
        // Se a reserva expira em menos de 5 minutos, notificar apenas uma vez
        if (reserva.expiraEm) {
          const tempoRestante = reserva.expiraEm - agora;
          
          // Notificar se faltam menos de 5 minutos e ainda não foi notificado
          if (tempoRestante > 0 && tempoRestante <= minutosAvanço && !reserva.notificadoUltimoAviso) {
            const minutosRestantes = Math.ceil(tempoRestante / 60000);
            
            Alert.alert(
              '⏰ Tempo Limitado',
              `Você tem ${minutosRestantes} minuto(s) para ocupar a vaga. Se não ocupar, a reserva será cancelada automaticamente.`,
              [{ text: 'OK', onPress: () => {} }]
            );

            // Marcar que a notificação de 5 minutos foi enviada
            await doc.ref.update({ notificadoUltimoAviso: true });

            console.log(`Notificação enviada para reserva ${doc.id}. Tempo restante: ${minutosRestantes} minutos`);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar reservas próximas a expirar:', error);
    }
  }, []);

  // Inicializar verificações periódicas
  useEffect(() => {
    // Verificar imediatamente ao inicializar
    verificarReservasExpiradas();
    verificarReservasProximasAExpirar();

    // Verificar a cada 1 minuto
    const intervalo = setInterval(() => {
      verificarReservasExpiradas();
      verificarReservasProximasAExpirar();
    }, 60 * 1000);

    return () => clearInterval(intervalo);
  }, [verificarReservasExpiradas, verificarReservasProximasAExpirar]);

  return {
    verificarReservasExpiradas,
    verificarReservasProximasAExpirar,
  };
};
