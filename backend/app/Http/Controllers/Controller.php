<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *     title="Juan Heart Web API",
 *     version="1.0.0",
 *     description="RESTful API for Juan Heart Web Application - Clinical management platform for Philippine Heart Center (PHC) to monitor and coordinate cardiovascular health data.",
 *     @OA\Contact(
 *         email="dev@juanheart.ph",
 *         name="Juan Heart Development Team"
 *     ),
 *     @OA\License(
 *         name="Proprietary",
 *         url="https://juanheart.ph/license"
 *     )
 * )
 *
 * @OA\Server(
 *     url=L5_SWAGGER_CONST_HOST,
 *     description="API Server"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="sanctum",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Enter your Bearer token in the format: Bearer <token>"
 * )
 *
 * @OA\Tag(
 *     name="Authentication",
 *     description="Authentication endpoints"
 * )
 *
 * @OA\Tag(
 *     name="Users",
 *     description="User management endpoints"
 * )
 *
 * @OA\Tag(
 *     name="Assessments",
 *     description="Health assessment endpoints"
 * )
 *
 * @OA\Tag(
 *     name="Referrals",
 *     description="Patient referral endpoints"
 * )
 *
 * @OA\Tag(
 *     name="Facilities",
 *     description="Healthcare facility endpoints"
 * )
 *
 * @OA\Tag(
 *     name="Analytics",
 *     description="Analytics and reporting endpoints"
 * )
 */
abstract class Controller
{
    //
}
