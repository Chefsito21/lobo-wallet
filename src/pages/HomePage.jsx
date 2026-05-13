import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { TrendingUp, PiggyBank, Target, ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';
import Header from '@/components/Header.jsx';
import { motion } from 'framer-motion';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-emerald-500/30 font-sans">
      <Helmet>
        <title>LoboWallet | Finanzas para universitarios</title>
        <meta name="description" content="Controla tus gastos y domina tu presupuesto sin el aburrimiento corporativo." />
      </Helmet>
      
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 mb-8">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-zinc-300">Hecho por y para estudiantes</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
              Hackea tus finanzas. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Domina tu futuro.
              </span>
            </h1>
            
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              LoboWallet es el centro de comando para tu dinero. Sin gráficos aburridos ni jerga financiera; solo las herramientas exactas para sobrevivir la universidad con saldo a favor.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold h-14 px-8 rounded-xl" asChild>
                <Link to="/signup">
                  Iniciar Misión
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-zinc-800 hover:bg-zinc-900 text-zinc-100 h-14 px-8 rounded-xl" asChild>
                <Link to="/login">Ver Dashboard</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1: Large Span */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 bg-zinc-900/50 border border-zinc-800/50 p-8 rounded-3xl backdrop-blur-sm hover:border-emerald-500/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Rastreo de Alta Precisión</h3>
              <p className="text-zinc-400 leading-relaxed">
                Cada taco, cada café y cada suscripción quedan registrados. Visualiza tu flujo de efectivo en tiempo real y descubre tus verdaderos hábitos de consumo.
              </p>
            </motion.div>

            {/* Feature 2: Square */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900/50 border border-zinc-800/50 p-8 rounded-3xl backdrop-blur-sm hover:border-cyan-500/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Presupuestos Blindados</h3>
              <p className="text-zinc-400 leading-relaxed">
                Asigna límites estrictos. La app te avisará antes de que te quedes sin dinero para el fin de semana.
              </p>
            </motion.div>

            {/* Feature 3: Square */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900/50 border border-zinc-800/50 p-8 rounded-3xl backdrop-blur-sm hover:border-purple-500/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Metas de Ahorro</h3>
              <p className="text-zinc-400 leading-relaxed">
                Define tus objetivos (como esa nueva laptop) y observa cómo la barra de progreso se llena mes a mes.
              </p>
            </motion.div>

            {/* Feature 4: Large Span */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/50 p-8 rounded-3xl backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-zinc-300" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Ingreso Rápido</h3>
                <p className="text-zinc-400 leading-relaxed max-w-md">
                  Registrar un gasto debería tomarte menos de 5 segundos. Nuestra interfaz está diseñada para minimizar la fricción y maximizar la acción.
                </p>
              </div>
              <Button className="shrink-0 rounded-xl" variant="secondary">
                Probar Demo
              </Button>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;