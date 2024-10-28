import { useDispatch } from "react-redux";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from "../../utils/firebase.utils";
import { setUser } from "../../store/user/userSlice";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

const Auth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');

    const handleSignUp = async () => {
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, userEmail, password);
            const { uid, email, displayName } = userCredential.user;
            await setDoc(doc(db, 'users', uid), {
                uid,
                email,
                displayName: displayName || '',
            });
            dispatch(setUser({ uid, email, displayName }));
            navigate('/home');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
            const { uid, email, displayName } = userCredential.user;
            dispatch(setUser({ uid, email, displayName }));
            navigate('/home');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            dispatch(setUser(null));
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div>
            <h2>{isRegistering ? 'Sign Up' : 'Sign in'}</h2>
            <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Email"
                required
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            {isRegistering && (
                <>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    required
                />
                 <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display name"
                    required
                />
                </>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {isRegistering ? (
                <button onClick={handleSignUp}>Sign Up</button>
            ) : (
                <button onClick={handleLogin}>Sign In</button>
            )}

            <button onClick={() => setIsRegistering(!isRegistering)}>
                {isRegistering ? 'Already have an account? Login' : 'Need an account? Sign Up'}
            </button>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Auth;
