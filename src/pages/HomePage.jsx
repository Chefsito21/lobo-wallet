import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { TrendingUp, PiggyBank, Target, ArrowRight } from 'lucide-react';
import Header from '@/components/Header.jsx';
import { motion } from 'framer-motion';

const HomePage = () => {
  const features = [
    {
      icon: TrendingUp,
      title: 'Track every transaction',
      description: 'Record income and expenses with detailed categorization. See where your money goes with real-time insights.',
    },
    {
      icon: PiggyBank,
      title: 'Set smart budgets',
      description: 'Create category-based budgets and get alerts when you approach your limits. Stay in control of your spending.',
    },
    {
      icon: Target,
      title: 'Reach savings goals',
      description: 'Set financial targets and track progress. Whether it\'s a new laptop or spring break trip, achieve your goals faster.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>LoboWallet - Personal finance for university students</title>
        <meta name="description" content="Track expenses, set budgets, and reach savings goals. Built for university students who want to take control of their finances." />
      </Helmet>
      <Header />
      
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
                Take control of your money as a student
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-prose">
                LoboWallet helps university students track spending, stick to budgets, and save for what matters. Simple tools for real financial clarity.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link to="/signup">
                    Get started free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Login</Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1590431533633-9a64bed60fe9"
                alt="University student managing finances on laptop"
                className="rounded-2xl shadow-2xl w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to manage money</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built specifically for students juggling classes, part-time work, and social life
            </p>
          </div>

          <div className="space-y-24">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isReversed = index % 2 === 1;
              
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${isReversed ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className={isReversed ? 'md:order-2' : ''}>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-semibold mb-4">{feature.title}</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  <div className={`bg-muted rounded-2xl p-12 ${isReversed ? 'md:order-1' : ''}`}>
                    <div className="aspect-video bg-background/50 rounded-xl flex items-center justify-center">
                      <Icon className="w-24 h-24 text-primary/20" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to take control?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
              Join students who are building better financial habits with LoboWallet
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/signup">
                Create your free account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default HomePage;