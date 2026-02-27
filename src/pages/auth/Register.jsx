import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabase.js";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password; // do not trim passwords

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Enter a valid email address.");
      setLoading(false);
      return;
    }

    if (cleanPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: {
        data: { name: cleanName },
      },
    });

    if (authError) {
      const msg = (authError.message || "").toLowerCase();

      if (authError.status === 429 || msg.includes("rate limit")) {
        setError("Too many attempts. Wait a few minutes and try again.");
      } else if (msg.includes("invalid")) {
        setError("Email rejected by auth provider. Try another email or fix Supabase Email provider settings.");
      } else {
        setError(authError.message);
      }

      setLoading(false);
      return;
    }

    if (data?.user?.id) {
      await supabase.from("users").upsert([
        {
          id: data.user.id,
          name: cleanName,
          email: cleanEmail,
        },
      ]);
    }

    setLoading(false);
    navigate("/login", { replace: true });
  };

  return (
    <section className="register-layout">
      <div className="register-hero card">
        <p className="badge">RenovaTrack</p>
        <h1>Plan, budget, and complete renovations with confidence.</h1>
        <p>
          Organize projects, track tasks, manage expenses, and document every renovation stage in one
          professional workspace.
        </p>
      </div>

      <div className="auth-container register-card">
        <h2>Create your account</h2>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className="stack">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating account..." : "Get Started"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
