import NotificationCenter from "./NotificationCenter";

interface RealTimeNotificationsProps {
  userId?: string;
  className?: string;
}

export const RealTimeNotifications = ({ className }: RealTimeNotificationsProps) => {
  return (
    <div className={className}>
      <NotificationCenter />
    </div>
  );
};