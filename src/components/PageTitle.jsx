import { useEffect } from 'react';

const PageTitle = ({ title }) => {
  useEffect(() => {
    document.title = `${title} - Pocket Mentor`;
  }, [title]);
  return null;
};

export default PageTitle;