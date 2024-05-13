import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Nav from '../../components/common/Nav/Nav';

export default function FeedUpload() {
  const navigate = useNavigate();

  useEffect(() => {
    if (
      !sessionStorage.getItem('_id') ||
      !sessionStorage.getItem('accountname') ||
      !sessionStorage.getItem('token')
    ) {
      navigate('/');
    }
  }, [navigate]);

  if (
    !sessionStorage.getItem('_id') ||
    !sessionStorage.getItem('accountname') ||
    !sessionStorage.getItem('token')
  ) {
    return null;
  }
  return (
    <>
      <FeedEdit />
      <Nav />
    </>
  );
}
