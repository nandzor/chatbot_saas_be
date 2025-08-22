import React, { useState } from 'react';
import { useParams, NavLink, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  CreditCard, 
  Settings, 
  MessageSquare,
  BookOpen,
  Activity,
  Calendar,
  Mail
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import ClientOverview from '@/features/client/ClientOverview';
import ClientUsers from '@/features/client/ClientUsers';
import ClientBilling from '@/features/client/ClientBilling';
import ClientWorkflows from '@/features/client/ClientWorkflows';
import ClientCommunication from '@/features/client/ClientCommunication';
import ClientNotes from '@/features/client/ClientNotes';
import ClientSuccessPlays from '@/features/client/ClientSuccessPlays';

const ClientLayout = () => {
  const { clientId } = useParams();
  const location = useLocation();
  
  // Sample client data - in real app this would be fetched based on clientId
  const [clientData] = useState({
    id: clientId,
    name: 'ABC Corporation',
    plan: 'Enterprise',
    status: 'active',
    healthScore: 92,
    mrr: 2500000,
    renewalDate: '2024-12-15',
    csm: 'Sarah Johnson'
  });

  // Determine which component to render based on current path
  const getCurrentComponent = () => {
    const path = location.pathname;
    if (path.endsWith('/users')) {
      return <ClientUsers clientData={clientData} />;
    } else if (path.endsWith('/billing')) {
      return <ClientBilling clientData={clientData} />;
    } else if (path.endsWith('/workflows')) {
      return <ClientWorkflows clientData={clientData} />;
    } else if (path.endsWith('/communication')) {
      return <ClientCommunication clientData={clientData} />;
    } else if (path.endsWith('/notes')) {
      return <ClientNotes clientData={clientData} />;
    } else if (path.endsWith('/success-plays')) {
      return <ClientSuccessPlays clientData={clientData} />;
    } else {
      return <ClientOverview clientData={clientData} />;
    }
  };

  const clientNavigation = [
    { 
      name: 'Overview', 
      href: `/superadmin/clients/${clientId}`, 
      icon: BarChart3,
      end: true 
    },
    { 
      name: 'Users & Agents', 
      href: `/superadmin/clients/${clientId}/users`, 
      icon: Users 
    },
    { 
      name: 'Billing', 
      href: `/superadmin/clients/${clientId}/billing`, 
      icon: CreditCard 
    },
    { 
      name: 'Workflows', 
      href: `/superadmin/clients/${clientId}/workflows`, 
      icon: Settings 
    },
    { 
      name: 'Communication', 
      href: `/superadmin/clients/${clientId}/communication`, 
      icon: MessageSquare 
    },
    { 
      name: 'Notes', 
      href: `/superadmin/clients/${clientId}/notes`, 
      icon: BookOpen 
    },
    { 
      name: 'Success Plays', 
      href: `/superadmin/clients/${clientId}/success-plays`, 
      icon: Activity 
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <NavLink 
          to="/superadmin/clients"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Organizations
        </NavLink>
      </div>

      {/* Client Info Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{clientData.name}</h1>
              <Badge className={getStatusColor(clientData.status)}>
                {clientData.status}
              </Badge>
              <Badge variant="outline">{clientData.plan}</Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm font-medium text-gray-500">Health Score</div>
                <div className={`text-2xl font-bold ${getHealthScoreColor(clientData.healthScore)}`}>
                  {clientData.healthScore}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">MRR</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${clientData.mrr.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Renewal Date</div>
                <div className="text-2xl font-bold text-gray-900">
                  {clientData.renewalDate}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">CSM</div>
                <div className="text-2xl font-bold text-gray-900">
                  {clientData.csm}
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Contact
            </Button>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            <Button>
              <Activity className="w-4 h-4 mr-2" />
              Run Playbook
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8">
            {clientNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.end}
                className={({ isActive }) =>
                  `${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`
                }
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {getCurrentComponent()}
        </div>
      </div>
    </div>
  );
};

export default ClientLayout;
