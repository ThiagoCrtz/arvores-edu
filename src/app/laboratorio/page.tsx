import { Suspense } from 'react';
import Lab from '@/components/tree/Lab';

export const metadata = { title: 'Laboratório de Árvores — ArvoreLab' };

export default function LabPage() {
  return (
    <Suspense fallback={null}>
      <Lab />
    </Suspense>
  );
}
