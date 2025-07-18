import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { connectSocket, login } from './store/authSlice';
import Login from './components/Login';
import Signup from './components/Signup.jsx';
import Forgot from './components/Forgot.jsx';
import Chat from './components/Chat.jsx';
import { getUser} from './services/auth';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Setting from './components/Setting.jsx';
import Loading from './components/Loading/Loading.jsx';
import { getUsers } from './services/chat.js';
import Calling from './components/Calling.jsx';

function App() {
    const [isLoading, setIsLoading] = useState(true);
    const checkUser = useSelector((state) => state.auth.status);
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();

    // Initial user fetch
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getUser();
                if (userData) {
                    dispatch(login(userData));
                    getUsers(dispatch);
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [dispatch]);

    // Connect socket when user is available
    useEffect(() => {
        if (user && user._id) {
            console.log('User available, connecting socket:', user._id);
            dispatch(connectSocket(user._id));
        }
    }, [user, dispatch]);

    if (isLoading) {
        return <Loading/>;
    }

    return (
        <>
            <Routes>
                <Route path="/" element={<Home />}/>
                <Route path="/login" element={!checkUser ? <Login /> : <Navigate to="/chat" />} />
                <Route path="/signup" element={!checkUser ? <Signup /> : <Navigate to="/" />} />
                <Route path="/forgot" element={!checkUser ? <Forgot /> : <Navigate to="/" />} />
                <Route path="/chat" element={checkUser ? <Chat /> : <Navigate to="/login" />} />
                <Route path="/chat/setting" element={checkUser ? <Setting/> : <Navigate to="/"/>} />
                <Route path="/chat/calling" element={checkUser ? <Calling/> : <Navigate to="/"/>} />
            </Routes>
            <ToastContainer />
        </>
    );
}

export default App;