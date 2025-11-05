<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Facility Resource for Mobile App
 *
 * Transforms HealthcareFacility model to match mobile app format.
 * Maps database fields to mobile-friendly JSON structure.
 */
class FacilityResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   *
   * @param Request $request
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    return [
      // Primary identification
      'id' => $this->id,
      'code' => $this->code ?? "FAC-{$this->id}",
      'name' => $this->name,

      // Classification
      'type' => $this->mapTypeToMobile($this->type),
      'level' => $this->level,

      // Location data (GPS coordinates)
      'latitude' => $this->latitude ? (float) $this->latitude : null,
      'longitude' => $this->longitude ? (float) $this->longitude : null,

      // Address information
      'address' => $this->address,
      'municipality' => $this->city, // Map 'city' to 'municipality' for mobile
      'city' => $this->city,
      'province' => $this->province,
      'region' => $this->region,

      // Contact information
      'contact_number' => $this->phone ?? $this->email,
      'phone' => $this->phone,
      'email' => $this->email,
      'website' => $this->website,

      // Services and capabilities
      'services' => $this->services ?? [],
      'emergency_services' => $this->has_emergency ?? false,
      'open_24_hours' => $this->is_24_7 ?? false,
      'accepts_philhealth' => $this->is_philhealth_accredited ?? false,

      // Capacity information
      'capacity' => $this->bed_capacity,
      'bed_capacity' => $this->bed_capacity,
      'icu_capacity' => $this->icu_capacity,
      'current_bed_availability' => $this->current_bed_availability,

      // Operational details
      'operating_hours' => $this->operating_hours,
      'is_public' => $this->is_public ?? true,
      'is_doh_accredited' => $this->is_doh_accredited ?? false,
      'accreditations' => $this->accreditations ?? [],

      // Referral network
      'accepts_referrals' => $this->accepts_referrals ?? true,
      'average_response_time_hours' => $this->average_response_time_hours,
      'preferred_referral_types' => $this->preferred_referral_types ?? [],

      // Status
      'is_active' => $this->is_active ?? true,
      'status_notes' => $this->status_notes,

      // Description (generated from available data)
      'description' => $this->generateDescription(),

      // Timestamps
      'created_at' => $this->created_at?->toIso8601String(),
      'updated_at' => $this->updated_at?->toIso8601String(),

      // Additional computed fields
      'distance' => $this->when(isset($this->distance), function () {
        return round($this->distance, 2);
      }),

      'bed_occupancy_percentage' => $this->when($this->bed_capacity > 0, function () {
        $occupied = $this->bed_capacity - ($this->current_bed_availability ?? 0);
        return round(($occupied / $this->bed_capacity) * 100, 2);
      }),
    ];
  }

  /**
   * Map database facility type to mobile-friendly format
   *
   * @param string|null $type
   * @return string
   */
  private function mapTypeToMobile(?string $type): string
  {
    // Map database types to mobile app expected types
    $typeMap = [
      'Barangay Health Center' => 'health_center',
      'Rural Health Unit' => 'health_center',
      'Primary Care Clinic' => 'clinic',
      'District Hospital' => 'hospital',
      'Provincial Hospital' => 'hospital',
      'Regional Hospital' => 'hospital',
      'Tertiary Hospital' => 'hospital',
      'Medical Center' => 'medical_center',
      'Specialty Center' => 'specialty_center',
      'Emergency Facility' => 'emergency',
    ];

    return $typeMap[$type] ?? strtolower(str_replace(' ', '_', $type ?? 'unknown'));
  }

  /**
   * Generate facility description from available data
   *
   * @return string
   */
  private function generateDescription(): string
  {
    $parts = [];

    // Add level description
    if ($this->level) {
      $levelDesc = ucfirst($this->level) . ' care';
      $parts[] = $levelDesc;
    }

    // Add type description
    $parts[] = $this->type ?? 'Healthcare facility';

    // Add special features
    $features = [];
    if ($this->has_emergency) {
      $features[] = 'Emergency services';
    }
    if ($this->is_24_7) {
      $features[] = '24/7 operations';
    }
    if ($this->is_philhealth_accredited) {
      $features[] = 'PhilHealth accredited';
    }

    if (!empty($features)) {
      $parts[] = implode(', ', $features);
    }

    // Add location
    if ($this->city) {
      $parts[] = "Located in {$this->city}";
      if ($this->region) {
        $parts[] = $this->region;
      }
    }

    return implode('. ', $parts) . '.';
  }

  /**
   * Customize the outgoing response for the resource collection.
   *
   * @param Request $request
   * @param \Illuminate\Http\JsonResponse $response
   * @return void
   */
  public function withResponse(Request $request, $response): void
  {
    // Add custom headers for mobile app
    $response->header('X-Mobile-API-Version', '1.0');
    $response->header('X-Data-Source', 'Juan Heart Backend');
  }
}
