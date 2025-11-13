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
        Schema::create('educational_contents', function (Blueprint $table) {
            $table->id();

            // Category classification
            $table->enum('category', [
                'cvd_prevention',
                'symptom_recognition',
                'lifestyle_modification',
                'medication_compliance',
                'emergency_response',
                'risk_factors',
                'nutrition',
                'exercise'
            ])->index()->comment('Content category for filtering');

            // Bilingual titles
            $table->string('title_en', 255)->comment('English title');
            $table->string('title_fil', 255)->comment('Filipino title');

            // Bilingual descriptions (short summaries)
            $table->text('description_en')->nullable()->comment('Short English description');
            $table->text('description_fil')->nullable()->comment('Short Filipino description');

            // Full content (supports markdown/HTML)
            $table->longText('body_en')->comment('Full English content');
            $table->longText('body_fil')->comment('Full Filipino content');

            // Metadata
            $table->tinyInteger('reading_time_minutes')->unsigned()->default(5)->comment('Estimated reading time');
            $table->string('image_url', 500)->nullable()->comment('Optional cover image URL');
            $table->string('author', 100)->nullable()->comment('Content author name');

            // Status and analytics
            $table->boolean('published')->default(true)->index()->comment('Visibility flag');
            $table->bigInteger('views')->unsigned()->default(0)->comment('View count');

            // Version control
            $table->integer('version')->unsigned()->default(1)->comment('Content version for updates');

            // Timestamps
            $table->timestamps();

            // Additional indexes for performance
            $table->index(['category', 'published']);
            $table->index(['published', 'created_at']);

            // Fulltext search indexes (MySQL 5.6+ required, not supported in SQLite)
            // For production use MySQL, for testing these will be skipped
            if (Schema::connection(null)->getConnection()->getDriverName() !== 'sqlite') {
                $table->fullText(['title_en', 'title_fil'], 'educational_content_title_fulltext');
                $table->fullText(['description_en', 'description_fil'], 'educational_content_desc_fulltext');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('educational_contents');
    }
};
