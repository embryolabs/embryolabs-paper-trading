// src/pages/Profile.jsx
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { formatDate } from '../utils/date';

const ProfilePage = () => {
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="profile-page container mx-auto p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white shadow-md rounded p-6"
            >
            
                <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p>
                    <strong>Joined:</strong>{' '}
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </p>
                <p>
                    <strong>Last Login:</strong> {formatDate(user.lastLogin)}
                </p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                >
                    Logout
                </motion.button>
            </motion.div>
        </div>
    );
};

export default ProfilePage;

