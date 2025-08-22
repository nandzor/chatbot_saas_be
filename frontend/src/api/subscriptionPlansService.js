import { subscriptionPlansData, subscriptionPlansMetadata } from '../data/sampleData';

// In a real application, this would be API calls
// For now, we'll simulate saving to localStorage and provide functions for future API integration

class SubscriptionPlansService {
  constructor() {
    this.storageKey = 'subscriptionPlans';
    this.metadataKey = 'subscriptionPlansMetadata';
    this.initializeStorage();
  }

  // Initialize localStorage with default data if empty
  initializeStorage() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify(subscriptionPlansData));
    }
    if (!localStorage.getItem(this.metadataKey)) {
      localStorage.setItem(this.metadataKey, JSON.stringify(subscriptionPlansMetadata));
    }
  }

  // Get all subscription plans
  async getSubscriptionPlans() {
    try {
      const plans = localStorage.getItem(this.storageKey);
      return plans ? JSON.parse(plans) : subscriptionPlansData;
    } catch (error) {
      console.error('Error getting subscription plans:', error);
      return subscriptionPlansData;
    }
  }

  // Get subscription plans metadata
  async getMetadata() {
    try {
      const metadata = localStorage.getItem(this.metadataKey);
      return metadata ? JSON.parse(metadata) : subscriptionPlansMetadata;
    } catch (error) {
      console.error('Error getting metadata:', error);
      return subscriptionPlansMetadata;
    }
  }

  // Create new subscription plan
  async createPlan(planData) {
    try {
      const plans = await this.getSubscriptionPlans();
      const newPlan = {
        ...planData,
        id: `plan-${Date.now()}`,
        activeSubscriptions: 0,
        totalRevenue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedPlans = [...plans, newPlan];
      localStorage.setItem(this.storageKey, JSON.stringify(updatedPlans));
      
      // Update metadata
      await this.updateMetadata(updatedPlans);
      
      return newPlan;
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  }

  // Update existing subscription plan
  async updatePlan(planId, planData) {
    try {
      const plans = await this.getSubscriptionPlans();
      const updatedPlans = plans.map(plan => 
        plan.id === planId 
          ? { ...planData, id: planId, updatedAt: new Date().toISOString() }
          : plan
      );

      localStorage.setItem(this.storageKey, JSON.stringify(updatedPlans));
      
      // Update metadata
      await this.updateMetadata(updatedPlans);
      
      return updatedPlans.find(plan => plan.id === planId);
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  }

  // Delete subscription plan
  async deletePlan(planId) {
    try {
      const plans = await this.getSubscriptionPlans();
      const updatedPlans = plans.filter(plan => plan.id !== planId);
      
      localStorage.setItem(this.storageKey, JSON.stringify(updatedPlans));
      
      // Update metadata
      await this.updateMetadata(updatedPlans);
      
      return true;
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  }

  // Update metadata based on current plans
  async updateMetadata(plans) {
    try {
      const totalActiveSubscriptions = plans.reduce((sum, plan) => sum + (plan.activeSubscriptions || 0), 0);
      const totalMonthlyRevenue = plans.reduce((sum, plan) => sum + (plan.totalRevenue || 0), 0);
      
      const metadata = {
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
        totalPlans: plans.length,
        totalActiveSubscriptions,
        totalMonthlyRevenue
      };

      localStorage.setItem(this.metadataKey, JSON.stringify(metadata));
      return metadata;
    } catch (error) {
      console.error('Error updating metadata:', error);
      throw error;
    }
  }

  // Export data to JSON file (for development/testing)
  async exportToJSON() {
    try {
      const plans = await this.getSubscriptionPlans();
      const metadata = await this.getMetadata();
      
      const exportData = {
        subscriptionPlans: plans,
        metadata
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `subscription-plans-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      return exportData;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // Import data from JSON file (for development/testing)
  async importFromJSON(file) {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            if (data.subscriptionPlans && Array.isArray(data.subscriptionPlans)) {
              localStorage.setItem(this.storageKey, JSON.stringify(data.subscriptionPlans));
              if (data.metadata) {
                localStorage.setItem(this.metadataKey, JSON.stringify(data.metadata));
              }
              resolve(data);
            } else {
              reject(new Error('Invalid data format'));
            }
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsText(file);
      });
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  // Reset to default data
  async resetToDefault() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(subscriptionPlansData));
      localStorage.setItem(this.metadataKey, JSON.stringify(subscriptionPlansMetadata));
      return { plans: subscriptionPlansData, metadata: subscriptionPlansMetadata };
    } catch (error) {
      console.error('Error resetting data:', error);
      throw error;
    }
  }
}

// Create singleton instance
const subscriptionPlansService = new SubscriptionPlansService();

export default subscriptionPlansService;
