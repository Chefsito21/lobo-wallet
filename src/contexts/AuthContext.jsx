import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (pb.authStore.isValid) {
      setCurrentUser(pb.authStore.model);
    }
    setInitialLoading(false);
  }, []);

  const login = async (email, password) => {
    const authData = await pb.collection('users').authWithPassword(email, password, { $autoCancel: false });
    setCurrentUser(authData.record);
    return authData;
  };

  const signup = async (email, password, passwordConfirm, name) => {
  try {
    // PASO 1: Crear el usuario en la colección 'users'
    const userData = {
      email,
      emailVisibility: true,
      password,
      passwordConfirm,
      name,
    };
    
    // Creamos el usuario
    const newUser = await pb.collection('users').create(userData);

    // Inmediatamente iniciamos sesión para obtener el token y autenticar la sesión
    await pb.collection('users').authWithPassword(email, password);
    setCurrentUser(pb.authStore.model);

    // PASO 2: Crear la Cuenta Principal por defecto
    // Solo podemos hacer esto *después* de iniciar sesión, porque PocketBase 
    // necesita saber que estamos autenticados para asignar el 'userId' correctamente.
    const defaultAccountData = {
      name: 'Billetera Principal',
      type: 'debit',
      balance: 0,
      isDefault: true, // El campo de protección que añadimos antes
      userId: newUser.id, // Enlazamos la cuenta al nuevo usuario
    };

    // Creamos el registro en la colección 'accounts'
    await pb.collection('accounts').create(defaultAccountData);

    return newUser;
    
  } catch (error) {
    console.error("Error en el registro:", error);
    
    if (error.response && error.response.data) {
      console.error("🔍 DETALLES DE POCKETBASE:", error.response.data);
    }
    
    throw error;
  }
};

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    initialLoading,
    login,
    signup,
    logout,
    isAuthenticated: pb.authStore.isValid,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};