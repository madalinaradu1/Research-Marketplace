// Common styling constants and utilities for consistent UI across the application

export const colors = {
  primary: '#2d3748',
  secondary: '#4a5568',
  tertiary: '#718096',
  background: '#f5f5f5',
  cardBackground: 'white',
  border: '#e2e8f0',
  success: 'green',
  warning: '#856404',
  error: '#c53030'
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem'
};

export const cardStyles = {
  backgroundColor: colors.cardBackground,
  padding: spacing.lg,
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

export const buttonStyles = {
  primary: {
    backgroundColor: 'white',
    color: 'black',
    border: '1px solid black'
  },
  secondary: {
    backgroundColor: '#f7fafc',
    color: '#4a5568',
    border: '1px solid #e2e8f0'
  }
};

export const modalStyles = {
  overlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000
  },
  content: {
    maxWidth: '900px',
    width: '100%',
    maxHeight: '100vh',
    backgroundColor: 'white',
    overflow: 'auto'
  }
};

export const paginationStyles = {
  container: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1rem'
  },
  button: {
    size: 'small',
    border: '1px solid #552b9a'
  },
  activeButton: {
    backgroundColor: '#552b9a',
    color: 'white'
  },
  inactiveButton: {
    backgroundColor: 'white',
    color: 'black'
  }
};