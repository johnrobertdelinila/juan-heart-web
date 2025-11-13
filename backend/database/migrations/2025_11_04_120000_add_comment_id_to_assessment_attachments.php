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
        Schema::table('assessment_attachments', function (Blueprint $table) {
            if (!Schema::hasColumn('assessment_attachments', 'comment_id')) {
                $table->unsignedBigInteger('comment_id')->nullable()->after('assessment_id');
                $table->foreign('comment_id')
                    ->references('id')
                    ->on('assessment_comments')
                    ->onDelete('cascade');
                $table->index('comment_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assessment_attachments', function (Blueprint $table) {
            if (Schema::hasColumn('assessment_attachments', 'comment_id')) {
                $table->dropForeign(['comment_id']);
                $table->dropIndex(['comment_id']);
                $table->dropColumn('comment_id');
            }
        });
    }
};
