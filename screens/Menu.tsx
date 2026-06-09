import * as React from "react";
import { Platform } from "react-native";

import Home         from "./Home";
import Rua         from "./Rua";
import Reserva          from "./Resvaga";
import ReservaListar2   from "./ReservaListar2";
import Profile from './Profile';
import Admin from './Admin';
import UserManagement from './UserManagement';
import Suporte from './Suporte';
import Denuncias from './Denuncias';
import MinhasDenuncias from './MinhasDenuncias';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Usuario } from "../model/Usuario";
import { auth, firestore } from "../firebase";
import { useEffect, useState } from "react";
import { useReservationNotifications } from "../hooks/useReservationNotifications";
import { themeColors } from '../estilo';

const Tab = createBottomTabNavigator();
const iconSize = 24;

export default function Menu() {
    const insets = useSafeAreaInsets();
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const { verificarReservasExpiradas, verificarReservasProximasAExpirar } = useReservationNotifications();
    const bottomSpacing = Math.max(insets.bottom, Platform.OS === "ios" ? 20 : 18);

    useEffect(() => {
        listarUsuario();
        
        // Verificar reservas imediatamente ao entrar na tela
        verificarReservasExpiradas();
        verificarReservasProximasAExpirar();
    }, []);

    const listarUsuario = () => {
        firestore.collection("Usuario")
            .doc(auth.currentUser?.uid)
            .get()
            .then(documentSnapshot => {
                if (documentSnapshot.exists) {
                    setUsuario({
                        id: documentSnapshot.id,
                        ...documentSnapshot.data()
                    } as Usuario);
                }
            });
    };

    return (
        <Tab.Navigator
            id="main-tabs"
            screenOptions={{
                headerShown: false,
                tabBarHideOnKeyboard: true,
                tabBarActiveTintColor: themeColors.primary,
                tabBarInactiveTintColor: themeColors.textSecondary,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "700",
                    marginTop: 2,
                },
                tabBarStyle: {
                    height: 62 + bottomSpacing,
                    paddingTop: 8,
                    paddingBottom: bottomSpacing,
                    backgroundColor: themeColors.card,
                    borderTopColor: "rgba(255,255,255,0.12)",
                    borderTopWidth: 1,
                    elevation: 12,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.18,
                    shadowRadius: 8,
                },
                tabBarItemStyle: {
                    flex: 1,
                    paddingVertical: 2,
                    minWidth: 0,
                },
                tabBarIconStyle: { width: iconSize, height: iconSize },
            }}
        >
                <Tab.Screen
                    name='Página Inicial'
                    component={Home}
                    options={{
                        tabBarLabel: 'Início',
                        tabBarIcon: ({ color }) => <Icon name="home" size={iconSize} color={color} />
                    }}
                />

                {usuario?.tipo !== '2' && (
                    <>
                        <Tab.Screen
                            name='Cadastro de Reserva'
                            component={Reserva}
                            options={{
                                tabBarLabel: 'Reserva',
                                tabBarIcon: ({ color }) => <Icon name="car" size={iconSize} color={color} />
                            }}
                        />
                    </>
                )}

                <Tab.Screen
                    name='Perfil'
                    component={Profile}
                    options={{ tabBarIcon: ({ color }) => <Icon name="person" size={iconSize} color={color} /> }}
                />

                {usuario?.tipo !== '2' && (
                    <Tab.Screen
                        name='Suporte'
                        component={Suporte}
                        options={{ tabBarIcon: ({ color }) => <Icon name="help-circle" size={iconSize} color={color} /> }}
                    />
                )}

                {usuario?.tipo !== '2' && (
                    <Tab.Screen
                        name='Minhas Denúncias'
                        component={MinhasDenuncias}
                        options={{
                            tabBarLabel: 'Denúncias',
                            tabBarIcon: ({ color }) => <Icon name="document-text" size={iconSize} color={color} />
                        }}
                    />
                )}

                {usuario?.tipo === '2' && (
                    <Tab.Screen
                        name='Admin'
                        component={Admin}
                        options={{ tabBarIcon: ({ color }) => <Icon name="lock-closed" size={iconSize} color={color} /> }}
                    />
                )}

                {usuario?.tipo === '2' && (
                    <Tab.Screen
                        name='Denúncias'
                        component={Denuncias}
                        options={{
                            tabBarLabel: 'Denúncias',
                            tabBarIcon: ({ color }) => <Icon name="alert-circle" size={iconSize} color={color} />
                        }}
                    />
                )}

                {usuario?.tipo === '2' && (
                    <Tab.Screen
                        name='Gerenciar Usuários'
                        component={UserManagement}
                        options={{
                            tabBarButton: () => null,
                            tabBarItemStyle: { display: 'none' },
                        }}
                    />
                )}

                {usuario?.tipo === '2' && (
                    <Tab.Screen
                        name='Reservas do App'
                        component={ReservaListar2}
                        options={{
                            tabBarButton: () => null,
                            tabBarItemStyle: { display: 'none' },
                        }}
                    />
                )}

                {usuario?.tipo === '2' && (
                    <>
                        <Tab.Screen
                            name='Cadastro de Ruas'
                            component={Rua}
                            options={{
                                tabBarButton: () => null,
                                tabBarItemStyle: { display: 'none' },
                            }}
                        />
                    </>
                )}
            </Tab.Navigator>
    );
}
