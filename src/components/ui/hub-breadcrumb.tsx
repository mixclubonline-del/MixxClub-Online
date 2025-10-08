import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HubBreadcrumbProps {
  items: BreadcrumbItem[];
}

export const HubBreadcrumb = ({ items }: HubBreadcrumbProps) => {
  return (
    <nav className="flex items-center space-x-2 text-sm mb-8">
      <Link 
        to="/" 
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
      <Link 
        to="/" 
        className="text-muted-foreground hover:text-foreground transition-colors font-bold"
      >
        MIXXCLUB
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          {item.href ? (
            <Link 
              to={item.href} 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};
