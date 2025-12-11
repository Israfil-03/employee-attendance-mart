/**
 * 404 Not Found Page
 */
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>Oops! The page you're looking for seems to have wandered off from Rose Mart.</p>
        <Link to="/login" className="back-link">
          ← Back to Rose Mart
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
