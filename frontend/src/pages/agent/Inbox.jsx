import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';

const AgentInbox = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agent Inbox</h1>
        <p className="text-gray-600">Manage customer conversations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Inbox</CardTitle>
          <CardDescription>
            This page will contain the agent inbox functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Agent inbox features will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentInbox;
