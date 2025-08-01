import { BrowserRouter as Router } from "react-router-dom";
import Layout from "./components/Layout";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <Router>
      <Layout>
        <AppRoutes />
      </Layout>
    </Router>
  );
}

export default App;
