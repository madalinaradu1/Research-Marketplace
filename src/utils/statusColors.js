// Status color utility function
export const getStatusColorValue = (status, tokens) => {
  if (!status) return tokens.colors.neutral[60];
  
  switch (status) {
    case 'Coordinator Review':
    case 'Department Review':
      return tokens.colors.orange[60];
    case 'Faculty Review':
      return tokens.colors.blue[60];
    case 'Admin Review':
      return tokens.colors.purple[60];
    case 'Approved':
      return '#4caf50';
    case 'Returned':
      return tokens.colors.yellow[60];
    case 'Rejected':
      return tokens.colors.red[60];
    case 'Cancelled':
      return tokens.colors.neutral[80];
    case 'Expired':
      return tokens.colors.neutral[40];
    case 'Draft':
      return tokens.colors.neutral[60];
    default:
      return tokens.colors.neutral[60];
  }
};