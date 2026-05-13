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

const SignupPage = () => {

  const { signup } = useAuth();

  const navigate = useNavigate();

  const [name, setName] = useState('');

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');

    if (
      !name ||
      !email ||
      !password ||
      !passwordConfirm
    ) {

      setError(
        'Por favor completa todos los campos'
      );

      return;
    }

    if (password.length < 8) {

      setError(
        'La contraseña debe tener al menos 8 caracteres'
      );

      return;
    }

    if (password !== passwordConfirm) {

      setError(
        'Las contraseñas no coinciden'
      );

      return;
    }

    setLoading(true);

    try {

      await signup(
        email,
        password,
        passwordConfirm,
        name
      );

      navigate('/dashboard');

    } catch (err) {

      setError(
        err.message || 'Error al crear la cuenta'
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>

        <title>Registro - LoboWallet</title>

        <meta
          name="description"
          content="Crea tu cuenta de LoboWallet para comenzar a administrar tus finanzas"
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
              Crea tu cuenta
            </CardTitle>

            <CardDescription>
              Comienza a administrar tus finanzas hoy
            </CardDescription>

          </CardHeader>

          <CardContent>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              <div className="space-y-2">

                <Label htmlFor="name">
                  Nombre
                </Label>

                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={name}

                  onChange={(e) =>
                    setName(e.target.value)
                  }

                  className="text-foreground"
                  required
                />
              </div>

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
                  placeholder="Mínimo 8 caracteres"
                  value={password}

                  onChange={(e) =>
                    setPassword(e.target.value)
                  }

                  className="text-foreground"
                  required
                />
              </div>

              <div className="space-y-2">

                <Label htmlFor="passwordConfirm">
                  Confirmar contraseña
                </Label>

                <Input
                  id="passwordConfirm"
                  type="password"
                  placeholder="Vuelve a escribir tu contraseña"
                  value={passwordConfirm}

                  onChange={(e) =>
                    setPasswordConfirm(e.target.value)
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
                  ? 'Creando cuenta...'
                  : 'Registrarse'}

              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">

              ¿Ya tienes una cuenta?{' '}

              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Inicia sesión
              </Link>

            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SignupPage;