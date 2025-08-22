<?php

namespace Database\Factories;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Organization>
 */
class OrganizationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $businessTypes = [
            'PT', 'CV', 'UD', 'Koperasi', 'Yayasan', 'Perusahaan Perorangan',
            'Firma', 'Commanditaire Vennootschap', 'Perseroan Terbatas'
        ];
        
        $industries = [
            'Teknologi Informasi', 'Keuangan & Perbankan', 'E-commerce', 'Manufaktur',
            'Jasa Konsultan', 'Pendidikan', 'Kesehatan', 'Retail', 'Logistik',
            'Properti', 'Media & Hiburan', 'Makanan & Minuman', 'Otomotif',
            'Fashion & Beauty', 'Travel & Hospitality', 'Pertanian', 'Pertambangan'
        ];
        
        $companySizes = [
            '1-10 karyawan', '11-50 karyawan', '51-200 karyawan',
            '201-500 karyawan', '501-1000 karyawan', '1000+ karyawan'
        ];
        
        $timezones = [
            'Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura', 'Asia/Shanghai',
            'Asia/Singapore', 'Asia/Tokyo', 'America/New_York', 'Europe/London'
        ];
        
        $locales = ['id', 'en', 'ja', 'zh', 'ko', 'es', 'fr', 'de'];
        $currencies = ['IDR', 'USD', 'EUR', 'JPY', 'SGD', 'CNY'];
        
        $businessType = $this->faker->randomElement($businessTypes);
        $industry = $this->faker->randomElement($industries);
        $companySize = $this->faker->randomElement($companySizes);
        $timezone = $this->faker->randomElement($timezones);
        $locale = $this->faker->randomElement($locales);
        $currency = $this->faker->randomElement($currencies);
        
        // Generate business hours based on industry
        $businessHours = $this->generateBusinessHours($industry);
        
        // Generate theme config
        $themeConfig = [
            'primaryColor' => $this->faker->hexColor(),
            'secondaryColor' => $this->faker->hexColor(),
            'darkMode' => $this->faker->boolean(20),
            'fontFamily' => $this->faker->randomElement(['Inter', 'Roboto', 'Open Sans', 'Poppins']),
            'borderRadius' => $this->faker->randomElement(['none', 'sm', 'md', 'lg', 'xl']),
        ];
        
        // Generate branding config
        $brandingConfig = [
            'logo' => [
                'url' => $this->faker->imageUrl(200, 200, 'business'),
                'alt' => 'Company Logo',
                'width' => 200,
                'height' => 200
            ],
            'favicon' => [
                'url' => $this->faker->imageUrl(32, 32, 'business'),
                'alt' => 'Favicon',
                'width' => 32,
                'height' => 32
            ],
            'colors' => [
                'primary' => $this->faker->hexColor(),
                'secondary' => $this->faker->hexColor(),
                'accent' => $this->faker->hexColor(),
                'neutral' => $this->faker->hexColor()
            ]
        ];
        
        // Generate feature flags based on subscription
        $featureFlags = [
            'ai_enabled' => $this->faker->boolean(80),
            'multi_language' => $this->faker->boolean(60),
            'advanced_analytics' => $this->faker->boolean(70),
            'custom_branding' => $this->faker->boolean(50),
            'api_access' => $this->faker->boolean(60),
            'webhook_support' => $this->faker->boolean(70),
            'sso_enabled' => $this->faker->boolean(30),
            'priority_support' => $this->faker->boolean(40)
        ];
        
        // Generate UI preferences
        $uiPreferences = [
            'dashboard_layout' => $this->faker->randomElement(['grid', 'list', 'compact']),
            'sidebar_collapsed' => $this->faker->boolean(30),
            'notifications_enabled' => $this->faker->boolean(90),
            'auto_refresh' => $this->faker->boolean(60),
            'table_density' => $this->faker->randomElement(['compact', 'comfortable', 'spacious']),
            'show_help_tooltips' => $this->faker->boolean(70)
        ];
        
        // Generate contact info
        $contactInfo = [
            'phone' => $this->faker->phoneNumber(),
            'email' => $this->faker->companyEmail(),
            'address' => [
                'street' => $this->faker->streetAddress(),
                'city' => $this->faker->city(),
                'state' => $this->faker->state(),
                'postal_code' => $this->faker->postcode(),
                'country' => 'Indonesia'
            ],
            'working_hours' => $businessHours,
            'emergency_contact' => $this->faker->phoneNumber()
        ];
        
        // Generate social media
        $socialMedia = [
            'website' => $this->faker->url(),
            'facebook' => $this->faker->optional(0.7)->url(),
            'instagram' => $this->faker->optional(0.8)->url(),
            'twitter' => $this->faker->optional(0.6)->url(),
            'linkedin' => $this->faker->optional(0.7)->url(),
            'youtube' => $this->faker->optional(0.4)->url(),
            'tiktok' => $this->faker->optional(0.5)->url()
        ];
        
        // Generate security settings
        $securitySettings = [
            'password_policy' => [
                'min_length' => $this->faker->randomElement([8, 10, 12]),
                'require_special' => $this->faker->boolean(80),
                'require_numbers' => $this->faker->boolean(90),
                'require_uppercase' => $this->faker->boolean(70),
                'require_lowercase' => $this->faker->boolean(70),
                'expire_days' => $this->faker->randomElement([90, 180, 365])
            ],
            'session_timeout' => $this->faker->randomElement([1800, 3600, 7200, 14400]), // 30min to 4 hours
            'ip_whitelist' => $this->faker->optional(0.3)->randomElements([
                '192.168.1.0/24', '10.0.0.0/8', '172.16.0.0/12'
            ], $this->faker->numberBetween(1, 3)),
            'two_factor_required' => $this->faker->boolean(40),
            'max_login_attempts' => $this->faker->randomElement([3, 5, 10]),
            'lockout_duration' => $this->faker->randomElement([15, 30, 60, 120]) // minutes
        ];
        
        // Generate current usage
        $currentUsage = [
            'messages' => $this->faker->numberBetween(0, 10000),
            'ai_requests' => $this->faker->numberBetween(0, 5000),
            'api_calls' => $this->faker->numberBetween(0, 50000),
            'storage_mb' => $this->faker->numberBetween(0, 10000),
            'active_agents' => $this->faker->numberBetween(0, 20),
            'active_channels' => $this->faker->numberBetween(0, 10)
        ];
        
        // Generate settings
        $settings = [
            'auto_backup' => $this->faker->boolean(80),
            'backup_frequency' => $this->faker->randomElement(['daily', 'weekly', 'monthly']),
            'retention_days' => $this->faker->randomElement([30, 90, 180, 365]),
            'maintenance_mode' => false,
            'debug_mode' => $this->faker->boolean(20),
            'log_level' => $this->faker->randomElement(['error', 'warn', 'info', 'debug']),
            'max_file_size' => $this->faker->randomElement([5, 10, 25, 50]), // MB
            'allowed_file_types' => ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx']
        ];
        
        // Generate metadata
        $metadata = [
            'source' => $this->faker->randomElement(['direct', 'referral', 'advertising', 'partnership', 'organic']),
            'campaign' => $this->faker->optional(0.6)->word(),
            'utm_source' => $this->faker->optional(0.5)->word(),
            'utm_medium' => $this->faker->optional(0.5)->word(),
            'utm_campaign' => $this->faker->optional(0.5)->word(),
            'notes' => $this->faker->optional(0.3)->sentence(),
            'tags' => $this->faker->optional(0.7)->words($this->faker->numberBetween(1, 5))
        ];
        
        return [
            'org_code' => strtoupper($this->faker->unique()->bothify('ORG-####')),
            'name' => $this->faker->company(),
            'display_name' => $this->faker->company(),
            'email' => $this->faker->companyEmail(),
            'phone' => $this->faker->phoneNumber(),
            'address' => $this->faker->address(),
            'logo_url' => $this->faker->imageUrl(200, 200, 'business'),
            'favicon_url' => $this->faker->imageUrl(32, 32, 'business'),
            'website' => $this->faker->url(),
            'tax_id' => $this->faker->optional(0.8)->numerify('##.###.###-#-###.###'),
            'business_type' => $businessType,
            'industry' => $industry,
            'company_size' => $companySize,
            'timezone' => $timezone,
            'locale' => $locale,
            'currency' => $currency,
            
            // Subscription & Billing
            'subscription_plan_id' => SubscriptionPlan::factory(),
            'subscription_status' => $this->faker->randomElement(['trial', 'active', 'suspended', 'cancelled']),
            'trial_ends_at' => $this->faker->optional(0.3)->dateTimeBetween('now', '+30 days'),
            'subscription_starts_at' => $this->faker->optional(0.7)->dateTimeBetween('-1 year', 'now'),
            'subscription_ends_at' => $this->faker->optional(0.6)->dateTimeBetween('now', '+1 year'),
            'billing_cycle' => $this->faker->randomElement(['monthly', 'quarterly', 'yearly']),
            
            // Usage Tracking
            'current_usage' => $currentUsage,
            
            // UI/UX Configuration
            'theme_config' => $themeConfig,
            'branding_config' => $brandingConfig,
            'feature_flags' => $featureFlags,
            'ui_preferences' => $uiPreferences,
            
            // Business Configuration
            'business_hours' => $businessHours,
            'contact_info' => $contactInfo,
            'social_media' => $socialMedia,
            
            // Security Settings
            'security_settings' => $securitySettings,
            
            // API Configuration
            'api_enabled' => $this->faker->boolean(60),
            'webhook_url' => $this->faker->optional(0.4)->url(),
            'webhook_secret' => $this->faker->optional(0.4)->uuid(),
            
            // System fields
            'settings' => $settings,
            'metadata' => $metadata,
            'status' => 'active',
        ];
    }
    
    /**
     * Generate business hours based on industry
     */
    private function generateBusinessHours(string $industry): array
    {
        $timezone = 'Asia/Jakarta';
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        $businessHours = ['timezone' => $timezone, 'days' => []];
        
        foreach ($days as $day) {
            if ($day === 'sunday' && $this->faker->boolean(30)) {
                // Some businesses are closed on Sunday
                $businessHours['days'][$day] = ['closed' => true];
            } elseif ($day === 'saturday' && $this->faker->boolean(40)) {
                // Saturday might have shorter hours
                $businessHours['days'][$day] = [
                    'open' => '09:00',
                    'close' => '15:00',
                    'closed' => false
                ];
            } else {
                // Regular business days
                $openHour = $this->faker->randomElement(['08:00', '09:00', '10:00']);
                $closeHour = $this->faker->randomElement(['17:00', '18:00', '19:00', '20:00']);
                
                $businessHours['days'][$day] = [
                    'open' => $openHour,
                    'close' => $closeHour,
                    'closed' => false
                ];
            }
        }
        
        return $businessHours;
    }
    
    /**
     * Indicate that the organization is in trial status.
     */
    public function trial(): static
    {
        return $this->state(fn (array $attributes) => [
            'subscription_status' => 'trial',
            'trial_ends_at' => now()->addDays($this->faker->numberBetween(7, 30)),
            'subscription_starts_at' => null,
            'subscription_ends_at' => null,
        ]);
    }
    
    /**
     * Indicate that the organization is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'subscription_status' => 'active',
            'trial_ends_at' => null,
            'subscription_starts_at' => now()->subDays($this->faker->numberBetween(30, 365)),
            'subscription_ends_at' => now()->addDays($this->faker->numberBetween(30, 365)),
        ]);
    }
    
    /**
     * Indicate that the organization is suspended.
     */
    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'subscription_status' => 'suspended',
            'trial_ends_at' => now()->subDays($this->faker->numberBetween(1, 30)),
            'subscription_starts_at' => now()->subDays($this->faker->numberBetween(60, 365)),
            'subscription_ends_at' => now()->subDays($this->faker->numberBetween(1, 30)),
        ]);
    }
    
    /**
     * Indicate that the organization is in the technology industry.
     */
    public function technology(): static
    {
        return $this->state(fn (array $attributes) => [
            'industry' => 'Teknologi Informasi',
            'business_type' => 'PT',
            'company_size' => $this->faker->randomElement(['11-50 karyawan', '51-200 karyawan', '201-500 karyawan']),
            'feature_flags' => [
                'ai_enabled' => true,
                'multi_language' => true,
                'advanced_analytics' => true,
                'custom_branding' => true,
                'api_access' => true,
                'webhook_support' => true,
                'sso_enabled' => true,
                'priority_support' => true
            ]
        ]);
    }
    
    /**
     * Indicate that the organization is in the financial industry.
     */
    public function financial(): static
    {
        return $this->state(fn (array $attributes) => [
            'industry' => 'Keuangan & Perbankan',
            'business_type' => 'PT',
            'company_size' => $this->faker->randomElement(['51-200 karyawan', '201-500 karyawan', '501-1000 karyawan']),
            'security_settings' => [
                'password_policy' => [
                    'min_length' => 12,
                    'require_special' => true,
                    'require_numbers' => true,
                    'require_uppercase' => true,
                    'require_lowercase' => true,
                    'expire_days' => 90
                ],
                'session_timeout' => 1800, // 30 minutes
                'two_factor_required' => true,
                'max_login_attempts' => 3,
                'lockout_duration' => 60
            ]
        ]);
    }
    
    /**
     * Indicate that the organization is a startup.
     */
    public function startup(): static
    {
        return $this->state(fn (array $attributes) => [
            'company_size' => '1-10 karyawan',
            'subscription_status' => 'trial',
            'trial_ends_at' => now()->addDays(30),
            'feature_flags' => [
                'ai_enabled' => true,
                'multi_language' => false,
                'advanced_analytics' => false,
                'custom_branding' => false,
                'api_access' => false,
                'webhook_support' => false,
                'sso_enabled' => false,
                'priority_support' => false
            ]
        ]);
    }
    
    /**
     * Indicate that the organization is enterprise.
     */
    public function enterprise(): static
    {
        return $this->state(fn (array $attributes) => [
            'company_size' => '1000+ karyawan',
            'subscription_status' => 'active',
            'feature_flags' => [
                'ai_enabled' => true,
                'multi_language' => true,
                'advanced_analytics' => true,
                'custom_branding' => true,
                'api_access' => true,
                'webhook_support' => true,
                'sso_enabled' => true,
                'priority_support' => true
            ],
            'security_settings' => [
                'password_policy' => [
                    'min_length' => 12,
                    'require_special' => true,
                    'require_numbers' => true,
                    'require_uppercase' => true,
                    'require_lowercase' => true,
                    'expire_days' => 90
                ],
                'session_timeout' => 1800,
                'two_factor_required' => true,
                'max_login_attempts' => 3,
                'lockout_duration' => 60
            ]
        ]);
    }
}
