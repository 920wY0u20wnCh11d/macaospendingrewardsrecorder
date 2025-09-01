// Calculate expiry date based on draw date (30 days after draw date)
export const calculateExpiryDate = (drawDate: string): string => {
  const draw = new Date(drawDate);
  const expiry = new Date(draw);
  expiry.setDate(expiry.getDate() + 30); // 30 days expiry
  return expiry.toISOString().split('T')[0];
};

// Validate draw date to ensure it's not on weekends
export const validateDrawDate = (date: string): { isValid: boolean; error?: string } => {
  const drawDate = new Date(date);
  const dayOfWeek = drawDate.getDay(); // 0 = Sunday, 6 = Saturday
  
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      isValid: false,
      error: 'Draw date cannot be on weekends (Saturday or Sunday)'
    };
  }
  
  // Check if date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  drawDate.setHours(0, 0, 0, 0);
  
  if (drawDate < today) {
    return {
      isValid: false,
      error: 'Draw date cannot be in the past'
    };
  }
  
  return { isValid: true };
};

// Generate unique ID for awards
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Check if award is expired
export const isAwardExpired = (expiryDate: string): boolean => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  return today > expiry;
};