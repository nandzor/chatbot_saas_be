import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
import { 
  DollarSign, 
  CreditCard, 
  Receipt,
  Download,
  Eye,
  Calendar,
  TrendingUp
} from 'lucide-react';

const ClientBilling = ({ clientData }) => {

  // Sample billing data
  const [billingData] = React.useState({
    currentSubscription: {
      plan: 'Enterprise',
      amount: 2500000,
      billingCycle: 'monthly',
      nextBilling: '2024-04-15',
      status: 'active',
      features: ['Unlimited Users', 'Advanced Analytics', 'Priority Support', 'API Access']
    },
    invoices: [
      {
        id: 'INV-001',
        date: '2024-03-15',
        amount: 2500000,
        status: 'paid',
        dueDate: '2024-03-15',
        description: 'Enterprise Plan - March 2024'
      },
      {
        id: 'INV-002',
        date: '2024-02-15',
        amount: 2500000,
        status: 'paid',
        dueDate: '2024-02-15',
        description: 'Enterprise Plan - February 2024'
      },
      {
        id: 'INV-003',
        date: '2024-01-15',
        amount: 2500000,
        status: 'paid',
        dueDate: '2024-01-15',
        description: 'Enterprise Plan - January 2024'
      }
    ],
    paymentMethods: [
      {
        id: 1,
        type: 'credit_card',
        last4: '4242',
        expiry: '12/25',
        isDefault: true
      }
    ]
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing & Subscription</h2>
          <p className="text-gray-600">Manage billing, invoices, and subscription for {clientData.name}</p>
        </div>
        <Button>
          <Receipt className="w-4 h-4 mr-2" />
          Generate Invoice
        </Button>
      </div>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>Active subscription details and next billing information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{billingData.currentSubscription.plan} Plan</h3>
                <Badge variant="green">Active</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">{formatCurrency(billingData.currentSubscription.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Billing Cycle:</span>
                  <span className="font-semibold capitalize">{billingData.currentSubscription.billingCycle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Billing:</span>
                  <span className="font-semibold">{billingData.currentSubscription.nextBilling}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Included Features</h4>
              <div className="space-y-2">
                {billingData.currentSubscription.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>Recent invoices and payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingData.invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.description}</TableCell>
                  <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Saved payment methods for automatic billing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {billingData.paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">•••• •••• •••• {method.last4}</div>
                    <div className="text-sm text-gray-500">Expires {method.expiry}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {method.isDefault && (
                    <Badge variant="green">Default</Badge>
                  )}
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              <CreditCard className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common billing tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Receipt className="w-6 h-6 mb-2" />
              <span className="font-medium">Download Invoice</span>
              <span className="text-xs text-gray-500">Get PDF copy</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Calendar className="w-6 h-6 mb-2" />
              <span className="font-medium">Change Billing</span>
              <span className="text-xs text-gray-500">Update cycle</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <TrendingUp className="w-6 h-6 mb-2" />
              <span className="font-medium">Upgrade Plan</span>
              <span className="text-xs text-gray-500">Add features</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <DollarSign className="w-6 h-6 mb-2" />
              <span className="font-medium">Payment History</span>
              <span className="text-xs text-gray-500">View all payments</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientBilling;
