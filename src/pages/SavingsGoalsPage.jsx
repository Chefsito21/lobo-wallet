import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Trash2, Plus, CheckCircle2, Target } from 'lucide-react';
import Header from '@/components/Header.jsx';
import { toast } from 'sonner';

const SavingsGoalsPage = () => {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    goalName: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    description: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, [currentUser.id]);

  const fetchGoals = async () => {
    try {
      const records = await pb.collection('savingsGoals').getFullList({
        filter: `userId = "${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false,
      });
      setGoals(records);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      toast.error('Failed to load savings goals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.goalName || !formData.targetAmount || !formData.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.targetAmount) <= 0) {
      toast.error('Target amount must be greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Formateamos la fecha a ISO estricto para que PocketBase la acepte
      const safeDate = new Date(formData.deadline).toISOString();

      const data = {
        userId: currentUser.id,
        goalName: formData.goalName,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: formData.currentAmount ? parseFloat(formData.currentAmount) : 0,
        deadline: safeDate,
        description: formData.description,
      };

      if (editingId) {
        // 2. Si editamos, NO enviamos el campo 'completed' para respetar su estado actual en la base de datos
        await pb.collection('savingsGoals').update(editingId, data, { $autoCancel: false });
        toast.success('Goal updated');
      } else {
        // 3. Si es un objetivo nuevo, obligatoriamente nace como no completado
        data.completed = false;
        await pb.collection('savingsGoals').create(data, { $autoCancel: false });
        toast.success('Goal created');
      }

      setFormData({
        goalName: '',
        targetAmount: '',
        currentAmount: '',
        deadline: '',
        description: '',
      });
      setEditingId(null);
      fetchGoals();
    } catch (error) {
      console.error('Failed to save goal:', error);
      toast.error('Failed to save goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (goal) => {
    setFormData({
      goalName: goal.goalName,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      // 4. Cortamos el string de PB para que el <input type="date"> no colapse
      deadline: goal.deadline ? goal.deadline.substring(0, 10) : '',
      description: goal.description || '',
    });
    setEditingId(goal.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this savings goal?')) return;

    try {
      await pb.collection('savingsGoals').delete(id, { $autoCancel: false });
      toast.success('Goal deleted');
      fetchGoals();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const handleToggleComplete = async (goal) => {
    try {
      await pb.collection('savingsGoals').update(goal.id, {
        completed: !goal.completed,
      }, { $autoCancel: false });
      toast.success(goal.completed ? 'Goal marked as incomplete' : 'Goal completed');
      fetchGoals();
    } catch (error) {
      console.error('Failed to update goal:', error);
      toast.error('Failed to update goal');
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Savings Goals - LoboWallet</title>
        </Helmet>
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-96 lg:col-span-2" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Savings Goals - LoboWallet</title>
        <meta name="description" content="Track your savings goals and financial targets" />
      </Helmet>
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Savings Goals</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Your Goals</CardTitle>
              </CardHeader>
              <CardContent>
                {goals.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No savings goals yet</p>
                    <p className="text-sm text-muted-foreground">Create your first goal to start saving</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {goals.map((goal) => {
                      const percentage = (goal.currentAmount / goal.targetAmount) * 100;
                      const daysUntilDeadline = Math.ceil(
                        (new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)
                      );

                      return (
                        <div 
                          key={goal.id} 
                          className={`p-4 rounded-lg border ${goal.completed ? 'bg-primary/5 border-primary' : ''}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{goal.goalName}</h3>
                                {goal.completed && (
                                  <CheckCircle2 className="w-5 h-5 text-primary" />
                                )}
                              </div>
                              {goal.description && (
                                <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                ${goal.currentAmount.toFixed(2)} of ${goal.targetAmount.toFixed(2)}
                                {!goal.completed && daysUntilDeadline > 0 && (
                                  <span> • {daysUntilDeadline} days left</span>
                                )}
                                {!goal.completed && daysUntilDeadline <= 0 && (
                                  <span className="text-destructive"> • Deadline passed</span>
                                )}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleComplete(goal)}
                              >
                                <CheckCircle2 className={`w-4 h-4 ${goal.completed ? 'fill-primary' : ''}`} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(goal)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(goal.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <Progress 
                            value={Math.min(percentage, 100)} 
                            className={`h-2 ${goal.completed ? '[&>div]:bg-primary' : ''}`}
                          />
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-medium">
                              {percentage.toFixed(0)}% complete
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Deadline: {new Date(goal.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="shadow-lg sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {editingId ? 'Edit Goal' : 'Create Goal'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="goalName">Goal Name</Label>
                    <Input
                      id="goalName"
                      type="text"
                      placeholder="New laptop"
                      value={formData.goalName}
                      onChange={(e) => setFormData({ ...formData, goalName: e.target.value })}
                      className="text-foreground"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetAmount">Target Amount</Label>
                    <Input
                      id="targetAmount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                      className="text-foreground"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentAmount">Current Amount</Label>
                    <Input
                      id="currentAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.currentAmount}
                      onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                      className="text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="text-foreground"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Why are you saving for this?"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="text-foreground resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={submitting}>
                      {submitting ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                    </Button>
                    {editingId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          setFormData({
                            goalName: '',
                            targetAmount: '',
                            currentAmount: '',
                            deadline: '',
                            description: '',
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default SavingsGoalsPage;