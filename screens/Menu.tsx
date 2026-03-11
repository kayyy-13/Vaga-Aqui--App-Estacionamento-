import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";

import Home         from "./Home";
import Rua         from "./Rua";
import RuaListar   from "./RuaListar";
import Reserva          from "./Resvaga";
import ReservaListar    from "./ReservaListar";
import ReservaListar2   from "./ReservaListar2";

import { Usuario } from "../model/Usuario";
import { auth, firestore } from "../firebase";
import { useEffect, useState } from "react";

const Drawer = createDrawerNavigator();

export default function Menu() {
    const[usuario, setUsuario] = useState<Usuario[]>([]); 

    useEffect( () => {                // Recebe o objeto reserva para editar
        listarUsuario();
    }, [])

    const listarUsuario = () => {
        const refUsuario = firestore.collection("Usuario")
            .doc(auth.currentUser?.uid)
            .get()
            .then(DocumentSnapshot =>{
                setUsuario({
                    id: DocumentSnapshot.id,
                    ...DocumentSnapshot.data()
                })                
            })
        
    }        

    return(
         
        <Drawer.Navigator initialRouteName="Página Inicial">
            <Drawer.Screen name='Página Inicial' component={Home} />            
            <Drawer.Screen name='Cadastro de Reserva' component={Reserva} />
             <Drawer.Screen name='Minhas Reservas' component={ReservaListar} />

            {usuario.tipo === '2' && (
                <>
                    <Drawer.Screen name='Cadastro de Ruas' component={Rua} />
                    <Drawer.Screen name='Lista de Reservas' component={ReservaListar} />
                    
                </>
            )}

        </Drawer.Navigator>
    )
}