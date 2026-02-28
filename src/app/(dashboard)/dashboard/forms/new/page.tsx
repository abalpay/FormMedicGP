import { getFormCatalog } from '@/lib/forms/registry';
import { NewFormContent } from '@/components/forms/new-form-content';

export default function NewFormPage() {
  const catalog = getFormCatalog();
  return <NewFormContent catalog={catalog} />;
}
