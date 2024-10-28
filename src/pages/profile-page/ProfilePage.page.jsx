import { useState, useEffect } from 'react';
import { updateEmail, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../../utils/firebase.utils';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../store/user/userSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);
  const [email, setEmail] = useState(currentUser?.email || '');
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email);
      setDisplayName(currentUser.displayName);
    }
  }, [currentUser]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (auth.currentUser && email !== currentUser.email) {
        await updateEmail(auth.currentUser, email);
      }

      // Update display name
      if (auth.currentUser && displayName !== currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName });
      }

      // Upload profile picture if selected
      if (profilePicture) {
        const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
        await uploadBytes(storageRef, profilePicture);
        const photoURL = await getDownloadURL(storageRef);
        await updateProfile(auth.currentUser, { photoURL });

        dispatch(setUser({
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName,
          photoURL,
        }));
      }

      setSuccess('Profile updated successfully!');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h2>Profile</h2>
      <form onSubmit={handleProfileUpdate}>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display Name"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfilePicture(e.target.files[0])}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default ProfilePage;
