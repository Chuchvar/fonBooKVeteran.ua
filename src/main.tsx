
import ReactDOM from "react-dom/client";
import App from './App.tsx'
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const rootElem = document.getElementById("root");
const queryClient = new QueryClient();

if (rootElem) {
  const root = ReactDOM.createRoot(rootElem);
  root.render(
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>,
  );
}
