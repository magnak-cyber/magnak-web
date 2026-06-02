'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './page.module.css';
import type { Order, OrderStatus } from '@/types/orders';
import type { ProjectImageListItem } from '@/types/project-images';
import { DropdownMenu } from '@/components/ui/DropdownMenu/DropdownMenu';

type AuthStep = 'email' | 'code' | 'ready';
type AdminSection = 'orders' | 'gallery';

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'new', label: 'Nowy' },
  { value: 'in_progress', label: 'W realizacji' },
  { value: 'completed', label: 'Zakonczony' },
  { value: 'cancelled', label: 'Anulowany' },
];

const emptyEditState = {
  name: '',
  phone: '',
  email: '',
  location: '',
  packageType: '',
  startDate: '',
  additionalInfo: '',
};

const emptyCreateState = {
  name: '',
  phone: '',
  email: '',
  location: '',
  packageType: '',
  startDate: '',
  additionalInfo: '',
  status: 'new' as OrderStatus,
};

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [authStep, setAuthStep] = useState<AuthStep>('email');
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState(emptyEditState);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createState, setCreateState] = useState(emptyCreateState);
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState<string | null>(null);
  const [projectImages, setProjectImages] = useState<ProjectImageListItem[]>([]);
  const [projectImagesLoading, setProjectImagesLoading] = useState(false);
  const [projectUploadLoading, setProjectUploadLoading] = useState(false);
  const [projectImageBusyId, setProjectImageBusyId] = useState<string | null>(null);
  const [projectImageBusyAction, setProjectImageBusyAction] = useState<'rotate' | 'delete' | null>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>('orders');
  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const projectFolderInputRef = useRef<HTMLInputElement>(null);
  const statusButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const sortedOrders = useMemo(
    () =>
      [...orders].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [orders]
  );

  useEffect(() => {
    const init = async () => {
      try {
        const response = await fetch('/api/admin/auth/session', { method: 'GET' });
        if (!response.ok) {
          setAuthStep('email');
          return;
        }

        const data = await response.json();
        setEmail(data.email || '');
        setAuthStep('ready');
        await fetchOrders();
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, []);

  useEffect(() => {
    if (authStep === 'ready' && activeSection === 'gallery' && !projectImages.length && !projectImagesLoading) {
      void fetchProjectImages();
    }
  }, [activeSection, authStep, projectImages.length, projectImagesLoading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!openStatusDropdownId) {
        return;
      }

      const trigger = statusButtonRefs.current[openStatusDropdownId];
      const target = event.target as Node;
      const dropdown = document.querySelector(`[data-dropdown-type="status-${openStatusDropdownId}"]`);

      if (
        trigger &&
        !trigger.contains(target) &&
        (!dropdown || !dropdown.contains(target))
      ) {
        setOpenStatusDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openStatusDropdownId]);

  useEffect(() => {
    const input = projectFolderInputRef.current;
    if (!input) {
      return;
    }

    input.setAttribute('webkitdirectory', '');
    input.setAttribute('directory', '');
  }, [activeSection]);

  async function fetchOrders() {
    setOrdersLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) {
        setError('Nie udalo sie zaladowac zamowien.');
        return;
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch {
      setError('Blad podczas ladowania zamowien.');
    } finally {
      setOrdersLoading(false);
    }
  }

  async function fetchProjectImages() {
    setProjectImagesLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/project-images');
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Nie udalo sie zaladowac galerii projektow.');
        return;
      }

      setProjectImages(data.images || []);
    } catch {
      setError('Blad podczas ladowania galerii projektow.');
    } finally {
      setProjectImagesLoading(false);
    }
  }

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  async function requestCode() {
    setError('');
    const normalizedEmail = email.trim().toLowerCase();

    if (!validateEmail(normalizedEmail)) {
      setError('Wpisz poprawny email administratora.');
      return;
    }

    setAuthLoading(true);
    try {
      const response = await fetch('/api/admin/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Nie udalo sie wyslac kodu.');
        return;
      }

      setAuthStep('code');
    } catch {
      setError('Nie udalo sie wyslac kodu.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function verifyCode() {
    setError('');
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim();

    if (!/^\d{6}$/.test(normalizedCode)) {
      setError('Wprowadz 6-cyfrowy kod.');
      return;
    }

    setAuthLoading(true);
    try {
      const response = await fetch('/api/admin/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, code: normalizedCode }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Kod jest niepoprawny albo wygasl.');
        return;
      }

      setAuthStep('ready');
      await fetchOrders();
    } catch {
      setError('Nie udalo sie zweryfikowac kodu.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function logout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    setAuthStep('email');
    setOrders([]);
    setProjectImages([]);
    setCode('');
    setEditingId(null);
  }

  function beginEdit(order: Order) {
    setEditingId(order.id);
    setEditState({
      name: order.name,
      phone: order.phone,
      email: order.email,
      location: order.location,
      packageType: order.packageType,
      startDate: order.startDate,
      additionalInfo: order.additionalInfo,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditState(emptyEditState);
  }

  async function saveEdit(orderId: string) {
    setError('');

    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editState),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.message || 'Nie udalo sie zapisac zamowienia.');
      return;
    }

    setOrders((prev) => prev.map((item) => (item.id === orderId ? data.order : item)));
    cancelEdit();
  }

  async function createNewOrder() {
    setError('');

    if (!createState.name.trim() || !createState.phone.trim() || !createState.email.trim()) {
      setError('Wypelnij pola: imie, telefon i email.');
      return;
    }

    if (!validateEmail(createState.email)) {
      setError('Wpisz poprawny email klienta.');
      return;
    }

    setCreateLoading(true);
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createState),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Nie udalo sie dodac zamowienia.');
        return;
      }

      setOrders((prev) => [data.order, ...prev]);
      setCreateState(emptyCreateState);
      setIsCreateOpen(false);
    } catch {
      setError('Nie udalo sie dodac zamowienia.');
    } finally {
      setCreateLoading(false);
    }
  }

  async function updateStatus(orderId: string, status: OrderStatus) {
    setError('');
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.message || 'Nie udalo sie zaktualizowac statusu.');
      return;
    }

    setOrders((prev) => prev.map((item) => (item.id === orderId ? data.order : item)));
    setOpenStatusDropdownId(null);
  }

  function getStatusLabel(status: OrderStatus) {
    return statusOptions.find((item) => item.value === status)?.label || status;
  }

  function getStatusClassName(status: OrderStatus) {
    if (status === 'completed') {
      return styles.statusCompleted;
    }

    if (status === 'in_progress') {
      return styles.statusInProgress;
    }

    if (status === 'cancelled') {
      return styles.statusCancelled;
    }

    return styles.statusNew;
  }

  async function uploadProjectImages(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    if (!files?.length) {
      return;
    }

    setError('');
    setProjectUploadLoading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('files', file));

      const response = await fetch('/api/admin/project-images', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Nie udalo sie dodac obrazow.');
        return;
      }

      setProjectImages((prev) => [...prev, ...(data.images || [])]);
    } catch {
      setError('Nie udalo sie dodac obrazow.');
    } finally {
      setProjectUploadLoading(false);
      if (projectFileInputRef.current) {
        projectFileInputRef.current.value = '';
      }
    }
  }

  function openProjectFolderPicker() {
    projectFolderInputRef.current?.click();
  }

  async function deleteProjectImage(imageId: string) {
    const confirmed = window.confirm('Usunac obraz projektu?');
    if (!confirmed) {
      return;
    }

    setError('');
    setProjectImageBusyId(imageId);
    setProjectImageBusyAction('delete');
    try {
      const response = await fetch(`/api/admin/project-images/${imageId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Nie udalo sie usunac obrazu.');
        return;
      }

      setProjectImages((prev) => prev.filter((item) => item.id !== imageId));
    } catch {
      setError('Nie udalo sie usunac obrazu.');
    } finally {
      setProjectImageBusyId(null);
      setProjectImageBusyAction(null);
    }
  }

  async function rotateProjectImage(imageId: string) {
    setError('');
    setProjectImageBusyId(imageId);
    setProjectImageBusyAction('rotate');

    try {
      const response = await fetch(`/api/admin/project-images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rotate' }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Nie udalo sie obrocic obrazu.');
        return;
      }

      setProjectImages((prev) => prev.map((item) => (item.id === imageId ? data.image : item)));
    } catch {
      setError('Nie udalo sie obrocic obrazu.');
    } finally {
      setProjectImageBusyId(null);
      setProjectImageBusyAction(null);
    }
  }

  async function removeOrder(orderId: string) {
    const confirmed = window.confirm('Usunac zamowienie?');
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' });
    const data = await response.json();

    if (!response.ok) {
      setError(data.message || 'Nie udalo sie usunac zamowienia.');
      return;
    }

    setOrders((prev) => prev.filter((item) => item.id !== orderId));
    if (editingId === orderId) {
      cancelEdit();
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingCard}>
          <div className={styles.loadingSpinner} />
          <h1 className={styles.loadingTitle}>Panel administratora</h1>
          <p className={styles.loadingText}>Ladowanie danych i przygotowanie panelu...</p>
        </div>
      </div>
    );
  }

  if (authStep !== 'ready') {
    return (
      <div className={styles.page}>
        <div className={styles.authCard}>
          <h1 className={styles.authTitle}>Panel administratora</h1>
          <p className={styles.subtitle}>Bezpieczne logowanie kodem wyslanym na email administratora.</p>

          <label className={styles.label} htmlFor="admin-email">
            Email administratora
          </label>
          <input
            id="admin-email"
            className={styles.input}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@twojadomena.pl"
            disabled={authStep === 'code'}
          />

          {authStep === 'code' && (
            <>
              <label className={styles.label} htmlFor="admin-code">
                Kod potwierdzajacy
              </label>
              <input
                id="admin-code"
                className={styles.input}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                placeholder="000000"
              />
            </>
          )}

          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.actions}>
            {authStep === 'email' ? (
              <button className={styles.buttonPrimary} disabled={authLoading} onClick={requestCode}>
                {authLoading ? 'Wysylanie...' : 'Wyslij kod'}
              </button>
            ) : (
              <>
                <button className={styles.buttonPrimary} disabled={authLoading} onClick={verifyCode}>
                  {authLoading ? 'Sprawdzanie...' : 'Potwierdz i wejdz'}
                </button>
                <button className={styles.buttonGhost} disabled={authLoading} onClick={requestCode}>
                  Wyslij ponownie
                </button>
                <button
                  className={styles.buttonGhost}
                  disabled={authLoading}
                  onClick={() => {
                    setAuthStep('email');
                    setCode('');
                    setError('');
                  }}
                >
                  Zmien email
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {activeSection === 'orders' ? 'Zamowienia' : 'Galeria projektow'}
          </h1>
          <p className={styles.subtitle}>
            {activeSection === 'orders'
              ? 'Wszystkie zamowienia z formularza kontaktowego.'
              : 'Galeria projektow przechowywana jako dane pikseli w MongoDB.'}
          </p>
        </div>
        <div className={styles.headerActions}>
          {activeSection === 'orders' ? (
            <>
              <button className={styles.buttonPrimary} onClick={() => setIsCreateOpen((prev) => !prev)}>
                {isCreateOpen ? 'Ukryj formularz' : 'Dodaj zamowienie'}
              </button>
              <button className={styles.buttonGhost} onClick={fetchOrders}>
                Odswiez
              </button>
            </>
          ) : (
            <>
              <label className={styles.buttonPrimary}>
                {projectUploadLoading ? 'Wgrywanie...' : 'Dodaj obrazy'}
                <input
                  ref={projectFileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  multiple
                  className={styles.hiddenFileInput}
                  onChange={uploadProjectImages}
                  disabled={projectUploadLoading}
                />
              </label>
              <button
                className={styles.buttonGhost}
                onClick={openProjectFolderPicker}
              >
                Importuj z folderu
              </button>
              <button className={styles.buttonGhost} onClick={fetchProjectImages}>
                Odswiez
              </button>
            </>
          )}
          <button className={styles.buttonGhost} onClick={logout}>
            Wyloguj
          </button>
        </div>
      </div>

      <div className={styles.sectionNav}>
        <button
          type="button"
          className={`${styles.sectionNavButton} ${activeSection === 'orders' ? styles.sectionNavActive : ''}`}
          onClick={() => setActiveSection('orders')}
        >
          Zamowienia
        </button>
        <button
          type="button"
          className={`${styles.sectionNavButton} ${activeSection === 'gallery' ? styles.sectionNavActive : ''}`}
          onClick={() => setActiveSection('gallery')}
        >
          Galeria projektow
        </button>
      </div>

      {activeSection === 'orders' && isCreateOpen ? (
        <div className={styles.createCard}>
          <h2 className={styles.createTitle}>Nowe zamowienie</h2>
          <div className={styles.createGrid}>
            <input
              className={styles.inputInline}
              placeholder="Imie i nazwisko *"
              value={createState.name}
              onChange={(event) => setCreateState((prev) => ({ ...prev, name: event.target.value }))}
            />
            <input
              className={styles.inputInline}
              placeholder="Telefon *"
              value={createState.phone}
              onChange={(event) => setCreateState((prev) => ({ ...prev, phone: event.target.value }))}
            />
            <input
              className={styles.inputInline}
              placeholder="Email *"
              value={createState.email}
              onChange={(event) => setCreateState((prev) => ({ ...prev, email: event.target.value }))}
            />
            <input
              className={styles.inputInline}
              placeholder="Lokalizacja"
              value={createState.location}
              onChange={(event) => setCreateState((prev) => ({ ...prev, location: event.target.value }))}
            />
            <input
              className={styles.inputInline}
              placeholder="Rodzaj remontu"
              value={createState.packageType}
              onChange={(event) => setCreateState((prev) => ({ ...prev, packageType: event.target.value }))}
            />
            <input
              className={styles.inputInline}
              placeholder="Data startu"
              value={createState.startDate}
              onChange={(event) => setCreateState((prev) => ({ ...prev, startDate: event.target.value }))}
            />
          </div>
          <textarea
            className={styles.textareaInline}
            rows={3}
            placeholder="Dodatkowe informacje"
            value={createState.additionalInfo}
            onChange={(event) =>
              setCreateState((prev) => ({ ...prev, additionalInfo: event.target.value }))
            }
          />
          <div className={styles.createActions}>
            <button className={styles.buttonPrimary} onClick={createNewOrder} disabled={createLoading}>
              {createLoading ? 'Zapisywanie...' : 'Dodaj'}
            </button>
            <button
              className={styles.buttonGhost}
              onClick={() => {
                setCreateState(emptyCreateState);
                setIsCreateOpen(false);
              }}
              disabled={createLoading}
            >
              Anuluj
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className={styles.error}>{error}</p> : null}
      {activeSection === 'orders' && ordersLoading ? <p className={styles.subtitle}>Ladowanie zamowien...</p> : null}

      {activeSection === 'gallery' ? (
      <div className={styles.galleryPanel}>
        <div className={styles.galleryPanelHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Galeria projektow</h2>
            <p className={styles.sectionSubtitle}>
              {projectImagesLoading ? 'Ladowanie obrazow...' : `Liczba obrazow: ${projectImages.length}`}
            </p>
          </div>
          <div className={styles.galleryPanelActions}>
            <label className={styles.uploadButton}>
              {projectUploadLoading ? 'Wgrywanie...' : 'Dodaj obrazy'}
              <input
                ref={projectFileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg"
                multiple
                className={styles.hiddenFileInput}
                onChange={uploadProjectImages}
                disabled={projectUploadLoading}
              />
            </label>
            <button
              className={styles.buttonGhost}
              onClick={openProjectFolderPicker}
              type="button"
            >
              Importuj z folderu
            </button>
          </div>
          <input
            ref={projectFolderInputRef}
            type="file"
            multiple
            className={styles.hiddenFileInput}
            onChange={uploadProjectImages}
            disabled={projectUploadLoading}
          />
        </div>
        {projectImagesLoading ? <p className={styles.subtitle}>Ladowanie obrazow...</p> : null}
        <div className={styles.projectImagesGrid}>
          {projectImages.map((image) => (
            <article key={image.id} className={styles.projectImageCard}>
              <div
                className={styles.projectImagePreview}
                style={{ backgroundImage: `url(${image.thumbnailSrc})` }}
              />
              <div className={styles.projectImageMeta}>
                <strong className={styles.projectImageName}>{image.filename}</strong>
                <span className={styles.projectImageInfo}>
                  {image.width} x {image.height}
                </span>
              </div>
              <div className={styles.projectImageActions}>
                <button
                  className={styles.iconButton}
                  onClick={() => rotateProjectImage(image.id)}
                  type="button"
                  title="Obroc obraz"
                  aria-label="Obroc obraz"
                  disabled={projectImageBusyId === image.id}
                >
                  {projectImageBusyId === image.id && projectImageBusyAction === 'rotate' ? (
                    '...'
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className={styles.iconButtonSvg}
                    >
                      <path
                        d="M20 12a8 8 0 1 1-2.34-5.66"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M20 4v5h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
                <button
                  className={styles.buttonDanger}
                  onClick={() => deleteProjectImage(image.id)}
                  type="button"
                  disabled={projectImageBusyId === image.id}
                >
                  {projectImageBusyId === image.id && projectImageBusyAction === 'delete' ? 'Usuwanie...' : 'Usun'}
                </button>
              </div>
            </article>
          ))}
          {!projectImagesLoading && !projectImages.length ? (
            <div className={styles.emptyState}>Brak obrazow projektow.</div>
          ) : null}
        </div>
      </div>
      ) : null}

      {activeSection === 'orders' ? (
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Status</th>
              <th>Klient</th>
              <th>Kontakt</th>
              <th>Szczegoly</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map((order) => {
              const isEditing = editingId === order.id;

              return (
                <tr key={order.id}>
                  <td>{new Date(order.createdAt).toLocaleString('pl-PL')}</td>
                  <td>
                    <div className={styles.dropdownContainer}>
                      <button
                        type="button"
                        className={`${styles.statusButton} ${getStatusClassName(order.status)}`}
                        ref={(element) => {
                          statusButtonRefs.current[order.id] = element;
                        }}
                        onClick={() =>
                          setOpenStatusDropdownId((prev) => (prev === order.id ? null : order.id))
                        }
                      >
                        {getStatusLabel(order.status)}
                        <img src="/img/icons/downArrow.png" alt="open" className={styles.statusArrow} />
                      </button>
                      <DropdownMenu
                        isOpen={openStatusDropdownId === order.id}
                        triggerRef={{ current: statusButtonRefs.current[order.id] }}
                        onClose={() => setOpenStatusDropdownId(null)}
                        dropdownType={`status-${order.id}`}
                        renderInPortal
                      >
                        {statusOptions.map((option) => (
                          <li key={option.value} className={styles.statusMenuItem}>
                            <div
                              className={styles.statusMenuLink}
                              onClick={() => updateStatus(order.id, option.value)}
                            >
                              {option.label}
                            </div>
                          </li>
                        ))}
                      </DropdownMenu>
                    </div>
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        className={styles.inputInline}
                        value={editState.name}
                        onChange={(event) =>
                          setEditState((prev) => ({ ...prev, name: event.target.value }))
                        }
                      />
                    ) : (
                      order.name
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <>
                        <input
                          className={styles.inputInline}
                          value={editState.phone}
                          onChange={(event) =>
                            setEditState((prev) => ({ ...prev, phone: event.target.value }))
                          }
                        />
                        <input
                          className={styles.inputInline}
                          value={editState.email}
                          onChange={(event) =>
                            setEditState((prev) => ({ ...prev, email: event.target.value }))
                          }
                        />
                      </>
                    ) : (
                      <>
                        <div>{order.phone}</div>
                        <div>{order.email}</div>
                      </>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <>
                        <input
                          className={styles.inputInline}
                          value={editState.location}
                          onChange={(event) =>
                            setEditState((prev) => ({ ...prev, location: event.target.value }))
                          }
                          placeholder="Lokalizacja"
                        />
                        <input
                          className={styles.inputInline}
                          value={editState.packageType}
                          onChange={(event) =>
                            setEditState((prev) => ({ ...prev, packageType: event.target.value }))
                          }
                          placeholder="Rodzaj remontu"
                        />
                        <input
                          className={styles.inputInline}
                          value={editState.startDate}
                          onChange={(event) =>
                            setEditState((prev) => ({ ...prev, startDate: event.target.value }))
                          }
                          placeholder="Data startu"
                        />
                        <textarea
                          className={styles.textareaInline}
                          value={editState.additionalInfo}
                          onChange={(event) =>
                            setEditState((prev) => ({ ...prev, additionalInfo: event.target.value }))
                          }
                          rows={3}
                        />
                      </>
                    ) : (
                      <>
                        <div>
                          <strong>Lokalizacja:</strong> {order.location}
                        </div>
                        <div>
                          <strong>Typ:</strong> {order.packageType}
                        </div>
                        <div>
                          <strong>Start:</strong> {order.startDate}
                        </div>
                        <div>
                          <strong>Info:</strong> {order.additionalInfo}
                        </div>
                      </>
                    )}
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      {isEditing ? (
                        <>
                          <button className={styles.buttonPrimary} onClick={() => saveEdit(order.id)}>
                            Zapisz
                          </button>
                          <button className={styles.buttonGhost} onClick={cancelEdit}>
                            Anuluj
                          </button>
                        </>
                      ) : (
                        <button className={styles.buttonGhost} onClick={() => beginEdit(order)}>
                          Edytuj
                        </button>
                      )}
                      <button className={styles.buttonDanger} onClick={() => removeOrder(order.id)}>
                        Usun
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!sortedOrders.length ? (
              <tr>
                <td colSpan={6}>
                  <div className={styles.emptyState}>Brak zamowien.</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      ) : null}
    </div>
  );
}
