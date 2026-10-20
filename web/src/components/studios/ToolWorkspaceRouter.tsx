import React from 'react';
import { StudioId } from '../../types';
import { StudioTheme } from '../../constants/tokens';
import { getToolsByStudio, getToolById } from '../../data/webRegistry';
import { ToolSelectorBar } from '../common/ToolSelectorBar';
import { ToolSeoSection } from '../common/ToolSeoSection';
import { ComingSoonScreen } from '../common/ComingSoonScreen';
import { ToolPageHeader } from '../common/ToolPageHeader';
import { useAppStore } from '../../store/useAppStore';

// All 16 Specialized Offline Workspaces
import { PdfWorkspace } from '../../workspaces/PdfWorkspace';
import { ImageWorkspace } from '../../workspaces/ImageWorkspace';
import { ScannerWorkspace } from '../../workspaces/ScannerWorkspace';
import { VideoWorkspace } from '../../workspaces/VideoWorkspace';
import { AudioWorkspace } from '../../workspaces/AudioWorkspace';
import { OfficeWorkspace } from '../../workspaces/OfficeWorkspace';
import { ArchiveWorkspace } from '../../workspaces/ArchiveWorkspace';
import { TextWorkspace } from '../../workspaces/TextWorkspace';
import { DeveloperWorkspace } from '../../workspaces/DeveloperWorkspace';
import { CalculatorsWorkspace } from '../../workspaces/CalculatorsWorkspace';
import { SecurityWorkspace } from '../../workspaces/SecurityWorkspace';
import { WebWorkspace } from '../../workspaces/WebWorkspace';
import { AiWorkspace } from '../../workspaces/AiWorkspace';
import { ProductivityWorkspace } from '../../workspaces/ProductivityWorkspace';
import { AccessibilityWorkspace } from '../../workspaces/AccessibilityWorkspace';
import { AdvancedWorkspace } from '../../workspaces/AdvancedWorkspace';

interface ToolWorkspaceRouterProps {
  studioId: StudioId;
  toolId: number;
  onSelectTool: (id: number) => void;
}

export const ToolWorkspaceRouter: React.FC<ToolWorkspaceRouterProps> = ({
  studioId,
  toolId,
  onSelectTool,
}) => {
  const { setActiveStudio, setActiveTool } = useAppStore();

  const handleBreadcrumbSelect = (id: StudioId | null) => {
    setActiveStudio(id);
    setActiveTool(null);
  };
  const tools = getToolsByStudio(studioId);
  const currentTool = getToolById(toolId) || tools[0];
  const theme = StudioTheme[studioId];

  // Render Studio-Specific Workspaces (100% Offline, Zero Mock Alerts)
  const renderWorkspaceContent = () => {
    if (currentTool && currentTool.status !== 'available') {
      return <ComingSoonScreen tool={currentTool} accentColor={theme.accent} />;
    }

    switch (studioId) {
      case 'pdf':
        return <PdfWorkspace toolId={toolId} accentColor={theme.accent} />;
      case 'image':
        return <ImageWorkspace toolId={toolId} accentColor={theme.accent} />;
      case 'scanner':
        return <ScannerWorkspace toolId={toolId} accentColor={theme.accent} />;
      case 'video':
        return <VideoWorkspace toolId={toolId} accentColor={theme.accent} />;
      case 'audio':
        return <AudioWorkspace toolId={toolId} accentColor={theme.accent} />;
      case 'office':
        return <OfficeWorkspace toolId={toolId} accentColor={theme.accent} />;
      case 'archive':
        return <ArchiveWorkspace toolId={toolId} accentColor={theme.accent} />;
      case 'text':
        return <TextWorkspace toolId={toolId} accentColor={theme.accent} />;
      case 'developer':
        return <DeveloperWorkspace toolId={toolId} accentColor={theme.accent} />;
      case 'calculators':
        return <CalculatorsWorkspace toolId={toolId} accentColor={theme.accent} />;
      case 'qr_security':
        return <SecurityWorkspace toolId={toolId} accentColor={theme.accent} />;
      case 'web':
        return <WebWorkspace toolId={toolId} accentColor={theme.accent} />;
      case 'ai':
        return <AiWorkspace toolId={toolId} accentColor={theme.accent} />;
      case 'productivity':
        return <ProductivityWorkspace toolId={toolId} accentColor={theme.accent} />;
      case 'accessibility':
        return <AccessibilityWorkspace toolId={toolId} accentColor={theme.accent} />;
      case 'advanced':
        return <AdvancedWorkspace toolId={toolId} accentColor={theme.accent} />;
      default:
        return <DeveloperWorkspace toolId={toolId} accentColor={theme.accent} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Favorite Toggle */}
      {currentTool && (
        <ToolPageHeader tool={currentTool} studioId={studioId} onSelectStudio={handleBreadcrumbSelect} />
      )}

      {/* Horizontal Tool Selector Bar */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-10">
        <ToolSelectorBar
          tools={tools}
          activeToolId={toolId}
          onSelectTool={onSelectTool}
          accentColor={theme.accent}
        />
      </div>

      {/* Main Workspace Body */}
      <div className="pt-2">
        {renderWorkspaceContent()}
      </div>

      {/* SEO & Educational Informational Section */}
      {currentTool && (
        <ToolSeoSection
          tool={currentTool}
          studioId={studioId}
          onSelectTool={onSelectTool}
          onSelectStudio={(id) => setActiveStudio(id)}
        />
      )}
    </div>
  );
};
