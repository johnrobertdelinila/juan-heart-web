<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Resources\Mobile\FacilityResource;
use App\Models\HealthcareFacility;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

/**
 * Mobile Facility Controller
 *
 * Provides healthcare facility data export for Juan Heart Mobile app.
 * Supports offline-first architecture with sync capabilities.
 */
class FacilityController extends Controller
{
  /**
   * Get all active facilities for mobile app
   *
   * @param Request $request
   * @return JsonResponse
   */
  public function index(Request $request): JsonResponse
  {
    try {
      // Get query parameters
      $region = $request->query('region');
      $type = $request->query('type');
      $services = $request->query('services'); // comma-separated
      $emergency_only = $request->query('emergency_only', false);
      $philhealth_only = $request->query('philhealth_only', false);

      // Build query
      $query = HealthcareFacility::query()
        ->where('is_active', true)
        ->whereNotNull('latitude')
        ->whereNotNull('longitude');

      // Apply filters
      if ($region) {
        $query->where('region', $region);
      }

      if ($type) {
        $query->where('type', $type);
      }

      if ($emergency_only) {
        $query->where('has_emergency', true);
      }

      if ($philhealth_only) {
        $query->where('is_philhealth_accredited', true);
      }

      // Filter by services (if provided)
      if ($services) {
        $serviceList = explode(',', $services);
        foreach ($serviceList as $service) {
          $query->whereJsonContains('services', trim($service));
        }
      }

      // Order by region and name for consistent results
      $query->orderBy('region')
        ->orderBy('city')
        ->orderBy('name');

      // Get facilities
      $facilities = $query->get();

      // Get last updated timestamp (most recent facility update)
      $lastUpdated = HealthcareFacility::where('is_active', true)
        ->max('updated_at');

      return response()->json([
        'success' => true,
        'data' => FacilityResource::collection($facilities),
        'meta' => [
          'total' => $facilities->count(),
          'last_updated' => $lastUpdated ? Carbon::parse($lastUpdated)->toIso8601String() : null,
          'version' => '1.0',
          'filters_applied' => array_filter([
            'region' => $region,
            'type' => $type,
            'services' => $services,
            'emergency_only' => $emergency_only ? true : null,
            'philhealth_only' => $philhealth_only ? true : null,
          ]),
        ],
      ], 200);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch facilities',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get facilities updated since timestamp (for incremental sync)
   *
   * @param Request $request
   * @return JsonResponse
   */
  public function sync(Request $request): JsonResponse
  {
    try {
      // Validate timestamp parameter
      $request->validate([
        'since' => 'required|date',
      ]);

      $since = Carbon::parse($request->query('since'));

      // Get facilities updated after the given timestamp
      $facilities = HealthcareFacility::query()
        ->where('is_active', true)
        ->where('updated_at', '>', $since)
        ->whereNotNull('latitude')
        ->whereNotNull('longitude')
        ->orderBy('updated_at')
        ->get();

      // Get latest timestamp
      $latestUpdate = HealthcareFacility::where('is_active', true)
        ->max('updated_at');

      return response()->json([
        'success' => true,
        'data' => FacilityResource::collection($facilities),
        'meta' => [
          'total' => $facilities->count(),
          'since' => $since->toIso8601String(),
          'last_updated' => $latestUpdate ? Carbon::parse($latestUpdate)->toIso8601String() : null,
          'has_more' => false, // For future pagination support
          'version' => '1.0',
        ],
      ], 200);
    } catch (\Illuminate\Validation\ValidationException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Invalid timestamp parameter',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to sync facilities',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get facility count and statistics
   *
   * @return JsonResponse
   */
  public function count(): JsonResponse
  {
    try {
      // Get total active facilities
      $total = HealthcareFacility::where('is_active', true)->count();

      // Get count by type
      $byType = HealthcareFacility::where('is_active', true)
        ->selectRaw('type, COUNT(*) as count')
        ->groupBy('type')
        ->pluck('count', 'type');

      // Get count by region
      $byRegion = HealthcareFacility::where('is_active', true)
        ->selectRaw('region, COUNT(*) as count')
        ->groupBy('region')
        ->pluck('count', 'region');

      // Get facilities with emergency services
      $withEmergency = HealthcareFacility::where('is_active', true)
        ->where('has_emergency', true)
        ->count();

      // Get PhilHealth accredited facilities
      $philhealthAccredited = HealthcareFacility::where('is_active', true)
        ->where('is_philhealth_accredited', true)
        ->count();

      // Get 24/7 facilities
      $open24Hours = HealthcareFacility::where('is_active', true)
        ->where('is_24_7', true)
        ->count();

      return response()->json([
        'success' => true,
        'data' => [
          'total' => $total,
          'by_type' => $byType,
          'by_region' => $byRegion,
          'with_emergency' => $withEmergency,
          'philhealth_accredited' => $philhealthAccredited,
          'open_24_hours' => $open24Hours,
        ],
        'meta' => [
          'generated_at' => Carbon::now()->toIso8601String(),
          'version' => '1.0',
        ],
      ], 200);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to get facility count',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get single facility by ID
   *
   * @param string $id
   * @return JsonResponse
   */
  public function show(string $id): JsonResponse
  {
    try {
      $facility = HealthcareFacility::where('is_active', true)->findOrFail($id);

      return response()->json([
        'success' => true,
        'data' => new FacilityResource($facility),
      ], 200);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Facility not found',
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch facility',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get facilities near a coordinate (geospatial search)
   *
   * @param Request $request
   * @return JsonResponse
   */
  public function nearby(Request $request): JsonResponse
  {
    try {
      // Validate parameters
      $request->validate([
        'latitude' => 'required|numeric|between:-90,90',
        'longitude' => 'required|numeric|between:-180,180',
        'radius' => 'nullable|numeric|min:1|max:100', // in kilometers
      ]);

      $latitude = $request->query('latitude');
      $longitude = $request->query('longitude');
      $radius = $request->query('radius', 50); // Default 50km

      // Haversine formula for distance calculation
      // This is a simplified version - for production, consider using PostGIS
      $facilities = HealthcareFacility::query()
        ->where('is_active', true)
        ->whereNotNull('latitude')
        ->whereNotNull('longitude')
        ->selectRaw("
          *,
          (6371 * acos(
            cos(radians(?)) *
            cos(radians(latitude)) *
            cos(radians(longitude) - radians(?)) +
            sin(radians(?)) *
            sin(radians(latitude))
          )) AS distance
        ", [$latitude, $longitude, $latitude])
        ->having('distance', '<=', $radius)
        ->orderBy('distance')
        ->get();

      return response()->json([
        'success' => true,
        'data' => FacilityResource::collection($facilities),
        'meta' => [
          'total' => $facilities->count(),
          'center' => [
            'latitude' => (float) $latitude,
            'longitude' => (float) $longitude,
          ],
          'radius_km' => (float) $radius,
          'version' => '1.0',
        ],
      ], 200);
    } catch (\Illuminate\Validation\ValidationException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Invalid parameters',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to search nearby facilities',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get unique list of regions
   *
   * @return JsonResponse
   */
  public function regions(): JsonResponse
  {
    try {
      $regions = HealthcareFacility::where('is_active', true)
        ->distinct()
        ->pluck('region')
        ->sort()
        ->values();

      return response()->json([
        'success' => true,
        'data' => $regions,
        'meta' => [
          'total' => $regions->count(),
        ],
      ], 200);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch regions',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get unique list of facility types
   *
   * @return JsonResponse
   */
  public function types(): JsonResponse
  {
    try {
      $types = HealthcareFacility::where('is_active', true)
        ->distinct()
        ->pluck('type')
        ->sort()
        ->values();

      return response()->json([
        'success' => true,
        'data' => $types,
        'meta' => [
          'total' => $types->count(),
        ],
      ], 200);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch facility types',
        'error' => $e->getMessage(),
      ], 500);
    }
  }
}
