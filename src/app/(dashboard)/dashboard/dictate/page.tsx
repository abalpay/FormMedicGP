import { getFormCatalog } from '@/lib/forms/registry';
import { DictatePageContent } from '@/components/dictation/dictate-page-content';

export default function DictatePage() {
  const formCatalog = getFormCatalog();

  return <DictatePageContent formCatalog={formCatalog} />;
}
