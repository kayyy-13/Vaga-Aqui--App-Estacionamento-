import * as React from "react";

import Home         from "./Home";
import Rua         from "./Rua";
import Reserva          from "./Resvaga";
import ReservaListar    from "./ReservaListar";
import Profile from './Profile';
import Admin from './Admin';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons as Icon } from '@expo/vector-icons';

import { Usuario } from "../model/Usuario";
import { auth, firestore } from "../firebase";
import { useEffect, useState } from "react";

const Tab = createBottomTabNavigator();

export default function Menu() {
    const [usuario, setUsuario] = useState<Usuario | null>(null);

    useEffect(() => {
        listarUsuario();
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
                tabBarActiveTintColor: "#1a5c47",
                tabBarActiveBackgroundColor: "#a5d1c3",
                tabBarLabelStyle: { fontSize: 13, fontWeight: "900" }
            }}
        >
                <Tab.Screen
                    name='Página Inicial'
                    component={Home}
                    options={{ tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} /> }}
                />

                <Tab.Screen
                    name='Cadastro de Reserva'
                    component={Reserva}
                    options={{ tabBarIcon: ({ color, size }) => <Icon name="car" size={size} color={color} /> }}
                />

                <Tab.Screen
                    name='Minhas Reservas'
                    component={ReservaListar}
                    options={{ tabBarIcon: ({ color, size }) => <Icon name="list" size={size} color={color} /> }}
                />

                <Tab.Screen
                    name='Perfil'
                    component={Profile}
                    options={{ tabBarIcon: ({ color, size }) => <Icon name="person" size={size} color={color} /> }}
                />

                {usuario?.tipo === '2' && (
                    <Tab.Screen
                        name='Admin'
                        component={Admin}
                        options={{ tabBarIcon: ({ color, size }) => <Icon name="lock-closed" size={size} color={color} /> }}
                    />
                )}

                {usuario?.tipo === '2' && (
                    <>
                        <Tab.Screen
                            name='Cadastro de Ruas'
                            component={Rua}
                            options={{ tabBarButton: () => null }}
                        />

                        <Tab.Screen
                            name='Lista de Reservas'
                            component={ReservaListar}
                            options={{ tabBarButton: () => null }}
                        />
                    </>
                )}
            </Tab.Navigator>
    );
}
