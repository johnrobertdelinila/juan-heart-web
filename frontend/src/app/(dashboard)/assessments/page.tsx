'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Search, Filter, Download } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1';

interface Assessment {
  id: number;
  assessment_external_id: string;
  patient_first_name: string;
  patient_last_name: string;
  patient_date_of_birth: string;
  final_risk_level: 'High' | 'Moderate' | 'Low';
  ml_risk_score: number;
  assessment_date: string;
  status: string;
  validator?: {
    first_name: string;
    last_name: string;
  };
}

interface AssessmentStats {
  total_assessments: number;
  pending_assessments: number;
  validated_assessments: number;
  high_risk_assessments: number;
  average_risk_score: number;
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [stats, setStats] = useState<AssessmentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch assessments list
        const assessmentsResponse = await fetch(`${API_BASE_URL}/assessments?per_page=10`);
        const assessmentsData = await assessmentsResponse.json();

        // Fetch statistics
        const statsResponse = await fetch(`${API_BASE_URL}/assessments/statistics`);
        const statsData = await statsResponse.json();

        if (assessmentsData.success) {
          setAssessments(assessmentsData.data);
        }

        if (statsData.success) {
          setStats(statsData.data);
        }
      } catch (error) {
        console.error('Error fetching assessments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getAge = (dateOfBirth: string): number => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string): string => {
    if (status === 'pending') return 'Pending';
    if (status === 'validated') return 'Validated';
    if (status === 'in_review') return 'In Review';
    if (status === 'requires_referral') return 'Requires Referral';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'validated':
        return 'bg-blue-100 text-blue-800';
      case 'in_review':
        return 'bg-purple-100 text-purple-800';
      case 'requires_referral':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="border-t-heart-red mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300" />
          <p className="text-gray-600">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-midnight-blue text-3xl font-bold">Assessments</h1>
          <p className="mt-2 text-gray-600">
            Review and validate cardiovascular risk assessments from the mobile app
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Assessments</CardDescription>
            <CardTitle className="text-3xl">
              {stats?.total_assessments.toLocaleString() || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl text-orange-600">
              {stats?.pending_assessments || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Requires validation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>High Risk</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {stats?.high_risk_assessments || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Priority assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg. ML Score</CardDescription>
            <CardTitle className="text-3xl">{stats?.average_risk_score.toFixed(1) || '0.0'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">All assessments</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Assessment Queue</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-heart-red/10 flex h-12 w-12 items-center justify-center rounded-lg">
                    <FileText className="text-heart-red h-6 w-6" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="text-midnight-blue font-semibold">
                        {assessment.patient_first_name} {assessment.patient_last_name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {getAge(assessment.patient_date_of_birth)}y
                      </Badge>
                    </div>
                    <p className="mb-2 text-sm text-gray-600">
                      {assessment.assessment_external_id} • {formatDate(assessment.assessment_date)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className={getRiskColor(assessment.final_risk_level)}>
                        {assessment.final_risk_level} Risk
                      </Badge>
                      <Badge className={getStatusColor(assessment.status)}>
                        {getStatusLabel(assessment.status)}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        ML Score: {assessment.ml_risk_score}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {assessment.status === 'pending' && <Button size="sm">Validate</Button>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
