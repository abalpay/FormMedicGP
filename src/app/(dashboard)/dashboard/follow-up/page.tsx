import { getFormCatalog } from '@/lib/forms/registry';
import { FollowUpPageContent } from '@/components/dictation/followup-page-content';

export default function FollowUpPage() {
  const formCatalog = getFormCatalog();

  return (
    <FollowUpPageContent
      formCatalog={formCatalog.map((f) => ({ id: f.id, label: f.label }))}
    />
  );
}
