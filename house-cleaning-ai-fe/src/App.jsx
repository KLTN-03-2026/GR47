// src/App.jsx
import { RouterProvider } from "react-router-dom";
import router from "./routes"; // Tự động trỏ vào src/routes/index.jsx

function App() {
  return <RouterProvider router={router} />;
}

export default App;