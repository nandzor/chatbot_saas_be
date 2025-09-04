import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import PlanModal from './PlanModal';
import FinancialsOverview from './FinancialsOverview';
import SubscriptionPlansTab from './SubscriptionPlansTab';
import TransactionsTab from './TransactionsTab';
import { subscriptionPlansData, subscriptionPlansMetadata } from '@/data/sampleData';
import subscriptionPlansService from '@/services/subscriptionPlansService.jsx';

const Financials = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [editingPlan, setEditingPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Subscription plans data from service
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [metadata, setMetadata] = useState(subscriptionPlansMetadata);
  const [isLoading, setIsLoading] = useState(true);

  // Load subscription plans data on component mount (avoid double-call in StrictMode)
  const hasFetchedRef = useRef(false);
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [plans, planMetadata] = await Promise.all([
          subscriptionPlansService.getSubscriptionPlans(),
          subscriptionPlansService.getMetadata()
        ]);
        // Ensure plans is always an array
        console.log('Loaded plans:', plans, 'Is array:', Array.isArray(plans));
        setSubscriptionPlans(Array.isArray(plans) ? plans : []);
        setMetadata(planMetadata);
      } catch (error) {
        console.error('Error loading subscription plans:', error);
        // Fallback to sample data
        setSubscriptionPlans(subscriptionPlansData);
        setMetadata(subscriptionPlansMetadata);
      } finally {
        setIsLoading(false);
      }
    };

    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      loadData();
    }
  }, []);

  // Sample transactions data
  const [transactions] = useState([
    {
      id: 'txn-001',
      date: '2024-03-20',
      organization: 'ABC Corporation',
      orgCode: 'ABC-001',
      description: 'Enterprise Plan - March 2024',
      amount: 2500000,
      status: 'success',
      paymentMethod: 'Credit Card',
      transactionId: 'ch_1234567890'
    },
    {
      id: 'txn-002',
      date: '2024-03-20',
      organization: 'TechStart Inc',
      orgCode: 'TSI-002',
      description: 'Professional Plan - March 2024',
      amount: 1250000,
      status: 'success',
      paymentMethod: 'Bank Transfer',
      transactionId: 'tr_0987654321'
    },
    {
      id: 'txn-003',
      date: '2024-03-19',
      organization: 'Digital Agency Pro',
      orgCode: 'DAP-004',
      description: 'Professional Plan - March 2024',
      amount: 1250000,
      status: 'failed',
      paymentMethod: 'Credit Card',
      transactionId: 'ch_1122334455'
    },
    {
      id: 'txn-004',
      date: '2024-03-18',
      organization: 'StartupXYZ',
      orgCode: 'SXZ-005',
      description: 'Basic Plan - March 2024',
      amount: 500000,
      status: 'refunded',
      paymentMethod: 'Credit Card',
      transactionId: 'ch_5566778899'
    }
  ]);


  const handleTransactionAction = (action, transactionId) => {
    console.log(`${action} for transaction ${transactionId}`);
    // Implement transaction action logic here
  };

  const handleSavePlan = async (planData) => {
    console.log('Saving plan:', planData);

    try {
      if (editingPlan) {
        // Update existing plan
        console.log('Updating existing plan:', editingPlan.id, planData);
        const updatedPlan = await subscriptionPlansService.updatePlan(editingPlan.id, planData);
        setSubscriptionPlans(prevPlans => {
          const next = prevPlans.map(plan => (plan.id === editingPlan.id ? updatedPlan : plan));
          return next;
        });
      } else {
        // Create new plan
        console.log('Creating new plan:', planData);
        const newPlan = await subscriptionPlansService.createPlan(planData);
        setSubscriptionPlans(prevPlans => {
          const next = [...prevPlans, newPlan];
          return next;
        });
      }

      // Optionally refresh from BE to ensure latest data
      try {
        const freshPlans = await subscriptionPlansService.getSubscriptionPlans();
        setSubscriptionPlans(Array.isArray(freshPlans) ? freshPlans : []);
      } catch (e) {
        console.warn('Refresh plans failed, keep local state');
      }

      // Close modal and reset states
      setIsModalOpen(false);
      setEditingPlan(null);
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handleExportData = () => {
    subscriptionPlansService.exportToJSON();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Financials</h1>
        <p className="text-muted-foreground">Manage subscription plans and view transaction history</p>
      </div>

      {/* Financial Overview Cards */}
      <FinancialsOverview metadata={metadata} />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* Subscription Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <SubscriptionPlansTab
            subscriptionPlans={subscriptionPlans}
            isLoading={isLoading}
            onEditPlan={handleEditPlan}
            onCreatePlan={handleCreatePlan}
            onExportData={handleExportData}
          />
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <TransactionsTab
            transactions={transactions}
            onTransactionAction={handleTransactionAction}
          />
        </TabsContent>
      </Tabs>

      {/* Plan Modal */}
      <PlanModal
        plan={editingPlan}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSavePlan}
      />
    </div>
  );
};

export default Financials;
