import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-page">
      <section className="card hero">
        <p className="badge">RenovaTrack</p>
        <h1>Plan, budget, and complete renovations with confidence.</h1>
        <p className="hero-sub">
          Organize projects, track tasks, manage expenses, and document every renovation stage in one
          professional workspace.
        </p>
        <div className="hero-actions">
          <Link className="btn-primary" to="/register">
            Get Started
          </Link>
          <Link className="btn-secondary" to="/login">
            Login
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
