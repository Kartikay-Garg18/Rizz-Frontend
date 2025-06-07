import React from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import {useNavigate} from 'react-router-dom';
import Header from './HomePage/Header.jsx';
import Main from './HomePage/Content.jsx';
import Footer from './HomePage/Footer.jsx';

const Home = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const authStatus = useSelector(state => state.auth.status);
  const authData = useSelector(state => state.auth.user);
    const logoutHandle = () => {
        dispatch(logout());
        navigate('/login');
    }

  return (
    <div className='container font-pop'>
        <Header></Header>
        <Main></Main>
        <Footer></Footer>
    </div>
  )
}

export default Home