import { Link } from 'react-router-dom';

export const StudioNavigation = () => {
  return (
    <div className="absolute top-4 left-4 z-20 flex items-center gap-6">
      <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
        Dashboard
      </Link>
      <Link to="/ai-store" className="text-sm font-medium hover:text-primary transition-colors">
        AI Store
      </Link>
      <Link to="/blog" className="text-sm font-medium hover:text-primary transition-colors">
        Blog
      </Link>
    </div>
  );
};
