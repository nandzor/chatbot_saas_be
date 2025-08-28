<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class PaymentTransactionCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'pagination' => [
                'current_page' => $this->currentPage(),
                'last_page' => $this->lastPage(),
                'per_page' => $this->perPage(),
                'total' => $this->total(),
                'from' => $this->firstItem(),
                'to' => $this->lastItem(),
                'has_more_pages' => $this->hasMorePages(),
            ],
            'meta' => [
                'total_transactions' => $this->total(),
                'total_amount' => $this->collection->sum('amount'),
                'successful_transactions' => $this->collection->where('status', 'completed')->count(),
                'failed_transactions' => $this->collection->whereIn('status', ['failed', 'cancelled'])->count(),
                'pending_transactions' => $this->collection->whereIn('status', ['pending', 'processing'])->count(),
                'refunded_transactions' => $this->collection->where('status', 'refunded')->count(),
            ],
        ];
    }
}
