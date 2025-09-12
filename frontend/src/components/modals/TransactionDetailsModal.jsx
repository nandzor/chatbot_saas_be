import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription
} from '@/components/ui';
import {
  X,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  CreditCard,
  Building2,
  DollarSign,
  Calendar,
  User,
  FileText,
  Shield,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

const TransactionDetailsModal = ({ transaction, isOpen, onClose, onRefresh }) => {
  const [copiedField, setCopiedField] = useState(null);

  // Format currency
  const formatCurrency = useCallback((amount, currency = 'IDR') => {
    if (!amount) return '-';

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'IDR' ? 0 : 2,
      maximumFractionDigits: currency === 'IDR' ? 0 : 2
    }).format(amount);
  }, []);

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, []);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
    }
  }, []);

  // Get status badge
  const getStatusBadge = useCallback((status) => {
    const statusConfig = {
      completed: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Completed' },
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      processing: { icon: RefreshCw, color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      failed: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Failed' },
      refunded: { icon: TrendingDown, color: 'bg-gray-100 text-gray-800', label: 'Refunded' },
      partially_refunded: { icon: TrendingDown, color: 'bg-orange-100 text-orange-800', label: 'Partially Refunded' },
      cancelled: { icon: XCircle, color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    };

    const config = statusConfig[status] || { icon: AlertCircle, color: 'bg-gray-100 text-gray-800', label: status };
    const IconComponent = config.icon;

    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  }, []);

  // Get payment method icon
  const getPaymentMethodIcon = useCallback((method) => {
    const iconMap = {
      credit_card: CreditCard,
      debit_card: CreditCard,
      bank_transfer: Building2,
      e_wallet: CreditCard,
      virtual_account: Building2,
      qris: CreditCard
    };

    return iconMap[method] || CreditCard;
  }, []);

  if (!transaction) return null;

  const PaymentMethodIcon = getPaymentMethodIcon(transaction.payment_method);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <PaymentMethodIcon className="w-5 h-5" />
                Transaction Details
              </DialogTitle>
              <DialogDescription>
                Transaction ID: {transaction.transaction_id}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Status Alert */}
          {transaction.status === 'failed' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This transaction failed. {transaction.gateway_message && `Reason: ${transaction.gateway_message}`}
              </AlertDescription>
            </Alert>
          )}

          {transaction.status === 'pending' && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                This transaction is pending. Please wait for payment confirmation.
              </AlertDescription>
            </Alert>
          )}

          {/* Main Transaction Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Transaction Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </div>
                {transaction.net_amount && transaction.net_amount !== transaction.amount && (
                  <div className="text-sm text-gray-500 mt-1">
                    Net: {formatCurrency(transaction.net_amount, transaction.currency)}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
              </CardHeader>
              <CardContent>
                {getStatusBadge(transaction.status)}
                {transaction.gateway_status && (
                  <div className="text-sm text-gray-500 mt-2">
                    Gateway: {transaction.gateway_status}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <PaymentMethodIcon className="w-4 h-4 text-gray-500" />
                  <span className="capitalize">
                    {transaction.payment_method?.replace('_', ' ')}
                  </span>
                </div>
                {transaction.payment_gateway && (
                  <div className="text-sm text-gray-500 mt-1">
                    via {transaction.payment_gateway}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Information Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payment">Payment Details</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Organization Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">Organization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Name:</span>
                      <span className="font-medium">{transaction.organization?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Slug:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{transaction.organization?.slug || 'N/A'}</span>
                        {transaction.organization?.slug && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(transaction.organization.slug, 'org-slug')}
                          >
                            {copiedField === 'org-slug' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Subscription Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">Subscription</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Plan:</span>
                      <span className="font-medium">
                        {transaction.subscription?.plan?.display_name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Tier:</span>
                      <span className="font-medium">
                        {transaction.subscription?.plan?.tier || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Billing Cycle:</span>
                      <span className="font-medium">
                        {transaction.subscription?.billing_cycle || 'N/A'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Invoice Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">Invoice</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Invoice Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {transaction.invoice?.invoice_number || 'N/A'}
                        </span>
                        {transaction.invoice?.invoice_number && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(transaction.invoice.invoice_number, 'invoice-number')}
                          >
                            {copiedField === 'invoice-number' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Status:</span>
                      <Badge variant="outline">
                        {transaction.invoice?.status || 'N/A'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Reference Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">Reference</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Transaction ID:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{transaction.transaction_id}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(transaction.transaction_id, 'transaction-id')}
                        >
                          {copiedField === 'transaction-id' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                    {transaction.external_transaction_id && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">External ID:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{transaction.external_transaction_id}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(transaction.external_transaction_id, 'external-id')}
                          >
                            {copiedField === 'external-id' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>
                    )}
                    {transaction.reference_number && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Reference:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{transaction.reference_number}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(transaction.reference_number, 'reference-number')}
                          >
                            {copiedField === 'reference-number' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Payment Details Tab */}
            <TabsContent value="payment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Amount Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">Amount Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Gross Amount:</span>
                      <span className="font-medium">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </span>
                    </div>
                    {transaction.net_amount && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Net Amount:</span>
                        <span className="font-medium">
                          {formatCurrency(transaction.net_amount, transaction.currency)}
                        </span>
                      </div>
                    )}
                    {transaction.refund_amount && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Refund Amount:</span>
                        <span className="font-medium text-red-600">
                          -{formatCurrency(transaction.refund_amount, transaction.currency)}
                        </span>
                      </div>
                    )}
                    {transaction.currency_original && transaction.currency_original !== transaction.currency && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Original Amount:</span>
                        <span className="font-medium">
                          {formatCurrency(transaction.amount_original, transaction.currency_original)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Fee Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">Fee Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {transaction.gateway_fee && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Gateway Fee:</span>
                        <span className="font-medium">
                          {formatCurrency(transaction.gateway_fee, transaction.currency)}
                        </span>
                      </div>
                    )}
                    {transaction.platform_fee && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Platform Fee:</span>
                        <span className="font-medium">
                          {formatCurrency(transaction.platform_fee, transaction.currency)}
                        </span>
                      </div>
                    )}
                    {transaction.processing_fee && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Processing Fee:</span>
                        <span className="font-medium">
                          {formatCurrency(transaction.processing_fee, transaction.currency)}
                        </span>
                      </div>
                    )}
                    {transaction.tax_amount && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Tax:</span>
                        <span className="font-medium">
                          {formatCurrency(transaction.tax_amount, transaction.currency)}
                        </span>
                      </div>
                    )}
                    {transaction.total_fees && (
                      <div className="flex items-center justify-between border-t pt-2">
                        <span className="text-sm font-medium text-gray-700">Total Fees:</span>
                        <span className="font-bold">
                          {formatCurrency(transaction.total_fees, transaction.currency)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Method Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Method:</span>
                      <span className="font-medium capitalize">
                        {transaction.payment_method?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Gateway:</span>
                      <span className="font-medium">{transaction.payment_gateway || 'N/A'}</span>
                    </div>
                    {transaction.payment_channel && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Channel:</span>
                        <span className="font-medium">{transaction.payment_channel}</span>
                      </div>
                    )}
                    {transaction.payment_type && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Type:</span>
                        <span className="font-medium capitalize">
                          {transaction.payment_type.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Card/Account Details */}
                {(transaction.card_last_four || transaction.account_name) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-gray-600">Card/Account Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {transaction.card_last_four && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Card Last 4:</span>
                          <span className="font-mono text-sm">**** {transaction.card_last_four}</span>
                        </div>
                      )}
                      {transaction.card_brand && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Card Brand:</span>
                          <span className="font-medium">{transaction.card_brand}</span>
                        </div>
                      )}
                      {transaction.account_name && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Account Name:</span>
                          <span className="font-medium">{transaction.account_name}</span>
                        </div>
                      )}
                      {transaction.account_number_masked && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Account Number:</span>
                          <span className="font-mono text-sm">{transaction.account_number_masked}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Transaction Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Transaction Created</div>
                        <div className="text-xs text-gray-500">{formatDate(transaction.created_at)}</div>
                      </div>
                    </div>

                    {transaction.initiated_at && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Payment Initiated</div>
                          <div className="text-xs text-gray-500">{formatDate(transaction.initiated_at)}</div>
                        </div>
                      </div>
                    )}

                    {transaction.authorized_at && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Payment Authorized</div>
                          <div className="text-xs text-gray-500">{formatDate(transaction.authorized_at)}</div>
                        </div>
                      </div>
                    )}

                    {transaction.captured_at && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Payment Captured</div>
                          <div className="text-xs text-gray-500">{formatDate(transaction.captured_at)}</div>
                        </div>
                      </div>
                    )}

                    {transaction.settled_at && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Payment Settled</div>
                          <div className="text-xs text-gray-500">{formatDate(transaction.settled_at)}</div>
                        </div>
                      </div>
                    )}

                    {transaction.failed_at && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Payment Failed</div>
                          <div className="text-xs text-gray-500">{formatDate(transaction.failed_at)}</div>
                        </div>
                      </div>
                    )}

                    {transaction.refunded_at && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Payment Refunded</div>
                          <div className="text-xs text-gray-500">{formatDate(transaction.refunded_at)}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {transaction.processing_time && (
                    <div className="pt-4 border-t">
                      <div className="text-sm font-medium text-gray-600">Processing Time</div>
                      <div className="text-lg font-bold text-gray-900">
                        {transaction.processing_time_human || `${transaction.processing_time}s`}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Technical Tab */}
            <TabsContent value="technical" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Security & Risk */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">Security & Risk</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {transaction.fraud_score && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Fraud Score:</span>
                        <Badge variant={transaction.fraud_score >= 0.7 ? 'destructive' : 'secondary'}>
                          {(transaction.fraud_score * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    )}
                    {transaction.risk_assessment && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Risk Level:</span>
                        <Badge variant="outline">
                          {transaction.risk_assessment.level || 'N/A'}
                        </Badge>
                      </div>
                    )}
                    {transaction.is_high_risk && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">High Risk:</span>
                        <Badge variant="destructive">Yes</Badge>
                      </div>
                    )}
                    {transaction.ip_address && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">IP Address:</span>
                        <span className="font-mono text-sm">{transaction.ip_address}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Gateway Response */}
                {transaction.gateway_response && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-gray-600">Gateway Response</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                        {JSON.stringify(transaction.gateway_response, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Metadata */}
                {transaction.metadata && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-gray-600">Metadata</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                        {JSON.stringify(transaction.metadata, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Notes */}
                {transaction.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-gray-600">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{transaction.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailsModal;
