import { createSlice } from "@reduxjs/toolkit";
import Cookies from 'js-cookie';
import { io } from 'socket.io-client';
const API_URI = import.meta.env.VITE_APP_API_URI;

const initialState = {
    status: false,
    user: null,
    onlineUsers: []
};

let socket;

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action) => {
            state.status = true;
            state.user = action.payload;
        },
        logout: (state) => {
            state.status = false;
            state.user = null;
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            if (socket) {
                socket.disconnect();
                socket = null;
            }
        },
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        }
    }
});

export const connectSocket = (userId) => (dispatch, getState) => {
    // If userId is passed directly, use it; otherwise get from state
    const { auth } = getState();
    // Handle both _id and id cases
    const userIdToUse = userId || auth.user?._id || auth.user?.id;
    
    if (!userIdToUse || userIdToUse === 'undefined' || socket) {
        return;
    }

    socket = io(API_URI, {
        query: { userId: userIdToUse }, // Use the verified user ID
        transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        randomizationFactor: 0.5,
        timeout: 20000,
        forceNew: true,     // Create a new connection each time
        autoConnect: false, // Manual connection to have more control
        withCredentials: true // Support cross-domain cookies
    });
    
    // Make socket globally accessible for components
    window.socket = socket;

    // Connection event handlers with reconnection logic
    socket.on('connect', () => {
        // Set a flag to indicate successful connection
        socket.isConnectedBefore = true;
    });

    socket.on('disconnect', (reason) => {
        // Handle various disconnection scenarios
        if (reason === 'io server disconnect' || reason === 'transport close') {
            // Server closed the connection, try to reconnect
            setTimeout(() => {
                if (socket) socket.connect();
            }, 1000);
        } else if (reason === 'ping timeout') {
            // Connection timed out, try to reconnect with new instance
            socket.disconnect();
            setTimeout(() => {
                if (socket) socket.connect();
            }, 3000);
        }
    });

    socket.on('connect_error', (err) => {
        // Connection failed, implement exponential backoff
        const reconnectDelay = socket.isConnectedBefore ? 2000 : 5000;
        setTimeout(() => {
            if (socket) socket.connect();
        }, reconnectDelay);
    });

    socket.on('onlineUsers', (users) => {
        dispatch(setOnlineUsers(users));
    });

    socket.connect();
    
    // Force request for online users after connection
    socket.on('connect', () => {
        socket.emit('getOnlineUsers');
    });
};

export const disconnectSocket = () => (dispatch) => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
    dispatch(setOnlineUsers([]));
};

// Don't export the socket variable directly as it's mutable
// Instead, provide a getter function
export const getSocket = () => socket;

export const { login, logout, setOnlineUsers } = authSlice.actions;
export default authSlice.reducer;
