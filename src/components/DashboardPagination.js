import React from 'react';
import { Flex } from '@aws-amplify/ui-react';
import buttonStyles from '../styles/dashboardButtons.module.css';

const getVisiblePages = (totalPages, currentPage, maxVisiblePages) => {
  const visibleCount = Math.max(1, Math.min(maxVisiblePages || totalPages, totalPages));

  if (totalPages <= visibleCount) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const leftOffset = Math.floor(visibleCount / 2);
  const rightOffset = visibleCount - leftOffset - 1;

  let startPage = currentPage - leftOffset;
  let endPage = currentPage + rightOffset;

  if (startPage < 1) {
    endPage += 1 - startPage;
    startPage = 1;
  }

  if (endPage > totalPages) {
    startPage -= endPage - totalPages;
    endPage = totalPages;
  }

  startPage = Math.max(1, startPage);

  return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
};

const DashboardPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  justifyContent = 'flex-end',
  marginTop = '1rem',
  maxVisiblePages,
  showPageNumbers = true,
  showPreviousNext = true
}) => {
  if (totalPages <= 1) return null;

  const secondaryButtonClassName = `${buttonStyles.actionButton} ${buttonStyles.paginationButton} ${buttonStyles.paginationButtonSecondary}`;
  const visiblePages = showPageNumbers
    ? getVisiblePages(totalPages, currentPage, maxVisiblePages)
    : [];

  return (
    <Flex justifyContent={justifyContent} alignItems="center" gap="0.55rem" marginTop={marginTop} wrap="wrap">
      {showPreviousNext && (
        <button
          type="button"
          data-dashboard-button="true"
          className={secondaryButtonClassName}
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
      )}

      {visiblePages.map((page) => (
        <button
          key={page}
          type="button"
          data-dashboard-button="true"
          className={`${buttonStyles.actionButton} ${buttonStyles.paginationButton} ${
            currentPage === page ? buttonStyles.paginationButtonPrimary : buttonStyles.paginationButtonSecondary
          } ${buttonStyles.paginationNumber}`}
          onClick={() => onPageChange(page)}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {showPreviousNext && (
        <button
          type="button"
          data-dashboard-button="true"
          className={secondaryButtonClassName}
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      )}
    </Flex>
  );
};

export default DashboardPagination;
