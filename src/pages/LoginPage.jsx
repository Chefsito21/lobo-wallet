import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import { useAuth } from '@/contexts/AuthContext.jsx';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

import { Wallet } from 'lucide-react';

import Header from '@/components/Header.jsx';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');

    if (!email || !password) {

      setError(
        'Por favor completa todos los campos'
      );

      return;
    }

    setLoading(true);

    try {

      await login(email, password);

      navigate('/dashboard');

    } catch (err) {

      setError(
        'Correo o contraseña incorrectos'
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>

        <title>Iniciar Sesión - LoboWallet</title>

        <meta
          name="description"
          content="Inicia sesión en tu cuenta de LoboWallet para administrar tus finanzas"
        />
      </Helmet>

      <Header />

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">

        <Card className="w-full max-w-md">

          <CardHeader className="text-center">

            <div className="flex justify-center mb-4">

              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">

                <Wallet className="w-6 h-6 text-primary" />

              </div>
            </div>

            <CardTitle className="text-2xl">
              Bienvenido de nuevo
            </CardTitle>

            <CardDescription>
              Inicia sesión en tu cuenta de LoboWallet
            </CardDescription>

          </CardHeader>

          <CardContent>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              <div className="space-y-2">

                <Label htmlFor="email">
                  Correo electrónico
                </Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  value={email}

                  onChange={(e) =>
                    setEmail(e.target.value)
                  }

                  className="text-foreground"
                  required
                />
              </div>

              <div className="space-y-2">

                <Label htmlFor="password">
                  Contraseña
                </Label>

                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}

                  onChange={(e) =>
                    setPassword(e.target.value)
                  }

                  className="text-foreground"
                  required
                />
              </div>

              {error && (

                <p className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >

                {loading
                  ? 'Iniciando sesión...'
                  : 'Iniciar sesión'}

              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">

              ¿No tienes una cuenta?{' '}

              <Link
                to="/signup"
                className="text-primary hover:underline font-medium"
              >
                Regístrate
              </Link>

            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default LoginPage;