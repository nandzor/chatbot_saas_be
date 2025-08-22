import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';

const AgentProfile = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agent Profile</h1>
        <p className="text-gray-600">Manage your agent profile and settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Profile</CardTitle>
          <CardDescription>
            This page will contain agent profile management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Agent profile features will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentProfile;
