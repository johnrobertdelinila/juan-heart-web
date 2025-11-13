<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('assessment_risk_adjustments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('assessment_id');
            $table->unsignedBigInteger('adjusted_by')->nullable();
            $table->integer('old_score')->nullable();
            $table->string('old_level')->nullable();
            $table->integer('new_score');
            $table->string('new_level');
            $table->integer('difference')->nullable();
            $table->text('justification');
            $table->boolean('alert_triggered')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('assessment_id')->references('id')->on('assessments')->onDelete('cascade');
            $table->foreign('adjusted_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['assessment_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assessment_risk_adjustments');
    }
};
