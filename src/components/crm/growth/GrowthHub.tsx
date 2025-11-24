interface GrowthHubProps {
  userType?: string;
}

export const GrowthHub = (props: GrowthHubProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Growth Hub</h2>
      <p className="text-muted-foreground">Coming soon</p>
    </div>
  );
};
