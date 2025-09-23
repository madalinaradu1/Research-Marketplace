import React from 'react';
import { Card, Button, Flex } from '@aws-amplify/ui-react';
import { cardStyles, buttonStyles, paginationStyles } from '../../styles/commonStyles';

export const StyledCard = ({ children, ...props }) => (
  <Card {...cardStyles} {...props}>
    {children}
  </Card>
);

export const StyledButton = ({ variant = 'primary', children, ...props }) => (
  <Button {...buttonStyles[variant]} {...props}>
    {children}
  </Button>
);

export const Pagination = ({ items, currentPage, setPage, itemsPerPage = 10 }) => {
  const totalPages = Math.ceil(items.length / itemsPerPage);
  if (totalPages <= 1) return null;

  return (
    <Flex {...paginationStyles.container}>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <Button
          key={page}
          {...paginationStyles.button}
          {...(page === currentPage ? paginationStyles.activeButton : paginationStyles.inactiveButton)}
          onClick={() => setPage(page)}
        >
          {page}
        </Button>
      ))}
    </Flex>
  );
};