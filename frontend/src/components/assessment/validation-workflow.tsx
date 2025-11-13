'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  CircleDot,
  CircleSlash2,
  Clock,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Smartphone,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  validateAssessment,
  rejectAssessment,
  getRiskAdjustments,
  adjustRiskScore,
} from '@/lib/api/assessment';
import { showErrorToast, showSuccessToast } from '@/lib/sweetalert-config';
import type { Assessment as FullAssessment, RiskAdjustment } from '@/types/assessment';

interface ValidationWorkflowProps {
  assessment: FullAssessment;
  onActionComplete?: () => void | Promise<void>;
}

export function ValidationWorkflow({ assessment, onActionComplete }: ValidationWorkflowProps) {
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveForm, setApproveForm] = useState({
    score: assessment.final_risk_score ?? assessment.ml_risk_score ?? 50,
    notes: assessment.validation_notes ?? '',
    agreesWithMl: assessment.validation_agrees_with_ml ?? true,
  });
  const [rejectReason, setRejectReason] = useState('');
  const [notifyMobile, setNotifyMobile] = useState(true);
  const [isSubmittingApprove, setIsSubmittingApprove] = useState(false);
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);
  const [riskDialogOpen, setRiskDialogOpen] = useState(false);
  const [riskScoreInput, setRiskScoreInput] = useState(
    assessment.final_risk_score ?? assessment.ml_risk_score ?? 50
  );
  const [riskJustification, setRiskJustification] = useState('');
  const [isSubmittingRisk, setIsSubmittingRisk] = useState(false);
  const [riskHistory, setRiskHistory] = useState<RiskAdjustment[]>([]);
  const [isLoadingRiskHistory, setIsLoadingRiskHistory] = useState(true);

  useEffect(() => {
    setApproveForm({
      score: assessment.final_risk_score ?? assessment.ml_risk_score ?? 50,
      notes: assessment.validation_notes ?? '',
      agreesWithMl: assessment.validation_agrees_with_ml ?? true,
    });
    setRejectReason('');
    setNotifyMobile(true);
    setRiskScoreInput(assessment.final_risk_score ?? assessment.ml_risk_score ?? 50);
    setRiskJustification('');
  }, [assessment]);

  const loadRiskHistory = useCallback(async () => {
    setIsLoadingRiskHistory(true);
    try {
      const response = await getRiskAdjustments(assessment.id);
      if (response.success) {
        setRiskHistory(response.data);
      }
    } catch (error) {
      console.error('Failed to load risk adjustments', error);
    } finally {
      setIsLoadingRiskHistory(false);
    }
  }, [assessment.id]);

  useEffect(() => {
    loadRiskHistory();
  }, [loadRiskHistory]);

  const timeline = useMemo(() => {
    const submissionDate = assessment.assessment_date
      ? format(new Date(assessment.assessment_date), 'PPP • p')
      : '—';
    const validationDate = assessment.validated_at
      ? format(new Date(assessment.validated_at), 'PPP • p')
      : 'Pending';

    return [
      {
        id: 'submitted',
        title: 'Submitted from field',
        description: 'Assessment received from mobile health worker',
        timestamp: submissionDate,
        status: 'complete',
      },
      {
        id: 'review',
        title: 'Clinical review',
        description: assessment.status === 'pending' ? 'Awaiting clinician review' : 'In review',
        timestamp: assessment.status === 'pending' ? 'Waiting' : validationDate,
        status: ['pending'].includes(assessment.status) ? 'current' : 'complete',
      },
      {
        id: 'decision',
        title: 'Final decision',
        description:
          assessment.status === 'validated'
            ? 'Approved and logged'
            : assessment.status === 'rejected'
              ? 'Rejected with clinical feedback'
              : 'Decision pending',
        timestamp:
          assessment.status === 'validated' || assessment.status === 'rejected'
            ? validationDate
            : 'Pending',
        status:
          assessment.status === 'validated'
            ? 'approved'
            : assessment.status === 'rejected'
              ? 'rejected'
              : 'pending',
      },
    ];
  }, [assessment]);

  const canUpdate = ['pending', 'in_review', 'requires_referral'].includes(assessment.status);
  const canApprove = canUpdate && assessment.status !== 'validated';
  const canReject = canUpdate && assessment.status !== 'rejected';
  const canAdjustRisk = assessment.status !== 'pending';

  const handleApprove = async () => {
    if (!Number.isFinite(Number(approveForm.score))) {
      await showErrorToast('Please enter a valid risk score (0-100).');
      return;
    }

    setIsSubmittingApprove(true);
    try {
      await validateAssessment(assessment.id, {
        validated_risk_score: Number(approveForm.score),
        validation_notes: approveForm.notes.trim() || undefined,
        validation_agrees_with_ml: approveForm.agreesWithMl,
      });
      await showSuccessToast('Assessment approved successfully');
      setApproveDialogOpen(false);
      if (onActionComplete) {
        await onActionComplete();
      }
    } catch (error) {
      console.error('Failed to approve assessment', error);
      await showErrorToast(
        'Approval failed',
        error instanceof Error ? error.message : 'Unexpected error occurred'
      );
    } finally {
      setIsSubmittingApprove(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      await showErrorToast('Please provide clinical reasoning for rejection.');
      return;
    }

    setIsSubmittingReject(true);
    try {
      await rejectAssessment(assessment.id, {
        reason: rejectReason.trim(),
        notify_mobile_user: notifyMobile,
      });
      await showSuccessToast('Rejection recorded and notification queued');
      setRejectDialogOpen(false);
      if (onActionComplete) {
        await onActionComplete();
      }
    } catch (error) {
      console.error('Failed to reject assessment', error);
      await showErrorToast(
        'Rejection failed',
        error instanceof Error ? error.message : 'Unexpected error occurred'
      );
    } finally {
      setIsSubmittingReject(false);
    }
  };

  const handleRiskAdjustment = async () => {
    if (!Number.isFinite(Number(riskScoreInput))) {
      await showErrorToast('Enter a valid score between 0 and 100.');
      return;
    }
    if (!riskJustification.trim()) {
      await showErrorToast('Justification is required for risk adjustments.');
      return;
    }

    setIsSubmittingRisk(true);
    try {
      await adjustRiskScore(assessment.id, {
        new_risk_score: Number(riskScoreInput),
        justification: riskJustification.trim(),
      });
      await showSuccessToast('Risk score updated');
      setRiskDialogOpen(false);
      setRiskJustification('');
      await loadRiskHistory();
      if (onActionComplete) {
        await onActionComplete();
      }
    } catch (error) {
      console.error('Failed to adjust risk score', error);
      await showErrorToast(
        'Could not adjust risk score',
        error instanceof Error ? error.message : undefined
      );
    } finally {
      setIsSubmittingRisk(false);
    }
  };

  return (
    <>
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg">Validation Workflow</CardTitle>
            <CardDescription>
              Track the clinical review, approvals, mobile notifications, and audit history
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-slate-900 text-white">
              Current Status: {assessment.status.replace('_', ' ')}
            </Badge>
            <Badge variant="outline" className="text-slate-600">
              Validator:{' '}
              {assessment.validator
                ? `${assessment.validator.first_name} ${assessment.validator.last_name}`
                : 'Unassigned'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-4 rounded-2xl border border-slate-200/70 bg-white/90 p-4">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Status Timeline
              </p>
              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                          item.status === 'complete'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                            : item.status === 'approved'
                              ? 'border-green-200 bg-green-50 text-green-600'
                              : item.status === 'rejected'
                                ? 'border-red-200 bg-red-50 text-red-600'
                                : 'border-slate-200 bg-white text-slate-400'
                        }`}
                      >
                        {item.status === 'complete' || item.status === 'approved' ? (
                          <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                        ) : item.status === 'rejected' ? (
                          <CircleSlash2 className="h-4 w-4" strokeWidth={1.5} />
                        ) : (
                          <CircleDot className="h-4 w-4" strokeWidth={1.5} />
                        )}
                      </span>
                      {index < timeline.length - 1 && (
                        <span className="my-1 block h-full w-px flex-1 bg-slate-200" />
                      )}
                    </div>
                    <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        {item.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Actions
                </p>
                <p className="text-sm text-slate-600">
                  Document approvals or request corrections. Mobile user receives a push alert when
                  you reject with feedback.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button disabled={!canApprove} onClick={() => setApproveDialogOpen(true)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" strokeWidth={1.5} />
                  Approve Assessment
                </Button>
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  disabled={!canReject}
                  onClick={() => setRejectDialogOpen(true)}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" strokeWidth={1.5} />
                  Reject & Request Revisions
                </Button>
                <Button
                  variant="secondary"
                  disabled={!canAdjustRisk}
                  onClick={() => setRiskDialogOpen(true)}
                >
                  <Scale className="mr-2 h-4 w-4" strokeWidth={1.5} />
                  Adjust Risk Score
                </Button>
                {!canUpdate && (
                  <p className="text-xs text-slate-500">
                    Assessment already finalized. Reopen via backend if additional edits are needed.
                  </p>
                )}
              </div>
              <Separator />
              <div className="rounded-xl border border-slate-100 bg-white/80 p-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Smartphone className="text-heart-red h-4 w-4" strokeWidth={1.5} />
                  Mobile Notification
                </p>
                <p className="text-xs text-slate-500">
                  Mobile health worker ({assessment.mobile_user_id}) receives a push notification{' '}
                  for every final decision.
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white/80 p-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <RefreshCw className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
                  Audit Trail
                </p>
                <p className="text-xs text-slate-500">
                  Approvals and rejections are logged for compliance reporting automatically.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3 rounded-2xl border border-slate-200/70 bg-white/90 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-800">Risk Adjustment History</p>
              <Badge variant="outline" className="text-xs">
                {riskHistory.length} record{riskHistory.length === 1 ? '' : 's'}
              </Badge>
            </div>
            {isLoadingRiskHistory ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading adjustments...
              </div>
            ) : riskHistory.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-500">
                No manual adjustments recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {riskHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        className={`text-xs ${
                          entry.alert_triggered
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-900 text-white'
                        }`}
                      >
                        {entry.new_level} ({entry.new_score}%)
                      </Badge>
                      {typeof entry.difference === 'number' && entry.difference !== 0 && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            entry.difference > 0
                              ? 'bg-red-50 text-red-600'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {entry.difference > 0 ? (
                            <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" strokeWidth={1.5} />
                          )}
                          {entry.difference > 0 ? '+' : ''}
                          {entry.difference} pts
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {entry.created_at
                          ? new Date(entry.created_at).toLocaleString()
                          : 'Unknown timestamp'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{entry.justification}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {entry.clinician && (
                        <span>
                          Clinician: {entry.clinician.first_name} {entry.clinician.last_name}
                        </span>
                      )}
                      {entry.old_score !== null && entry.old_score !== undefined && (
                        <span>
                          Previous: {entry.old_level ?? '—'} ({entry.old_score}%)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={approveDialogOpen}
        onOpenChange={(open) => !isSubmittingApprove && setApproveDialogOpen(open)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Approve Assessment</DialogTitle>
            <DialogDescription>
              Provide the clinically validated score and notes for audit logging.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="validated-score">Validated Risk Score</Label>
              <Input
                id="validated-score"
                type="number"
                min={0}
                max={100}
                value={approveForm.score}
                onChange={(event) =>
                  setApproveForm((prev) => ({ ...prev, score: Number(event.target.value) }))
                }
              />
              <p className="text-xs text-slate-500">Low: 0-39 · Moderate: 40-69 · High: 70-100</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <Switch
                id="agrees-with-ml"
                checked={approveForm.agreesWithMl}
                onCheckedChange={(checked) =>
                  setApproveForm((prev) => ({ ...prev, agreesWithMl: checked }))
                }
              />
              <div>
                <Label htmlFor="agrees-with-ml" className="text-sm">
                  Clinical assessment agrees with AI prediction
                </Label>
                <p className="text-xs text-slate-500">
                  Toggle off if you are overriding the AI score.
                </p>
              </div>
            </div>
            <div>
              <Label htmlFor="validation-notes">Clinical Notes</Label>
              <Textarea
                id="validation-notes"
                value={approveForm.notes}
                onChange={(event) =>
                  setApproveForm((prev) => ({ ...prev, notes: event.target.value }))
                }
                placeholder="Document rationale, follow-up instructions, or next steps."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveDialogOpen(false)}
              disabled={isSubmittingApprove}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={
                isSubmittingApprove ||
                Number(approveForm.score) < 0 ||
                Number(approveForm.score) > 100
              }
            >
              {isSubmittingApprove ? 'Saving...' : 'Confirm Approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={rejectDialogOpen}
        onOpenChange={(open) => !isSubmittingReject && setRejectDialogOpen(open)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Reject Assessment</DialogTitle>
            <DialogDescription>
              Provide clinical justification so the mobile user knows what to correct.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">Clinical Feedback</Label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="Explain missing data, conflicting findings, or required follow-up."
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <Switch id="notify-mobile" checked={notifyMobile} onCheckedChange={setNotifyMobile} />
              <div>
                <Label htmlFor="notify-mobile" className="text-sm">
                  Notify mobile health worker
                </Label>
                <p className="text-xs text-slate-500">
                  Sends a push notification with your feedback immediately.
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <div className="flex items-center gap-2 font-semibold">
                <Bell className="h-4 w-4" strokeWidth={1.5} />
                Compliance Reminder
              </div>
              <p>Rejections are logged in the audit trail and require follow-up within 48 hours.</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={isSubmittingReject}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isSubmittingReject || rejectReason.trim().length === 0}
            >
              {isSubmittingReject ? 'Sending...' : 'Submit Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={riskDialogOpen}
        onOpenChange={(open) => !isSubmittingRisk && setRiskDialogOpen(open)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Adjust Risk Score</DialogTitle>
            <DialogDescription>
              Override the final risk score with justification. Alerts trigger automatically for
              large changes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="risk-score-input">New Risk Score</Label>
              <Input
                id="risk-score-input"
                type="number"
                min={0}
                max={100}
                value={riskScoreInput}
                onChange={(event) => setRiskScoreInput(Number(event.target.value))}
              />
              <p className="text-xs text-slate-500">
                Current score: {assessment.final_risk_score ?? 'N/A'}%
              </p>
            </div>
            <div>
              <Label htmlFor="risk-justification">Justification *</Label>
              <Textarea
                id="risk-justification"
                value={riskJustification}
                onChange={(event) => setRiskJustification(event.target.value)}
                placeholder="Describe clinical context or data corrections prompting this override."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRiskDialogOpen(false)}
              disabled={isSubmittingRisk}
            >
              Cancel
            </Button>
            <Button onClick={handleRiskAdjustment} disabled={isSubmittingRisk}>
              {isSubmittingRisk ? 'Saving...' : 'Save Adjustment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
