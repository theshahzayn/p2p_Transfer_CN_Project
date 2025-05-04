import { TransferProvider } from './contexts/TransferContext';
import { UserProvider } from './contexts/UserContext';
import HomePage from './pages/HomePage';
import UsernameModal from './components/UsernameModal';

function App() {
  return (
    <UserProvider>
      <TransferProvider>
        <HomePage />
        <UsernameModal />
      </TransferProvider>
    </UserProvider>
  );
}

export default App;