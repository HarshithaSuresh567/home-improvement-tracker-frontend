import { useAuth } from "../hooks/useAuth.js";

const Profile = () => {
  const { user } = useAuth();
  const name =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    (user?.email ? String(user.email).split("@")[0] : "User");

  return (
    <div className="projects-container">
      <h1 className="text-3xl font-bold">👤 My Profile</h1>

      <section className="card">
        <h2 className="mb-3 text-xl font-semibold">🧾 Account Details</h2>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Email:</strong> {user?.email || "-"}</p>
        <p><strong>User ID:</strong> {user?.id || "-"}</p>
      </section>
    </div>
  );
};

export default Profile;
