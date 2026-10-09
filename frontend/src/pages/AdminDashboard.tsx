import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { LockKeyhole, LogOut, RefreshCw, Truck, ChefHat, CheckCircle2, Clock3, Volume2, Package, Boxes, Eye, EyeOff, ArrowLeft, Mail } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';
const TOKEN_KEY = 'nfc_admin_token';
const ACK_KEY = 'nfc_admin_acknowledged_orders';
const ORDER_STATUSES = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];
type AdminOrder = {
  _id?: string;
  id?: string;
  orderToken?: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: { name: string; size: string; price: number; quantity: number }[];
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  status: string;
  createdAt?: string;
};
type Filter = 'All' | OrderStatus;
type AdminMenuItem = {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  imageUrl?: string;
  image?: string;
  isAvailable?: boolean;
  available?: boolean;
  variants: { size: string; price: number }[];
};

const getOrderRecordId = (order: AdminOrder) => order._id || order.id || order.orderId || order.orderToken || '';
const getMenuRecordId = (item: AdminMenuItem) => item._id || item.id || '';
const isMenuItemAvailable = (item: AdminMenuItem) => Boolean(item.isAvailable ?? item.available ?? true);

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All Orders', value: 'All' },
  { label: 'New', value: 'Placed' },
  { label: 'Preparing', value: 'Preparing' },
  { label: 'Out for Delivery', value: 'Out for Delivery' },
  { label: 'Delivered', value: 'Delivered' },
];

function playOrderChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    [880, 1175].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.17;
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.15, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.3);
    });
    window.setTimeout(() => void context.close(), 800);
  } catch {
    // The dashboard remains usable if browser audio is unavailable.
  }
}

