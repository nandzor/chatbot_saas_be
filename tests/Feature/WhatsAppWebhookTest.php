<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Organization;
use App\Models\Customer;
use App\Models\ChatSession;
use App\Models\Message;
use App\Models\BotPersonality;
use App\Models\ChannelConfig;

class WhatsAppWebhookTest extends TestCase
{
    use RefreshDatabase;

    protected $organization;
    protected $botPersonality;
    protected $channelConfig;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test organization
        $this->organization = Organization::factory()->create();

        // Create bot personality
        $this->botPersonality = BotPersonality::factory()->create([
            'organization_id' => $this->organization->id,
            'is_default' => true,
            'status' => 'active'
        ]);

        // Create channel config
        $this->channelConfig = ChannelConfig::factory()->create([
            'organization_id' => $this->organization->id,
            'channel' => 'whatsapp',
            'is_active' => true
        ]);
    }

    /** @test */
    public function it_creates_session_when_new_customer_sends_message()
    {
        $messageData = [
            'message' => [
                'id' => 'msg_123',
                'from' => '+6281234567890',
                'to' => '+6281234567891',
                'text' => [
                    'body' => 'Halo, saya ingin bertanya tentang produk'
                ],
                'type' => 'text',
                'timestamp' => time()
            ],
            'session' => 'test_session_123'
        ];

        $response = $this->postJson('/api/webhook/whatsapp', $messageData);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'message',
            'session_id'
        ]);

        // Assert customer was created
        $this->assertDatabaseHas('customers', [
            'phone' => '+6281234567890',
            'organization_id' => $this->organization->id
        ]);

        // Assert session was created
        $this->assertDatabaseHas('chat_sessions', [
            'organization_id' => $this->organization->id,
            'session_type' => 'customer_initiated',
            'is_active' => true
        ]);

        // Assert message was created
        $this->assertDatabaseHas('messages', [
            'sender_type' => 'customer',
            'content' => 'Halo, saya ingin bertanya tentang produk'
        ]);
    }

    /** @test */
    public function it_uses_existing_session_when_customer_has_active_session()
    {
        // Create existing customer and session
        $customer = Customer::factory()->create([
            'organization_id' => $this->organization->id,
            'phone' => '+6281234567890'
        ]);

        $existingSession = ChatSession::factory()->create([
            'organization_id' => $this->organization->id,
            'customer_id' => $customer->id,
            'is_active' => true
        ]);

        $messageData = [
            'message' => [
                'id' => 'msg_124',
                'from' => '+6281234567890',
                'to' => '+6281234567891',
                'text' => [
                    'body' => 'Pesan kedua'
                ],
                'type' => 'text',
                'timestamp' => time()
            ],
            'session' => 'test_session_123'
        ];

        $response = $this->postJson('/api/webhook/whatsapp', $messageData);

        $response->assertStatus(200);

        // Assert no new session was created
        $this->assertEquals(1, ChatSession::where('customer_id', $customer->id)->count());

        // Assert message was added to existing session
        $this->assertDatabaseHas('messages', [
            'chat_session_id' => $existingSession->id,
            'content' => 'Pesan kedua'
        ]);
    }

    /** @test */
    public function it_handles_whatsapp_business_api_format()
    {
        $messageData = [
            'entry' => [
                [
                    'changes' => [
                        [
                            'value' => [
                                'messages' => [
                                    [
                                        'id' => 'msg_125',
                                        'from' => '+6281234567890',
                                        'text' => [
                                            'body' => 'Test message'
                                        ],
                                        'type' => 'text',
                                        'timestamp' => time()
                                    ]
                                ],
                                'contacts' => [
                                    [
                                        'profile' => [
                                            'name' => 'Test User'
                                        ]
                                    ]
                                ],
                                'metadata' => [
                                    'phone_number_id' => '+6281234567891'
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ];

        $response = $this->postJson('/api/webhook/whatsapp', $messageData);

        $response->assertStatus(200);

        // Assert customer was created with name
        $this->assertDatabaseHas('customers', [
            'phone' => '+6281234567890',
            'name' => 'Test User',
            'organization_id' => $this->organization->id
        ]);
    }

    /** @test */
    public function it_detects_intent_correctly()
    {
        $messageData = [
            'message' => [
                'id' => 'msg_126',
                'from' => '+6281234567890',
                'to' => '+6281234567891',
                'text' => [
                    'body' => 'Saya butuh bantuan dengan masalah teknis'
                ],
                'type' => 'text',
                'timestamp' => time()
            ],
            'session' => 'test_session_123'
        ];

        $response = $this->postJson('/api/webhook/whatsapp', $messageData);

        $response->assertStatus(200);

        // Assert intent was detected
        $session = ChatSession::where('organization_id', $this->organization->id)->first();
        $this->assertEquals('support', $session->intent);
    }

    /** @test */
    public function it_analyzes_sentiment_correctly()
    {
        $messageData = [
            'message' => [
                'id' => 'msg_127',
                'from' => '+6281234567890',
                'to' => '+6281234567891',
                'text' => [
                    'body' => 'Terima kasih, pelayanan yang sangat baik!'
                ],
                'type' => 'text',
                'timestamp' => time()
            ],
            'session' => 'test_session_123'
        ];

        $response = $this->postJson('/api/webhook/whatsapp', $messageData);

        $response->assertStatus(200);

        // Assert sentiment was analyzed
        $session = ChatSession::where('organization_id', $this->organization->id)->first();
        $this->assertEquals('positive', $session->sentiment_analysis['overall_sentiment']);
    }
}
