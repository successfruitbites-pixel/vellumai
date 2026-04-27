import React, { Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const MergeTool = lazy(() => import('../tools/merge'));
const SplitTool = lazy(() => import('../tools/split'));
const CompressTool = lazy(() => import('../tools/compress'));
const RotateTool = lazy(() => import('../tools/rotate'));
const LockTool = lazy(() => import('../tools/lock'));
const UnlockTool = lazy(() => import('../tools/unlock'));
const PdfToJpgTool = lazy(() => import('../tools/pdf-to-jpg'));
const ImageCompressTool = lazy(() => import('../tools/image-compress'));
const ImageToWebpTool = lazy(() => import('../tools/image-to-webp'));
const ImageResizerTool = lazy(() => import('../tools/image-resizer'));
const AIUpscaleTool = lazy(() => import('../tools/ai-upscale'));
const BgRemovalTool = lazy(() => import('../tools/bg-removal'));
const ScannerTool = lazy(() => import('../tools/scanner'));

export default function ToolPage() {
  const { toolId } = useParams();
  const navigate = useNavigate();

  const renderTool = () => {
    switch (toolId) {
      case 'merge': return <MergeTool />;
      case 'split': return <SplitTool />;
      case 'compress': return <CompressTool />;
      case 'rotate': return <RotateTool />;
      case 'lock': return <LockTool />;
      case 'unlock': return <UnlockTool />;
      case 'pdf-to-jpg': return <PdfToJpgTool />;
      case 'image-compress': return <ImageCompressTool />;
      case 'image-to-webp': return <ImageToWebpTool />;
      case 'image-resize': return <ImageResizerTool />;
      case 'ai-upscale': return <AIUpscaleTool />;
      case 'bg-removal': return <BgRemovalTool />;
      case 'scanner': return <ScannerTool />;
      default: return (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Tool not found or under construction</h2>
          <button onClick={() => navigate('/app/tools')} className="text-blue-500 hover:underline">
            Back to Tools
          </button>
        </div>
      );
    }
  };

  return (
    <Suspense fallback={<div className="flex h-[50vh] items-center justify-center dark:text-white">Loading tool...</div>}>
      {renderTool()}
    </Suspense>
  );
}