function readAcknowledged(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(ACK_KEY) || '[]') as string[]);
  } catch {
    return new Set();
  }
}

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [authView, setAuthView] = useState<'checking' | 'setup' | 'login' | 'forgot'>(() => localStorage.getItem(TOKEN_KEY) ? 'login' : 'checking');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [menuItems, setMenuItems] = useState<AdminMenuItem[]>([]);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const [activeView, setActiveView] = useState<'orders' | 'inventory'>('orders');
  const [storeOpen, setStoreOpen] = useState(true);
  const [filter, setFilter] = useState<Filter>('All');
  const [clock, setClock] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [busyStockId, setBusyStockId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [acknowledged, setAcknowledged] = useState<Set<string>>(readAcknowledged);
  const seenOrderIds = useRef<Set<string> | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setOrders([]);
    seenOrderIds.current = null;
  }, []);

  const refreshDashboard = useCallback(async (authToken: string, showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const [ordersResponse, storeResponse] = await Promise.all([
        fetch(`${API_BASE}/admin/orders`, { headers: { Authorization: `Bearer ${authToken}` } }),
        fetch(`${API_BASE}/store/status`),
      ]);

      if (ordersResponse.status === 401 || ordersResponse.status === 403) {
        logout();
        setError('Your session expired. Please sign in again.');
        return;
      }
      if (!ordersResponse.ok) throw new Error('Could not refresh orders.');

      const orderData = await ordersResponse.json();
      const nextOrders: AdminOrder[] = orderData.orders || [];
      const ids = new Set(nextOrders.map(getOrderRecordId));
      if (seenOrderIds.current) {
        const hasNewUnacknowledgedOrder = nextOrders.some(
          (order) => !seenOrderIds.current?.has(getOrderRecordId(order)) && !acknowledged.has(getOrderRecordId(order)) && order.status === 'Placed'
        );
        if (hasNewUnacknowledgedOrder) playOrderChime();
      }
      seenOrderIds.current = ids;
      setOrders(nextOrders);
      setError('');

      if (storeResponse.ok) {
        const storeData = await storeResponse.json();
        if (typeof storeData.isStoreOpen === 'boolean') setStoreOpen(storeData.isStoreOpen);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to reach the restaurant server.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [acknowledged, logout]);

  const refreshMenu = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/menu`);
      if (!response.ok) throw new Error('Could not load menu inventory.');
      const result = await response.json();
      setMenuItems(Array.isArray(result) ? result : result.items || []);
      setMenuLoaded(true);
    } catch (menuError) {
      setError(menuError instanceof Error ? menuError.message : 'Could not load menu inventory.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (token) return;
    let isActive = true;
    fetch(`${API_BASE}/admin/auth-status`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Could not check manager setup.');
        if (isActive) setAuthView(result.initialized ? 'login' : 'setup');
      })
      .catch((statusError: unknown) => {
        if (!isActive) return;
        setAuthView('login');
        setError(statusError instanceof Error ? statusError.message : 'Unable to reach the manager service.');
      });
    return () => { isActive = false; };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    void refreshDashboard(token, true);
    const poll = window.setInterval(() => void refreshDashboard(token), 12_000);
    return () => window.clearInterval(poll);
  }, [token, refreshDashboard]);

  useEffect(() => {
    if (token && activeView === 'inventory' && !menuLoaded) void refreshMenu(true);
  }, [token, activeView, menuLoaded, refreshMenu]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginBusy(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json();
      if (!response.ok || !result.success || !result.token) {
        throw new Error(result.message || 'Invalid username or password.');
      }
      localStorage.setItem(TOKEN_KEY, result.token);
      setToken(result.token);
      setPassword('');
      setAuthMessage('');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Could not sign in.');
    } finally {
      setLoginBusy(false);
    }
  };

  const handleSetup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setAuthMessage('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      setError('Enter a valid 10-digit phone number.');
      return;
    }
    if (password.length < 8) {
      setError('Choose a password with at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setLoginBusy(true);
    try {
      const response = await fetch(`${API_BASE}/admin/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), email: email.trim(), phone: phone.replace(/\D/g, ''), password }),
      });
      const result = await response.json();
      if (!response.ok || !result.success || !result.token) throw new Error(result.message || 'Could not create manager account.');
      localStorage.setItem(TOKEN_KEY, result.token);
      setToken(result.token);
      setPassword('');
      setConfirmPassword('');
    } catch (setupError) {
      setError(setupError instanceof Error ? setupError.message : 'Could not complete manager setup.');
    } finally {
      setLoginBusy(false);
    }
  };

  const handleSendResetOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setAuthMessage('');
    setLoginBusy(true);
    try {
      const response = await fetch(`${API_BASE}/admin/forgot-password/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: forgotIdentifier.trim() }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Could not send reset code.');
      setMaskedEmail(result.maskedEmail || 'your registered email');
      setOtpSent(true);
      setAuthMessage(`If the account matches, a 6-digit code was sent to ${result.maskedEmail || 'your registered email'}.`);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Could not send reset code.');
    } finally {
      setLoginBusy(false);
    }
  };

  const handleVerifyReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setAuthMessage('');
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Choose a new password with at least 8 characters.');
      return;
    }

    setLoginBusy(true);
    try {
      const resetResponse = await fetch(`${API_BASE}/admin/forgot-password/verify-and-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: forgotIdentifier.trim(), otp, newPassword }),
      });
      const resetResult = await resetResponse.json();
      if (!resetResponse.ok || !resetResult.success) throw new Error(resetResult.message || 'Could not reset password.');

      const loginResponse = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: forgotIdentifier.trim(), password: newPassword }),
      });
      const loginResult = await loginResponse.json();
      if (!loginResponse.ok || !loginResult.success || !loginResult.token) {
        setUsername(forgotIdentifier.trim());
        setPassword(newPassword);
        setAuthView('login');
        setAuthMessage('Password updated. Sign in with your new password.');
        return;
      }
      localStorage.setItem(TOKEN_KEY, loginResult.token);
      setToken(loginResult.token);
      setNewPassword('');
      setOtp('');
      setOtpSent(false);
      setForgotIdentifier('');
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Could not reset password.');
    } finally {
      setLoginBusy(false);
    }
  };

  const toggleStore = async () => {
    if (!token) return;
    const nextOpen = !storeOpen;
    try {
      const response = await fetch(`${API_BASE}/store/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          isStoreOpen: nextOpen,
          closingMessage: nextOpen ? '' : 'Online ordering is temporarily paused. Please check back soon.',
        }),
      });
      const result = await response.json();
      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }
      if (!response.ok || !result.success) throw new Error(result.message || 'Could not update store status.');
      setStoreOpen(result.isStoreOpen);
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'Could not update store status.');
    }
  };

  const advanceOrder = async (order: AdminOrder) => {
    const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
      Placed: 'Preparing',
      Preparing: 'Out for Delivery',
      'Out for Delivery': 'Delivered',
    };
    const status = nextStatus[order.status as OrderStatus];
    const recordId = order._id || order.id || order.orderId || order.orderToken;
    const authToken = token || localStorage.getItem(TOKEN_KEY);
    if (!status || !authToken || !recordId) {
      setError(!authToken ? 'Your manager session has expired. Please sign in again.' : 'This order is missing an identifier and cannot be updated.');
      return;
    }
    let responseData: unknown;
    setBusyOrderId(recordId);
    try {
      const response = await fetch(`${API_BASE}/orders/${encodeURIComponent(recordId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ status }),
      });
      responseData = await response.json();
      const result = responseData as { success?: boolean; message?: string };
      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }
      if (!response.ok || !result.success) throw new Error(result.message || 'Could not update order status.');
      setOrders((current) => current.map((item) => getOrderRecordId(item) === recordId ? { ...item, status } : item));
      setError('');
    } catch (statusError) {
      const responseErrorData = (statusError as { response?: { data?: unknown } })?.response?.data;
      console.error('Order status update failed:', responseErrorData ?? responseData ?? statusError);
      setError(statusError instanceof Error ? statusError.message : 'Could not update order status.');
    } finally {
      setBusyOrderId(null);
    }
  };

  const toggleMenuAvailability = async (item: AdminMenuItem) => {
    if (!token) return;
    const recordId = getMenuRecordId(item);
    if (!recordId) {
      setError('This menu item is missing its database ID and cannot be updated.');
      return;
    }
    const nextAvailability = !isMenuItemAvailable(item);
    setBusyStockId(recordId);
    setMenuItems((current) => current.map((entry) => getMenuRecordId(entry) === recordId
      ? { ...entry, isAvailable: nextAvailability, available: nextAvailability }
      : entry));
    try {
      const response = await fetch(`${API_BASE}/menu/${encodeURIComponent(recordId)}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isAvailable: nextAvailability, available: nextAvailability }),
      });
      const result = await response.json();
      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }
      if (!response.ok || !result.success) throw new Error(result.message || 'Could not update item stock.');
      const saved: AdminMenuItem = result.item;
      setMenuItems((current) => current.map((entry) => getMenuRecordId(entry) === recordId
        ? { ...entry, ...saved, isAvailable: saved.isAvailable ?? nextAvailability, available: saved.available ?? nextAvailability }
        : entry));
      setError('');
    } catch (stockError) {
      setMenuItems((current) => current.map((entry) => getMenuRecordId(entry) === recordId
        ? { ...entry, isAvailable: !nextAvailability, available: !nextAvailability }
        : entry));
      setError(stockError instanceof Error ? stockError.message : 'Could not update item stock.');
    } finally {
      setBusyStockId(null);
    }
  };

  const acknowledgeOrder = (id: string) => {
    const next = new Set(acknowledged);
    next.add(id);
    setAcknowledged(next);
    localStorage.setItem(ACK_KEY, JSON.stringify([...next]));
  };

  const acknowledgeOrderCard = (order: AdminOrder) => {
    const id = getOrderRecordId(order);
    if (id) acknowledgeOrder(id);
  };

  const visibleOrders = useMemo(
    () => orders.filter((order) => filter === 'All' || order.status === filter),
    [orders, filter]
  );
  const pendingCount = orders.filter((order) => order.status !== 'Delivered').length;

  if (!token) {
    if (authView === 'checking') {
      return <main className="min-h-screen bg-stone-950 flex items-center justify-center px-4 text-amber-100"><p className="text-sm font-bold">Checking manager setup…</p></main>;
    }

    return (
      <main className="min-h-screen bg-stone-950 px-4 py-12 flex items-center justify-center">
        <section className="w-full max-w-md rounded-3xl bg-white p-7 sm:p-9 shadow-2xl border border-amber-100">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-800 text-amber-100">
            {authView === 'forgot' ? <Mail className="h-7 w-7" /> : <LockKeyhole className="h-7 w-7" />}
          </div>
          <p className="text-center text-[11px] font-black uppercase tracking-[0.25em] text-amber-700">NFC Partner</p>
          <h1 className="mt-2 text-center font-serif text-3xl font-black text-stone-900">
            {authView === 'setup' ? 'Set Up Manager Account' : authView === 'forgot' ? 'Reset Password' : 'Manager Sign In'}
          </h1>
          <p className="mt-2 text-center text-sm text-stone-500">
            {authView === 'setup' ? 'Create the first NFC Partner manager account.' : authView === 'forgot' ? 'Recover access to your manager account.' : 'Sign in to manage orders and kitchen operations.'}
          </p>

          {authView === 'setup' && (
            <form onSubmit={handleSetup} className="mt-7 space-y-4">
              <label className="block text-xs font-bold text-stone-700">User ID / Username
                <input value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} autoComplete="username" className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
              </label>
              <label className="block text-xs font-bold text-stone-700">Email Address
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
              </label>
              <label className="block text-xs font-bold text-stone-700">10-digit Phone
                <input type="tel" inputMode="numeric" value={phone} onChange={(event) => setPhone(event.target.value)} required maxLength={10} autoComplete="tel" className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
              </label>
              <label className="block text-xs font-bold text-stone-700">Password (8+ characters)
                <span className="relative mt-1.5 block"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 pr-12 text-sm font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" /><button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span>
              </label>
              <label className="block text-xs font-bold text-stone-700">Confirm Password
                <span className="relative mt-1.5 block"><input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required autoComplete="new-password" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 pr-12 text-sm font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" /><button type="button" onClick={() => setShowConfirmPassword((shown) => !shown)} aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span>
              </label>
              {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <button disabled={loginBusy} className="w-full rounded-xl bg-red-800 px-4 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-900 disabled:opacity-60">{loginBusy ? 'Creating account…' : 'Create Manager Account'}</button>
            </form>
          )}

          {authView === 'login' && (
            <form onSubmit={handleLogin} className="mt-7 space-y-4">
              <label className="block text-xs font-bold text-stone-700">Username or Email
                <input value={username} onChange={(event) => setUsername(event.target.value)} required autoComplete="username" className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
              </label>
              <label className="block text-xs font-bold text-stone-700">Password
                <span className="relative mt-1.5 block"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 pr-12 text-sm font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" /><button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span>
              </label>
              <div className="flex justify-end"><button type="button" onClick={() => { setAuthView('forgot'); setError(''); setAuthMessage(''); }} className="text-xs font-bold text-red-800 hover:underline">Forgot Password?</button></div>
              {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              {authMessage && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{authMessage}</p>}
              <button disabled={loginBusy} className="w-full rounded-xl bg-red-800 px-4 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-900 disabled:opacity-60">{loginBusy ? 'Signing in…' : 'Sign In to Dashboard'}</button>
            </form>
          )}

          {authView === 'forgot' && (
            <div className="mt-7 space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendResetOtp} className="space-y-4">
                  <label className="block text-xs font-bold text-stone-700">Username or Registered Email
                    <input value={forgotIdentifier} onChange={(event) => setForgotIdentifier(event.target.value)} required autoComplete="username" className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
                  </label>
                  {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                  <button disabled={loginBusy} className="w-full rounded-xl bg-red-800 px-4 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-red-900/20 disabled:opacity-60">{loginBusy ? 'Sending code…' : 'Send OTP'}</button>
                </form>
              ) : (
                <form onSubmit={handleVerifyReset} className="space-y-4">
                  <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{authMessage || `Enter the code sent to ${maskedEmail}.`}</p>
                  <label className="block text-xs font-bold text-stone-700">6-digit Email Code
                    <input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} required inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-center font-mono text-lg tracking-[0.4em] outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
                  </label>
                  <label className="block text-xs font-bold text-stone-700">New Password (8+ characters)
                    <span className="relative mt-1.5 block"><input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required minLength={8} autoComplete="new-password" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 pr-12 text-sm font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" /><button type="button" onClick={() => setShowNewPassword((shown) => !shown)} aria-label={showNewPassword ? 'Hide new password' : 'Show new password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500">{showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span>
                  </label>
                  {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                  <button disabled={loginBusy} className="w-full rounded-xl bg-red-800 px-4 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-red-900/20 disabled:opacity-60">{loginBusy ? 'Updating password…' : 'Reset & Sign In'}</button>
                  <button type="button" disabled={loginBusy} onClick={() => { setOtpSent(false); setOtp(''); setAuthMessage(''); }} className="w-full text-xs font-bold text-stone-600 hover:text-red-800">Send a new code</button>
                </form>
              )}
              <button type="button" onClick={() => { setAuthView('login'); setOtpSent(false); setOtp(''); setError(''); setAuthMessage(''); }} className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-red-800"><ArrowLeft className="h-3.5 w-3.5" />Back to Login</button>
            </div>
          )}

          {authView === 'setup' && authMessage && <p className="mt-4 text-center text-sm text-emerald-800">{authMessage}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 text-stone-900">
      <header className="sticky top-0 z-20 border-b border-stone-800 bg-stone-950 text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/30 bg-red-800 text-amber-200"><ChefHat className="h-6 w-6" /></div>
            <div><p className="font-serif text-lg font-black tracking-wide">NFC Partner</p><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/70">Manager & Kitchen</p></div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button onClick={() => void toggleStore()} className={`rounded-full px-4 py-2 text-[11px] font-black tracking-wider transition ${storeOpen ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40 hover:bg-emerald-500/25' : 'bg-red-500/15 text-red-300 ring-1 ring-red-500/40 hover:bg-red-500/25'}`}>
              <span className={`mr-2 inline-block h-2 w-2 rounded-full ${storeOpen ? 'bg-emerald-400' : 'bg-red-400'}`} />STORE {storeOpen ? 'OPEN' : 'CLOSED'}
            </button>
            <div className="hidden items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs sm:flex"><Clock3 className="h-4 w-4 text-amber-300" />{clock.toLocaleTimeString()}</div>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-xs font-bold text-stone-200 hover:bg-white/10"><LogOut className="h-4 w-4" />Logout</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 inline-flex rounded-xl border border-stone-200 bg-white p-1 shadow-sm">
          <button onClick={() => setActiveView('orders')} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-extrabold transition ${activeView === 'orders' ? 'bg-red-800 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-50'}`}><Truck className="h-4 w-4" />Live Orders</button>
          <button onClick={() => setActiveView('inventory')} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-extrabold transition ${activeView === 'inventory' ? 'bg-red-800 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-50'}`}><Boxes className="h-4 w-4" />Menu Items / Stock Control</button>
        </div>

        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Pending Orders</p><p className="mt-1 text-3xl font-black text-stone-900">{pendingCount}</p></div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-stone-500">New Orders</p><p className="mt-1 text-3xl font-black text-red-800">{orders.filter((order) => order.status === 'Placed').length}</p></div>
          <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><div><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Last updated</p><p className="mt-1 text-sm font-bold text-stone-800">Auto refresh every 12 seconds</p></div><button onClick={() => void refreshDashboard(token, true)} disabled={loading} aria-label="Refresh orders" className="rounded-xl border border-stone-200 p-3 text-stone-600 hover:bg-stone-50 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button></div>
        </section>

        {error && <div role="alert" className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><span>{error}</span><button onClick={() => setError('')} className="font-bold">Dismiss</button></div>}

        {activeView === 'orders' ? (
          <>
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
              {FILTERS.map(({ label, value }) => {
                const count = value === 'All' ? orders.length : orders.filter((order) => order.status === value).length;
                return <button key={value} onClick={() => setFilter(value)} className={`whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-extrabold transition ${filter === value ? 'bg-red-800 text-white shadow-md' : 'border border-stone-200 bg-white text-stone-600 hover:border-red-200 hover:text-red-800'}`}>{label} <span className={`ml-1 ${filter === value ? 'text-amber-200' : 'text-stone-400'}`}>{count}</span></button>;
              })}
            </div>
            {loading && orders.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-500">Loading orders…</div>
            ) : visibleOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400"><Volume2 className="h-6 w-6" /></div><h2 className="mt-4 font-serif text-xl font-bold text-stone-800">No orders in this view</h2><p className="mt-1 text-sm text-stone-500">New online orders will appear here automatically.</p></div>
            ) : (
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleOrders.map((order) => {
                  const recordId = getOrderRecordId(order);
                  const actionLabel: Partial<Record<OrderStatus, string>> = { Placed: 'Start Preparing', Preparing: 'Send with Rider', 'Out for Delivery': 'Mark Delivered' };
                  return (
                    <article key={recordId || order.orderId} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
                      <div className="flex items-start justify-between gap-3 border-b border-stone-100 p-4">
                        <div><p className="font-mono text-sm font-black text-red-800">{order.orderId}</p><p className="mt-1 text-sm font-bold text-stone-900">{order.customerName}</p><a href={`tel:${order.customerPhone}`} className="mt-0.5 block text-xs font-medium text-blue-700 hover:underline">{order.customerPhone}</a></div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${order.status === 'Delivered' ? 'bg-stone-100 text-stone-600' : order.status === 'Out for Delivery' ? 'bg-blue-50 text-blue-700' : order.status === 'Preparing' ? 'bg-amber-50 text-amber-800' : 'bg-red-50 text-red-700'}`}>{order.status}</span>
                      </div>
                      <div className="space-y-4 p-4">
                        <div><p className="mb-1 text-[10px] font-black uppercase tracking-wider text-stone-400">Delivery Address</p><p className="text-xs leading-relaxed text-stone-700">{order.deliveryAddress}</p></div>
                        <div><p className="mb-2 text-[10px] font-black uppercase tracking-wider text-stone-400">Order Items</p><ul className="space-y-1.5">{order.items.map((item, index) => <li key={`${item.name}-${item.size}-${index}`} className="flex justify-between gap-3 text-xs"><span className="text-stone-700"><b className="text-stone-900">{item.quantity}×</b> {item.name} <span className="text-stone-400">({item.size})</span></span><span className="shrink-0 font-semibold text-stone-700">₹{item.price * item.quantity}</span></li>)}</ul></div>
                        <div className="flex items-center justify-between border-t border-stone-100 pt-3"><div><p className="text-[10px] font-black uppercase tracking-wider text-stone-400">Total Bill</p><p className="font-serif text-xl font-black text-stone-900">₹{order.totalAmount}</p></div><span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] font-extrabold text-emerald-700">{order.paymentStatus === 'Paid' || order.paymentMethod === 'ONLINE' ? 'Paid via Online' : order.paymentStatus || 'Online'}</span></div>
                        {order.status === 'Placed' && !acknowledged.has(recordId) && <button onClick={() => acknowledgeOrderCard(order)} className="w-full rounded-lg border border-amber-300 bg-amber-50 py-2 text-[11px] font-bold text-amber-800 hover:bg-amber-100">Acknowledge New Order</button>}
                        {actionLabel[order.status as OrderStatus] && <button onClick={() => void advanceOrder(order)} disabled={busyOrderId === recordId} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-800 py-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-red-900 disabled:opacity-60">{order.status === 'Preparing' ? <Truck className="h-4 w-4" /> : order.status === 'Out for Delivery' ? <CheckCircle2 className="h-4 w-4" /> : <ChefHat className="h-4 w-4" />}{busyOrderId === recordId ? 'Updating…' : actionLabel[order.status as OrderStatus]}</button>}
                        {order.createdAt && <p className="text-right text-[10px] text-stone-400">{new Date(order.createdAt).toLocaleString()}</p>}
                      </div>
                    </article>
                  );
                })}
              </section>
            )}
          </>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 p-4 sm:px-5">
              <div><h2 className="flex items-center gap-2 font-serif text-lg font-black text-stone-900"><Package className="h-5 w-5 text-red-800" />Menu Inventory</h2><p className="mt-1 text-xs text-stone-500">Control which dishes customers can order.</p></div>
              <button onClick={() => void refreshMenu(true)} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />Refresh Menu</button>
            </div>
            {loading && !menuLoaded ? (
              <div className="p-10 text-center text-sm text-stone-500">Loading menu items…</div>
            ) : menuItems.length === 0 ? (
              <div className="p-10 text-center text-sm text-stone-500">No menu items found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left">
                  <thead className="bg-stone-50 text-[10px] font-black uppercase tracking-wider text-stone-500"><tr><th className="px-5 py-3">Item</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Price From</th><th className="px-5 py-3">Availability</th></tr></thead>
                  <tbody className="divide-y divide-stone-100">
                    {menuItems.map((item) => {
                      const recordId = getMenuRecordId(item);
                      const inStock = isMenuItemAvailable(item);
                      const lowestPrice = item.variants?.length ? Math.min(...item.variants.map((variant) => variant.price)) : 0;
                      return <tr key={recordId || item.name} className="transition hover:bg-stone-50/70">
                        <td className="px-5 py-3"><div className="flex items-center gap-3"><img src={item.imageUrl || item.image || '/favicon.svg'} alt="" className="h-12 w-12 rounded-xl bg-stone-100 object-cover" /><span className="font-bold text-stone-900">{item.name}</span></div></td>
                        <td className="px-5 py-3 text-sm text-stone-600">{item.category}</td>
                        <td className="px-5 py-3 text-sm font-bold text-stone-900">₹{lowestPrice}</td>
                        <td className="px-5 py-3"><div className="flex items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{inStock ? 'In Stock' : 'Out of Stock'}</span><button type="button" role="switch" aria-checked={inStock} aria-label={`${inStock ? 'Mark' : 'Restock'} ${item.name}`} disabled={busyStockId === recordId || !recordId} onClick={() => void toggleMenuAvailability(item)} className={`relative h-7 w-12 rounded-full transition-colors disabled:cursor-wait disabled:opacity-60 ${inStock ? 'bg-emerald-600' : 'bg-stone-300'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${inStock ? 'left-1 translate-x-5' : 'left-1 translate-x-0'}`} /></button></div></td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
