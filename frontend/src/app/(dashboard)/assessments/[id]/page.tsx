import { notFound } from 'next/navigation';
import { AssessmentComparison } from '@/components/assessment/assessment-comparison';
import { ValidationWorkflow } from '@/components/assessment/validation-workflow';
import { ClinicalNotesEditor } from '@/components/assessment/clinical-notes-editor';
import { getAssessment } from '@/lib/api/assessment';

interface AssessmentComparisonPageProps {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function AssessmentComparisonPage({ params }: AssessmentComparisonPageProps) {
  const { id } = params;

  try {
    const response = await getAssessment(id);

    if (!response?.success || !response.data) {
      notFound();
    }

    return (
      <div className="space-y-6">
        {/* Assessment Comparison - Side-by-side view of AI vs Clinical */}
        <AssessmentComparison assessment={response.data} />

        {/* Validation Workflow - Approve/Reject buttons with status tracking */}
        <ValidationWorkflow
          assessment={response.data}
          onActionComplete={() => {
            // Refresh the page after validation actions
            window.location.reload();
          }}
        />

        {/* Clinical Notes Editor - Rich text editor for clinical annotations */}
        <ClinicalNotesEditor assessmentId={response.data.id} />
      </div>
    );
  } catch (error) {
    console.error('Failed to load assessment comparison:', error);
    notFound();
  }
}
