import ParamedicImportWizard from './ParamedicImportModal';
import ExportTemplateButton from '@/components/import/ExportTemplateButton';

export default function ImportParamedicPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">Import Paramedic</h1>
      <ExportTemplateButton type="paramedic" className="mb-6" />
      <ParamedicImportWizard />
    </div>
  );
}