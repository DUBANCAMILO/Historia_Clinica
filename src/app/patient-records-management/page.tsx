import React from 'react';
import AppLayout from '@/components/AppLayout';
import PatientRecordsPage from './components/PatientRecordsPage';

export default function PatientRecordsManagementPage() {
  return (
    <AppLayout>
      <PatientRecordsPage />
    </AppLayout>
  );
}
