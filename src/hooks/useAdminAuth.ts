import { useState } from 'react';

export const useAdminAuth = () => {
  const [isAdmin] = useState(false);
  const [checking] = useState(false);

  return { isAdmin, checking };
};