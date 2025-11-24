interface CollaborationHubProps {
  userRole?: string;
  onStartSession?: () => void;
  onUploadStems?: () => void;
  onJoinSession?: () => void;
  onReviewApprove?: () => void;
}

export const CollaborationHub = (props: CollaborationHubProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Collaboration Hub</h2>
      <p className="text-muted-foreground">Coming soon</p>
    </div>
  );
};
