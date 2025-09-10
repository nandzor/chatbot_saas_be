<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\BillingInvoiceResource;
use App\Services\BillingInvoiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BillingInvoiceController extends BaseApiController
{
    protected BillingInvoiceService $billingInvoiceService;

    public function __construct(BillingInvoiceService $billingInvoiceService)
    {
        $this->billingInvoiceService = $billingInvoiceService;
    }

    /**
     * Get all invoices with filters and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'status', 'organization_id', 'subscription_id', 'billing_cycle',
                'currency', 'date_from', 'date_to', 'amount_min', 'amount_max', 'search'
            ]);

            $perPage = $request->get('per_page', 15);
            $invoices = $this->billingInvoiceService->getInvoices($filters, $perPage);

            return $this->successResponse(
                'Daftar invoice berhasil diambil',
                BillingInvoiceResource::collection($invoices)->response()->getData(true)
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Gagal mengambil daftar invoice',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Create a new invoice.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'organization_id' => 'required|uuid|exists:organizations,id',
                'subscription_id' => 'required|uuid|exists:subscriptions,id',
                'invoice_date' => 'required|date',
                'due_date' => 'required|date|after:invoice_date',
                'subtotal' => 'required|numeric|min:0',
                'tax_amount' => 'required|numeric|min:0',
                'total_amount' => 'required|numeric|min:0',
                'currency' => 'required|string|size:3',
                'billing_cycle' => 'required|string|in:monthly,yearly',
                'period_start' => 'required|date',
                'period_end' => 'required|date|after:period_start',
                'customer_name' => 'required|string|max:255',
                'customer_email' => 'required|email|max:255',
                'customer_address' => 'nullable|string|max:500',
                'customer_phone' => 'nullable|string|max:20',
                'notes' => 'nullable|string|max:1000',
            ]);

            $data = $request->validated();
            $data['invoice_number'] = $this->billingInvoiceService->generateInvoiceNumber();
            $data['status'] = 'draft';

            $invoice = $this->billingInvoiceService->createInvoice($data);

            return $this->createdResponse(
                new BillingInvoiceResource($invoice),
                'Invoice berhasil dibuat'
            );
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Gagal membuat invoice',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Get invoice by ID.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $invoice = $this->billingInvoiceService->getInvoiceById($id);

            if (!$invoice) {
                return $this->notFoundResponse('Invoice tidak ditemukan');
            }

            return $this->successResponse(
                'Detail invoice berhasil diambil',
                new BillingInvoiceResource($invoice)
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Gagal mengambil detail invoice',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Update an invoice.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'invoice_date' => 'nullable|date',
                'due_date' => 'nullable|date|after:invoice_date',
                'subtotal' => 'nullable|numeric|min:0',
                'tax_amount' => 'nullable|numeric|min:0',
                'total_amount' => 'nullable|numeric|min:0',
                'currency' => 'nullable|string|size:3',
                'billing_cycle' => 'nullable|string|in:monthly,yearly',
                'period_start' => 'nullable|date',
                'period_end' => 'nullable|date|after:period_start',
                'customer_name' => 'nullable|string|max:255',
                'customer_email' => 'nullable|email|max:255',
                'customer_address' => 'nullable|string|max:500',
                'customer_phone' => 'nullable|string|max:20',
                'notes' => 'nullable|string|max:1000',
            ]);

            $invoice = $this->billingInvoiceService->updateInvoice($id, $request->validated());

            if (!$invoice) {
                return $this->notFoundResponse('Invoice tidak ditemukan');
            }

            return $this->successResponse(
                'Invoice berhasil diperbarui',
                new BillingInvoiceResource($invoice)
            );
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Gagal memperbarui invoice',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Mark invoice as paid.
     */
    public function markAsPaid(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'payment_reference' => 'nullable|string|max:255',
                'payment_method' => 'nullable|string|max:50',
                'payment_gateway' => 'nullable|string|max:50',
            ]);

            $invoice = $this->billingInvoiceService->markAsPaid($id, $request->validated());

            if (!$invoice) {
                return $this->notFoundResponse('Invoice tidak ditemukan');
            }

            return $this->successResponse(
                'Invoice berhasil ditandai sebagai dibayar',
                new BillingInvoiceResource($invoice)
            );
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Gagal menandai invoice sebagai dibayar',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Mark invoice as overdue.
     */
    public function markAsOverdue(string $id): JsonResponse
    {
        try {
            $invoice = $this->billingInvoiceService->markAsOverdue($id);

            if (!$invoice) {
                return $this->notFoundResponse('Invoice tidak ditemukan');
            }

            return $this->successResponse(
                'Invoice berhasil ditandai sebagai overdue',
                new BillingInvoiceResource($invoice)
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Gagal menandai invoice sebagai overdue',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Cancel an invoice.
     */
    public function cancel(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'reason' => 'nullable|string|max:500',
            ]);

            $invoice = $this->billingInvoiceService->cancelInvoice($id, $request->get('reason'));

            if (!$invoice) {
                return $this->notFoundResponse('Invoice tidak ditemukan');
            }

            return $this->successResponse(
                'Invoice berhasil dibatalkan',
                new BillingInvoiceResource($invoice)
            );
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Gagal membatalkan invoice',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Get organization invoices.
     */
    public function getOrganizationInvoices(Request $request, string $organizationId): JsonResponse
    {
        try {
            $filters = $request->only([
                'status', 'billing_cycle', 'currency', 'date_from', 'date_to'
            ]);

            $invoices = $this->billingInvoiceService->getOrganizationInvoices($organizationId, $filters);

            return $this->successResponse(
                'Daftar invoice organisasi berhasil diambil',
                BillingInvoiceResource::collection($invoices)
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Gagal mengambil daftar invoice organisasi',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Get subscription invoices.
     */
    public function getSubscriptionInvoices(string $subscriptionId): JsonResponse
    {
        try {
            $invoices = $this->billingInvoiceService->getSubscriptionInvoices($subscriptionId);

            return $this->successResponse(
                'Daftar invoice berlangganan berhasil diambil',
                BillingInvoiceResource::collection($invoices)
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Gagal mengambil daftar invoice berlangganan',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Get overdue invoices.
     */
    public function getOverdueInvoices(): JsonResponse
    {
        try {
            $invoices = $this->billingInvoiceService->getOverdueInvoices();

            return $this->successResponse(
                'Daftar invoice overdue berhasil diambil',
                BillingInvoiceResource::collection($invoices)
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Gagal mengambil daftar invoice overdue',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Get upcoming invoices.
     */
    public function getUpcomingInvoices(): JsonResponse
    {
        try {
            $invoices = $this->billingInvoiceService->getUpcomingInvoices();

            return $this->successResponse(
                'Daftar invoice yang akan jatuh tempo berhasil diambil',
                BillingInvoiceResource::collection($invoices)
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Gagal mengambil daftar invoice yang akan jatuh tempo',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Get invoice statistics.
     */
    public function getStatistics(Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'organization_id', 'subscription_id', 'billing_cycle',
                'currency', 'date_from', 'date_to'
            ]);

            $statistics = $this->billingInvoiceService->getInvoiceStatistics($filters);

            return $this->successResponse(
                'Statistik invoice berhasil diambil',
                $statistics
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Gagal mengambil statistik invoice',
                $e->getMessage(),
                500
            );
        }
    }
}
