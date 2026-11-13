/* Sandbox Live Share Client (Yjs + WebSockets)
 *
 * Provides real-time collaborative editing for students and teachers.
 * Connects to the Pi relay server via wss:// and synchronizes all files,
 * active tab changes, and remote cursor positions via CodeMirror bindings.
 */

window.SandboxLiveShare = (() => {
    const DEFAULT_SERVER_URL = window.LIVESHARE_SERVER_URL || 'wss://hardwood-ceiling-trademarks-cooking.trycloudflare.com';
    const SERVER_STORAGE_KEY = 'sandbox.liveShareServer';

    function getServerUrl() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const paramServer = urlParams.get('server');
            if (paramServer && /^wss?:\/\//i.test(paramServer.trim())) {
                return paramServer.trim().replace(/\/+$/, '');
            }
            const saved = localStorage.getItem(SERVER_STORAGE_KEY);
            if (saved && /^wss?:\/\//i.test(saved.trim())) {
                return saved.trim().replace(/\/+$/, '');
            }
        } catch (e) {}
        return DEFAULT_SERVER_URL;
    }

    function setConnectionStatus(state, message) {
        const badge = document.getElementById('liveShareStatusBadge');
        const dot = document.getElementById('liveShareStatusDot');
        const text = document.getElementById('liveShareStatusText');
        const details = document.getElementById('liveShareServerDetails');
        if (text) text.textContent = message;
        if (badge && dot) {
            if (state === 'connected') {
                badge.style.background = '#dcfce7';
                badge.style.color = '#166534';
                dot.style.background = '#10b981';
            } else if (state === 'error') {
                badge.style.background = '#fee2e2';
                badge.style.color = '#991b1b';
                dot.style.background = '#ef4444';
                if (details) details.open = true;
            } else {
                badge.style.background = '#fef3c7';
                badge.style.color = '#92400e';
                dot.style.background = '#f59e0b';
            }
        }
    }

    let ydoc = null;
    let provider = null;
    let binding = null;
    let isConnected = false;
    let currentRoomId = null;
    let isHost = false;
    let role = 'student';
    let userName = 'Student';
    let userColor = '#3b82f6';

    const USER_COLORS = [
        '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
        '#3b82f6', '#8b5cf6', '#ec4899'
    ];

    function randomRoomId() {
        const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
        let id = '';
        for (let i = 0; i < 24; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    function initUser() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('role') === 'teacher' || window.location.hash.includes('role=teacher')) {
            role = 'teacher';
            userName = 'Faruk (Teacher)';
            userColor = '#10b981';
        } else {
            role = 'student';
            userName = 'Student ' + Math.floor(100 + Math.random() * 900);
            userColor = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
        }
    }

    async function startSession(roomId = null, asHost = false) {
        if (isConnected) stopSession();

        currentRoomId = roomId || randomRoomId();
        isHost = asHost;
        initUser();

        const liveBtn = document.getElementById('liveShareBtn');

        try {
            ydoc = new window.Y.Doc();
            const ymeta = ydoc.getMap('meta');
            const yfiles = ydoc.getArray('file_list');

            if (isHost) {
                // Seed ydoc immediately before creating WebsocketProvider
                const localFiles = SandboxFiles.getFiles();
                ymeta.set('language', SandboxFiles.language());
                ymeta.set('active', SandboxFiles.activeName());
                for (const f of localFiles) {
                    yfiles.push([f.name]);
                    const yt = ydoc.getText('file:' + f.name);
                    yt.insert(0, f.content);
                }
            } else {
                // Guests shouldn't overwrite local storage projects
                SandboxFiles.setPersist(false);
            }

            const docName = currentRoomId;
            const serverUrl = getServerUrl();
            const serverInput = document.getElementById('liveShareServerInput');
            if (serverInput) serverInput.value = serverUrl;
            setConnectionStatus('connecting', 'Connecting to relay server...');
            provider = new window.WebsocketProvider(serverUrl, docName, ydoc);

            provider.awareness.setLocalStateField('user', {
                name: userName,
                color: userColor,
                role: role
            });

            let connectTimer = setTimeout(() => {
                if (!isConnected) {
                    setConnectionStatus('error', 'Relay server unreachable. Start or update relay URL below.');
                }
            }, 5000);

            provider.on('status', event => {
                if (event.status === 'connected') {
                    clearTimeout(connectTimer);
                    isConnected = true;
                    setConnectionStatus('connected', 'Connected (Live)');
                    if (liveBtn) {
                        liveBtn.classList.add('btn-active');
                        liveBtn.innerHTML = '<i class="fas fa-tower-broadcast"></i> Live';
                    }
                    updateShareUrl();
                } else if (event.status === 'disconnected') {
                    isConnected = false;
                    setConnectionStatus('error', 'Disconnected from relay server.');
                }
            });

            provider.on('connection-error', () => {
                clearTimeout(connectTimer);
                isConnected = false;
                setConnectionStatus('error', 'Relay server unreachable. Start or update relay URL below.');
            });

            provider.on('sync', isSynced => {
                if (!isSynced) return;

                if (!isHost) {
                    // Sync project language if specified by host
                    const remoteLang = ymeta.get('language');
                    if (remoteLang && remoteLang !== SandboxFiles.language() && typeof window.switchLanguageTo === 'function') {
                        window.switchLanguageTo(remoteLang);
                    }

                    // Guest sync files from Yjs on join
                    const names = yfiles.toArray();
                    if (names.length > 0) {
                        SandboxFiles.syncFiles(names, (name) => {
                            const yt = ydoc.getText('file:' + name);
                            return yt.toString();
                        });
                    }
                }

                // Attach binding once initial sync completes
                attachCodeMirrorBinding();
            });

            // Watch for remote language switch (e.g. from Python to HTML)
            ymeta.observe(() => {
                const remoteLang = ymeta.get('language');
                if (remoteLang && remoteLang !== SandboxFiles.language() && typeof window.switchLanguageTo === 'function') {
                    window.switchLanguageTo(remoteLang);
                }
            });

            // Watch for remote file creations/deletions
            yfiles.observe(() => {
                const names = yfiles.toArray();
                if (names.length > 0) {
                    SandboxFiles.syncFiles(names, (name) => {
                        const yt = ydoc.getText('file:' + name);
                        return yt.toString();
                    });
                    attachCodeMirrorBinding();
                }
            });

            // Forward local file operations to Yjs
            SandboxFiles.setListener((action, ...args) => {
                if (!ydoc) return;
                if (action === 'create') {
                    const name = args[0];
                    if (!yfiles.toArray().includes(name)) {
                        yfiles.push([name]);
                    }
                    const yt = ydoc.getText('file:' + name);
                    const content = SandboxFiles.getFile(name) || '';
                    if (yt.toString() !== content) {
                        yt.delete(0, yt.length);
                        yt.insert(0, content);
                    }
                } else if (action === 'rename') {
                    const [oldName, newName] = args;
                    const oldIndex = yfiles.toArray().indexOf(oldName);
                    if (oldIndex !== -1) {
                        yfiles.delete(oldIndex, 1);
                        yfiles.insert(oldIndex, [newName]);
                    }
                    const oldYt = ydoc.getText('file:' + oldName);
                    const newYt = ydoc.getText('file:' + newName);
                    newYt.delete(0, newYt.length);
                    newYt.insert(0, oldYt.toString());
                } else if (action === 'remove') {
                    const name = args[0];
                    const idx = yfiles.toArray().indexOf(name);
                    if (idx !== -1) yfiles.delete(idx, 1);
                }
            });

            if (asHost) {
                attachCodeMirrorBinding();
                openLiveModal(currentRoomId);
            }

        } catch (err) {
            console.error('Failed to start Live Share:', err);
            alert('Could not connect to Live Share relay server.');
            stopSession();
        }
    }

    function attachCodeMirrorBinding() {
        if (!ydoc || !provider) return;
        const activeName = SandboxFiles.activeName();
        const ytext = ydoc.getText('file:' + activeName);

        if (binding) {
            binding.destroy();
            binding = null;
        }

        if (window.editor) {
            binding = new window.CodemirrorBinding(ytext, window.editor, provider.awareness);
        }
    }

    function updateShareUrl() {
        const url = new URL(window.location.href);
        url.searchParams.set('live', currentRoomId);
        window.history.replaceState(null, '', url.toString());
    }

    function stopSession() {
        if (binding) {
            binding.destroy();
            binding = null;
        }
        if (provider) {
            provider.destroy();
            provider = null;
        }
        if (ydoc) {
            ydoc.destroy();
            ydoc = null;
        }
        isConnected = false;
        currentRoomId = null;
        SandboxFiles.setListener(null);
        SandboxFiles.setPersist(true);

        const liveBtn = document.getElementById('liveShareBtn');
        if (liveBtn) {
            liveBtn.classList.remove('btn-active');
            liveBtn.innerHTML = '<i class="fas fa-tower-broadcast"></i> Live Share';
        }

        const url = new URL(window.location.href);
        url.searchParams.delete('live');
        window.history.replaceState(null, '', url.toString());
    }

    function openLiveModal(roomId) {
        const modal = document.getElementById('liveShareModal');
        const linkInput = document.getElementById('liveShareUrlInput');
        const teacherInput = document.getElementById('liveShareTeacherUrlInput');
        const serverInput = document.getElementById('liveShareServerInput');
        if (modal) {
            const serverUrl = getServerUrl();
            const serverSuffix = serverUrl !== DEFAULT_SERVER_URL ? `&server=${encodeURIComponent(serverUrl)}` : '';
            const baseUrl = `${window.location.origin}${window.location.pathname}?live=${roomId}${serverSuffix}`;
            if (linkInput) linkInput.value = baseUrl;
            if (teacherInput) teacherInput.value = `${baseUrl}&role=teacher`;
            if (serverInput) serverInput.value = serverUrl;
            modal.classList.add('show');
        }
    }

    function setCustomServerAndReconnect(newUrl) {
        const cleaned = (newUrl || '').trim().replace(/\/+$/, '');
        if (!/^wss?:\/\//i.test(cleaned)) {
            alert('Please enter a valid WebSocket URL starting with wss:// or ws://');
            return;
        }
        try { localStorage.setItem(SERVER_STORAGE_KEY, cleaned); } catch (e) {}
        const roomToReuse = currentRoomId;
        const wasHost = isHost;
        startSession(roomToReuse, wasHost);
    }

    function closeLiveModal() {
        const modal = document.getElementById('liveShareModal');
        if (modal) modal.classList.remove('show');
    }

    function checkUrlForSession() {
        const urlParams = new URLSearchParams(window.location.search);
        const liveId = urlParams.get('live');
        if (liveId) {
            startSession(liveId, false);
        }
    }

    function onLanguageChanged(newLang) {
        if (!ydoc || !provider) return;
        const ymeta = ydoc.getMap('meta');
        const yfiles = ydoc.getArray('file_list');
        ymeta.set('language', newLang);
        ymeta.set('active', SandboxFiles.activeName());

        // Update yfiles list for the new language
        const currentFiles = SandboxFiles.getFiles();
        yfiles.delete(0, yfiles.length);
        for (const f of currentFiles) {
            yfiles.push([f.name]);
            const yt = ydoc.getText('file:' + f.name);
            if (yt.length === 0) {
                yt.insert(0, f.content);
            }
        }
        attachCodeMirrorBinding();
    }

    return {
        startSession,
        stopSession,
        openLiveModal,
        closeLiveModal,
        setCustomServerAndReconnect,
        checkUrlForSession,
        attachCodeMirrorBinding,
        onLanguageChanged,
        isConnected: () => isConnected,
        getRoomId: () => currentRoomId,
        debugInfo: () => ({
            hasDoc: !!ydoc,
            hasProvider: !!provider,
            providerSynced: provider ? provider.synced : null,
            hasBinding: !!binding,
            activeName: SandboxFiles.activeName(),
            ytext: ydoc ? ydoc.getText('file:' + SandboxFiles.activeName()).toString() : null
        })
    };
})();
