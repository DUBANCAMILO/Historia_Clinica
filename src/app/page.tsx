import React from 'react';
import AppLayout from '@/components/AppLayout';
import ClinicalHistoryPage from './components/ClinicalHistoryPage';

export default function Home() {
  return (
    <AppLayout>
      <ClinicalHistoryPage />
    </AppLayout>
  );
}