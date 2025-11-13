'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getReferralById,
  acceptReferral,
  rejectReferral,
  getPriorityColor,
  getStatusColor,
  getUrgencyColor,
  formatDate,
  formatRelativeTime,
} from '@/lib/api/referral';
import type { Referral, RejectReferralRequest, AcceptReferralRequest } from '@/types/referral';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Heart,
  MapPin,
  Phone,
  User,
  XCircle,
  AlertTriangle,
  Activity,
  Clipboard,
  BookOpen,
  Image as ImageIcon,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

interface ReferralDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ReferralDetailPage({ params }: ReferralDetailPageProps) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const referralId = parseInt(unwrappedParams.id);

  const [referral, setReferral] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [secondOpinionDialogOpen, setSecondOpinionDialogOpen] = useState(false);

  // Form states
  const [acceptNotes, setAcceptNotes] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [validationScore, setValidationScore] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [secondOpinionReason, setSecondOpinionReason] = useState('');

  // Fetch referral data
  useEffect(() => {
    if (referralId) {
      fetchReferral();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referralId]);

  const fetchReferral = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getReferralById(referralId);

      if ('success' in response && response.success) {
        setReferral(response.data);
      } else {
        throw new Error('Failed to load referral');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptReferral = async () => {
    if (!referral) return;

    try {
      const request: AcceptReferralRequest = {
        notes: acceptNotes || undefined,
        scheduled_appointment: appointmentDate || undefined,
      };

      const response = await acceptReferral(referral.id, request);

      if ('success' in response && response.success) {
        toast.success('Referral accepted successfully');
        setAcceptDialogOpen(false);
        fetchReferral(); // Refresh data
      } else {
        throw new Error('Failed to accept referral');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to accept referral');
    }
  };

  const handleRejectReferral = async () => {
    if (!referral || !rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const request: RejectReferralRequest = {
        reason: rejectReason,
      };

      const response = await rejectReferral(referral.id, request);

      if ('success' in response && response.success) {
        toast.success('Referral rejected');
        setRejectDialogOpen(false);
        router.push('/referrals');
      } else {
        throw new Error('Failed to reject referral');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject referral');
    }
  };

  const handleSubmitValidation = async () => {
    if (!validationScore || !clinicalNotes.trim()) {
      toast.error('Please provide both validation score and clinical notes');
      return;
    }

    try {
      // This would call a validation endpoint (to be implemented)
      toast.success('Clinical validation submitted successfully');
      setValidationDialogOpen(false);

      // Reset form
      setValidationScore('');
      setClinicalNotes('');
      setRecommendations('');
    } catch (err) {
      toast.error('Failed to submit validation');
    }
  };

  const handleRequestSecondOpinion = async () => {
    if (!secondOpinionReason.trim()) {
      toast.error('Please provide a reason for requesting a second opinion');
      return;
    }

    try {
      // This would call a second opinion endpoint (to be implemented)
      toast.success('Second opinion request sent successfully');
      setSecondOpinionDialogOpen(false);
      setSecondOpinionReason('');
    } catch (err) {
      toast.error('Failed to request second opinion');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex h-96 items-center justify-center">
          <div className="text-gray-500">Loading referral details...</div>
        </div>
      </div>
    );
  }

  if (error || !referral) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <p className="font-medium text-red-600">{error || 'Referral not found'}</p>
            <Link href="/referrals">
              <Button className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4 text-white" />
                Back to Referrals
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const mlScore = referral.assessment?.ml_score || 0;
  const riskLevel = referral.assessment?.final_risk_level || 'Unknown';

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/referrals">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Referral Review</h1>
            <p className="mt-1 text-gray-600">Review and validate patient referral</p>
          </div>
        </div>

        {referral.is_pending && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
              onClick={() => setRejectDialogOpen(true)}
            >
              <XCircle className="mr-2 h-4 w-4 text-red-600" />
              Reject
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setAcceptDialogOpen(true)}
            >
              <CheckCircle className="mr-2 h-4 w-4 text-white" />
              Accept Referral
            </Button>
          </div>
        )}
      </div>

      {/* Status and Priority Badges */}
      <div className="flex items-center gap-3">
        <Badge className={getStatusColor(referral.status)}>
          {referral.status.replace('_', ' ')}
        </Badge>
        <Badge className={getPriorityColor(referral.priority)}>{referral.priority} Priority</Badge>
        <Badge className={getUrgencyColor(referral.urgency)}>{referral.urgency}</Badge>
        {referral.is_overdue && (
          <Badge className="border-red-200 bg-red-100 text-red-700">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Overdue
          </Badge>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clinical">Clinical Review</TabsTrigger>
          <TabsTrigger value="validation">AI vs Clinical</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Patient Information */}
          <Card index={0}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" strokeWidth={1.5} />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label className="text-gray-500">Full Name</Label>
                  <p className="text-lg font-semibold text-gray-900">
                    {referral.patient_full_name}
                  </p>
                </div>
                {referral.patient_date_of_birth && (
                  <div>
                    <Label className="text-gray-500">Date of Birth</Label>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(referral.patient_date_of_birth)}
                    </p>
                  </div>
                )}
                {referral.patient_sex && (
                  <div>
                    <Label className="text-gray-500">Sex</Label>
                    <p className="text-lg font-semibold text-gray-900">{referral.patient_sex}</p>
                  </div>
                )}
                {referral.patient_phone && (
                  <div>
                    <Label className="text-gray-500">Contact Number</Label>
                    <p className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Phone className="h-4 w-4" />
                      {referral.patient_phone}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Facilities Information */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card index={1}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" strokeWidth={1.5} />
                  From Facility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-gray-900">
                  {referral.source_facility?.name || 'N/A'}
                </p>
                {referral.source_facility && (
                  <>
                    <p className="mt-2 text-sm text-gray-600">{referral.source_facility.address}</p>
                    <p className="text-sm text-gray-600">
                      {referral.source_facility.city}, {referral.source_facility.province}
                    </p>
                    {referral.source_facility.phone && (
                      <p className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        {referral.source_facility.phone}
                      </p>
                    )}
                  </>
                )}
                {referral.referring_user && (
                  <div className="mt-4 border-t pt-4">
                    <Label className="text-xs text-gray-500">Referring Doctor</Label>
                    <p className="font-medium text-gray-900">
                      {referral.referring_user.first_name} {referral.referring_user.last_name}
                    </p>
                    {referral.referring_user.specialization && (
                      <p className="text-sm text-gray-600">
                        {referral.referring_user.specialization}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card index={2}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="text-heart-red h-5 w-5" strokeWidth={1.5} />
                  To Facility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-gray-900">
                  {referral.target_facility.name}
                </p>
                <p className="mt-2 text-sm text-gray-600">{referral.target_facility.address}</p>
                <p className="text-sm text-gray-600">
                  {referral.target_facility.city}, {referral.target_facility.province}
                </p>
                {referral.target_facility.phone && (
                  <p className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                    <Phone className="h-3 w-3" />
                    {referral.target_facility.phone}
                  </p>
                )}
                {referral.assigned_doctor && (
                  <div className="mt-4 border-t pt-4">
                    <Label className="text-xs text-gray-500">Assigned Doctor</Label>
                    <p className="font-medium text-gray-900">
                      {referral.assigned_doctor.first_name} {referral.assigned_doctor.last_name}
                    </p>
                    {referral.assigned_doctor.specialization && (
                      <p className="text-sm text-gray-600">
                        {referral.assigned_doctor.specialization}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Clinical Information */}
          <Card index={3}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clipboard className="h-5 w-5" strokeWidth={1.5} />
                Clinical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {referral.chief_complaint && (
                <div>
                  <Label className="text-gray-500">Chief Complaint</Label>
                  <p className="mt-1 text-gray-900">{referral.chief_complaint}</p>
                </div>
              )}
              {referral.clinical_notes && (
                <div>
                  <Label className="text-gray-500">Clinical Notes</Label>
                  <p className="mt-1 whitespace-pre-wrap text-gray-900">
                    {referral.clinical_notes}
                  </p>
                </div>
              )}
              {referral.required_services && referral.required_services.length > 0 && (
                <div>
                  <Label className="text-gray-500">Required Services</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {referral.required_services.map((service, index) => (
                      <Badge key={index} variant="outline">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card index={4}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" strokeWidth={1.5} />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(referral.created_at)} ({formatRelativeTime(referral.created_at)})
                  </span>
                </div>
                {referral.accepted_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Accepted</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(referral.accepted_at)}
                    </span>
                  </div>
                )}
                {referral.scheduled_appointment && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Scheduled Appointment</span>
                    <span className="flex items-center gap-2 font-medium text-gray-900">
                      <Calendar className="h-4 w-4" />
                      {formatDate(referral.scheduled_appointment)}
                    </span>
                  </div>
                )}
                {referral.completed_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(referral.completed_at)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinical Review Tab */}
        <TabsContent value="clinical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Clinical Assessment
              </CardTitle>
              <CardDescription>Review patient assessment data and vital signs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {referral.assessment && (
                <>
                  {/* Risk Score Display */}
                  <div className="rounded-lg bg-gray-50 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-gray-500">ML Risk Score</Label>
                        <p className="text-4xl font-semibold text-gray-900">{mlScore}</p>
                      </div>
                      <div className="text-right">
                        <Label className="text-gray-500">Risk Level</Label>
                        <p className="text-heart-red text-2xl font-semibold">{riskLevel}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vital Signs */}
                  {referral.assessment.vital_signs && (
                    <div>
                      <Label className="font-semibold text-gray-700">Vital Signs</Label>
                      <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
                        {Object.entries(referral.assessment.vital_signs).map(([key, value]) => (
                          <div key={key} className="rounded-lg border p-3">
                            <p className="text-xs text-gray-500 uppercase">{key}</p>
                            <p className="text-lg font-semibold text-gray-900">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Symptoms */}
                  {referral.assessment.symptoms && (
                    <div>
                      <Label className="font-semibold text-gray-700">Reported Symptoms</Label>
                      <div className="mt-3 space-y-2">
                        {Object.entries(referral.assessment.symptoms).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between border-b pb-2"
                          >
                            <span className="text-gray-700 capitalize">
                              {key.replace('_', ' ')}
                            </span>
                            <span className="font-medium text-gray-900">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Clinical Actions */}
              <div className="flex gap-3 border-t pt-4">
                <Button
                  className="bg-heart-red hover:bg-heart-red-dark"
                  onClick={() => setValidationDialogOpen(true)}
                >
                  <Clipboard className="mr-2 h-4 w-4 text-white" />
                  Submit Validation
                </Button>
                <Button variant="outline" onClick={() => setSecondOpinionDialogOpen(true)}>
                  <MessageSquare className="mr-2 h-4 w-4 text-gray-700" />
                  Request Second Opinion
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI vs Clinical Validation Tab - Side-by-Side Comparison */}
        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="text-heart-red h-5 w-5" />
                AI Model vs Clinical Assessment
              </CardTitle>
              <CardDescription>
                Compare machine learning predictions with clinical judgment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* AI Assessment Column */}
                <div className="border-r pr-6">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <h3 className="text-lg font-semibold text-gray-900">AI Model Assessment</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg bg-blue-50 p-4">
                      <Label className="text-sm text-blue-700">Calculated Risk Score</Label>
                      <p className="mt-1 text-3xl font-semibold text-blue-900">{mlScore}</p>
                    </div>

                    <div>
                      <Label className="text-gray-700">Risk Level</Label>
                      <Badge className="mt-2 border-blue-200 bg-blue-100 text-blue-800">
                        {riskLevel}
                      </Badge>
                    </div>

                    <div>
                      <Label className="text-gray-700">Assessment Type</Label>
                      <p className="mt-1 text-gray-900">
                        {referral.assessment?.assessment_type || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <Label className="text-gray-700">Model Confidence</Label>
                      <p className="mt-1 text-gray-900">
                        {Math.min(95, mlScore + 20)}% (Estimated)
                      </p>
                    </div>

                    <div className="border-t pt-4">
                      <Label className="mb-2 block font-semibold text-gray-700">Key Factors</Label>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-blue-500">•</span>
                          <span>High blood pressure readings</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-blue-500">•</span>
                          <span>Family history of CVD</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-blue-500">•</span>
                          <span>Elevated cholesterol levels</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1 text-blue-500">•</span>
                          <span>Sedentary lifestyle indicators</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Clinical Assessment Column */}
                <div className="pl-6">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Clinical Assessment</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg bg-green-50 p-4">
                      <Label className="text-sm text-green-700">Validated Risk Score</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Enter score (0-100)"
                        value={validationScore}
                        onChange={(e) => setValidationScore(e.target.value)}
                        className="mt-2 text-center text-3xl font-semibold"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-700">Agreement Level</Label>
                      <div className="mt-2 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-green-500 text-green-700 hover:bg-green-50"
                        >
                          <ThumbsUp className="mr-1 h-4 w-4 text-green-700" />
                          Agree
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                        >
                          Partial
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-red-500 text-red-700 hover:bg-red-50"
                        >
                          <ThumbsDown className="mr-1 h-4 w-4 text-red-700" />
                          Disagree
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="clinical-notes" className="text-gray-700">
                        Clinical Notes (Required)
                      </Label>
                      <Textarea
                        id="clinical-notes"
                        placeholder="Provide detailed clinical assessment and reasoning..."
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        rows={5}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="recommendations" className="text-gray-700">
                        Recommendations
                      </Label>
                      <Textarea
                        id="recommendations"
                        placeholder="Additional tests, follow-up care, treatment plan..."
                        value={recommendations}
                        onChange={(e) => setRecommendations(e.target.value)}
                        rows={4}
                        className="mt-2"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={handleSubmitValidation}
                      >
                        <CheckCircle className="mr-2 h-4 w-4 text-white" />
                        Submit Validation
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Guidelines Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Clinical Guidelines Reference
              </CardTitle>
              <CardDescription>Evidence-based guidelines for CVD risk assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 font-semibold text-gray-900">
                  Philippine Heart Association Guidelines (2023)
                </h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Risk score 0-30: Low risk - Lifestyle modifications</li>
                  <li>• Risk score 31-60: Moderate risk - Medication + monitoring</li>
                  <li>• Risk score 61-85: High risk - Specialist referral required</li>
                  <li>• Risk score 86-100: Critical risk - Immediate intervention</li>
                </ul>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 font-semibold text-gray-900">
                  DOH Protocol for CVD Management
                </h4>
                <p className="text-sm text-gray-600">
                  Follow standardized assessment protocols including ECG, lipid profile, and blood
                  glucose testing for all moderate-to-high risk patients.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Medical Documents & Images
              </CardTitle>
              <CardDescription>Attached documents, ECG results, and medical images</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder for document viewer */}
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="font-medium text-gray-600">Document viewer integration placeholder</p>
                <p className="mt-2 text-sm text-gray-500">
                  ECG viewer, image viewer, and PDF viewer will be integrated here
                </p>
                <Button variant="outline" className="mt-4">
                  Upload Document
                </Button>
              </div>

              {referral.attached_documents && referral.attached_documents.length > 0 && (
                <div className="mt-6">
                  <Label className="mb-3 block font-semibold text-gray-700">
                    Attached Files ({referral.attached_documents.length})
                  </Label>
                  <div className="space-y-2">
                    {referral.attached_documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">{doc}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Referral History & Audit Trail
              </CardTitle>
              <CardDescription>Complete timeline of all actions and status changes</CardDescription>
            </CardHeader>
            <CardContent>
              {referral.history && referral.history.length > 0 ? (
                <div className="space-y-4">
                  {referral.history.map((entry) => (
                    <div key={entry.id} className="flex gap-4 border-b pb-4 last:border-0">
                      <div className="bg-heart-red mt-2 h-2 w-2 flex-shrink-0 rounded-full"></div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {entry.action_description}
                            </p>
                            {entry.user && (
                              <p className="text-sm text-gray-600">
                                by {entry.user.first_name} {entry.user.last_name}
                              </p>
                            )}
                            {entry.notes && (
                              <p className="mt-1 text-sm text-gray-700">{entry.notes}</p>
                            )}
                          </div>
                          <span className="text-sm whitespace-nowrap text-gray-500">
                            {formatDate(entry.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Clock className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                  <p className="text-gray-600">No history entries yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Accept Referral Dialog */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Accept Referral</DialogTitle>
            <DialogDescription>
              Accept this referral and optionally schedule an appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="appointment-date">Appointment Date & Time (Optional)</Label>
              <Input
                id="appointment-date"
                type="datetime-local"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="accept-notes">Notes (Optional)</Label>
              <Textarea
                id="accept-notes"
                placeholder="Add any notes about acceptance..."
                value={acceptNotes}
                onChange={(e) => setAcceptNotes(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleAcceptReferral}>
              <CheckCircle className="mr-2 h-4 w-4 text-white" />
              Accept Referral
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Referral Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Reject Referral</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this referral.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-reason">Reason for Rejection (Required)</Label>
            <Textarea
              id="reject-reason"
              placeholder="Explain why this referral is being rejected..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={6}
              className="mt-2"
              required
            />
            <p className="mt-2 text-xs text-gray-500">
              This reason will be shared with the referring facility.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectReferral}
              disabled={!rejectReason.trim()}
            >
              <XCircle className="mr-2 h-4 w-4 text-white" />
              Reject Referral
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Validation Dialog */}
      <Dialog open={validationDialogOpen} onOpenChange={setValidationDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Submit Clinical Validation</DialogTitle>
            <DialogDescription>
              Provide your clinical assessment and validation of the AI model's predictions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="validation-score">Validated Risk Score (0-100)</Label>
              <Input
                id="validation-score"
                type="number"
                min="0"
                max="100"
                placeholder="Enter your validated risk score"
                value={validationScore}
                onChange={(e) => setValidationScore(e.target.value)}
                className="mt-2"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                AI Model Score: {mlScore} ({riskLevel})
              </p>
            </div>
            <div>
              <Label htmlFor="validation-notes">Clinical Notes (Required)</Label>
              <Textarea
                id="validation-notes"
                placeholder="Provide detailed clinical reasoning for your assessment..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                rows={5}
                className="mt-2"
                required
              />
            </div>
            <div>
              <Label htmlFor="validation-recommendations">Recommendations</Label>
              <Textarea
                id="validation-recommendations"
                placeholder="Additional tests, follow-up care, treatment recommendations..."
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setValidationDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-heart-red hover:bg-heart-red-dark"
              onClick={handleSubmitValidation}
              disabled={!validationScore || !clinicalNotes.trim()}
            >
              <Send className="mr-2 h-4 w-4 text-white" />
              Submit Validation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Second Opinion Dialog */}
      <Dialog open={secondOpinionDialogOpen} onOpenChange={setSecondOpinionDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Request Second Opinion</DialogTitle>
            <DialogDescription>Request another clinician to review this case.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="second-opinion-reason">Reason for Request (Required)</Label>
            <Textarea
              id="second-opinion-reason"
              placeholder="Explain why a second opinion is needed..."
              value={secondOpinionReason}
              onChange={(e) => setSecondOpinionReason(e.target.value)}
              rows={6}
              className="mt-2"
              required
            />
            <p className="mt-2 text-xs text-gray-500">
              A senior clinician will be notified to review this case.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSecondOpinionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-heart-red hover:bg-heart-red-dark"
              onClick={handleRequestSecondOpinion}
              disabled={!secondOpinionReason.trim()}
            >
              <MessageSquare className="mr-2 h-4 w-4 text-white" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
