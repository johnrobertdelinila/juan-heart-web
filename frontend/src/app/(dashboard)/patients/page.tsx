'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Search, Filter, UserPlus } from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  age: number;
  sex: string;
  lastAssessment: string;
  riskLevel: 'High' | 'Moderate' | 'Low';
  totalAssessments: number;
  status: 'Active' | 'Follow-up' | 'Discharged';
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setPatients([
        {
          id: 1,
          name: 'Maria Santos',
          age: 58,
          sex: 'Female',
          lastAssessment: '2024-10-22',
          riskLevel: 'High',
          totalAssessments: 5,
          status: 'Active',
        },
        {
          id: 2,
          name: 'Juan Dela Cruz',
          age: 45,
          sex: 'Male',
          lastAssessment: '2024-10-20',
          riskLevel: 'Moderate',
          totalAssessments: 3,
          status: 'Follow-up',
        },
        {
          id: 3,
          name: 'Ana Garcia',
          age: 34,
          sex: 'Female',
          lastAssessment: '2024-10-18',
          riskLevel: 'Low',
          totalAssessments: 2,
          status: 'Active',
        },
        {
          id: 4,
          name: 'Pedro Reyes',
          age: 62,
          sex: 'Male',
          lastAssessment: '2024-10-22',
          riskLevel: 'High',
          totalAssessments: 7,
          status: 'Active',
        },
        {
          id: 5,
          name: 'Sofia Lim',
          age: 51,
          sex: 'Female',
          lastAssessment: '2024-10-15',
          riskLevel: 'Moderate',
          totalAssessments: 4,
          status: 'Discharged',
        },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

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
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Follow-up':
        return 'bg-blue-100 text-blue-800';
      case 'Discharged':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="border-t-heart-red mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300" />
          <p className="text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-midnight-blue text-3xl font-bold">Patients</h1>
          <p className="mt-2 text-gray-600">
            Manage patient records and track cardiovascular health
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Patients</CardDescription>
            <CardTitle className="text-3xl">892</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Patients</CardDescription>
            <CardTitle className="text-3xl text-green-600">645</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Currently monitored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Follow-up Required</CardDescription>
            <CardTitle className="text-3xl text-blue-600">127</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Scheduled visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>High Risk Patients</CardDescription>
            <CardTitle className="text-3xl text-red-600">89</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Patients List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Patient Registry</CardTitle>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-left text-sm font-medium text-gray-600">Patient Name</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-600">Age/Sex</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-600">Risk Level</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-600">
                    Last Assessment
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-gray-600">
                    Total Assessments
                  </th>
                  <th className="pb-3 text-right text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-heart-red/10 flex h-10 w-10 items-center justify-center rounded-full">
                          <Users className="text-heart-red h-5 w-5" />
                        </div>
                        <span className="text-midnight-blue font-medium">{patient.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-gray-700">
                      {patient.age}y / {patient.sex}
                    </td>
                    <td className="py-4">
                      <Badge className={getRiskColor(patient.riskLevel)}>{patient.riskLevel}</Badge>
                    </td>
                    <td className="py-4">
                      <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                    </td>
                    <td className="py-4 text-sm text-gray-700">{patient.lastAssessment}</td>
                    <td className="py-4 text-center text-sm text-gray-700">
                      {patient.totalAssessments}
                    </td>
                    <td className="py-4 text-right">
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
