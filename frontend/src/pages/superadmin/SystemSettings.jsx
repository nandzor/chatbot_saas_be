import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';

const SystemSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600">Configure system-wide settings and parameters</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            This page will contain system configuration options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            System settings and configuration features will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
