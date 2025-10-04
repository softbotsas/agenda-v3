// public/js/chat-widget.js

const ChatNubeWidget = {
    // --- Configuración y Estado ---
    config: {},
    state: {
        token: null,
        isMinimized: true,
        chatList: [],
        activeChat: null,
        messages: [],
        socket: null,
    },
    elements: {},

    // --- Punto de Entrada ---
    init(config) {
        this.config = config;
        this.createBaseStyles();
        this.createBaseElements();
        this.authenticateAndConnect();
    },

    // --- Autenticación y Conexión ---
    async authenticateAndConnect() {
        try {
            const response = await fetch(`${this.config.apiBaseUrl}/widget/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    widgetKey: this.config.widgetKey,
                    userId: this.config.userId,
                    companyId: this.config.companyId,
                }),
            });

            console.log('hoaaaaaa')
            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            this.state.token = data.token;
            this.connectSocket();
        } catch (error) {
            console.error("Error de autenticación del Widget:", error.message);
            this.elements.widgetContainer.innerHTML = '<p>Error de autenticación</p>';
        }
    },

    connectSocket() {
        // Si no tenemos token o el socket ya existe, no hacemos nada.
        if (!this.state.token || this.state.socket) return;
    
        this.state.socket = io(this.config.socketUrl, { auth: { token: this.state.token } });
    
        // --- LISTENER PRINCIPAL DE CONEXIÓN ---
        this.state.socket.on('connect', () => {
            console.log('Widget conectado a Socket.IO exitosamente.');
            this.fetchInitialData(); // Cargamos los datos iniciales
        });
    
        // --- LISTENER PARA ERRORES Y DESCONEXIÓN ---
        this.state.socket.on('disconnect', () => console.log('Widget desconectado.'));
        this.state.socket.on('connect_error', (err) => console.error("Error de conexión del socket:", err.message));
    
    
        // =============================================================
        // AQUÍ VAN TODOS LOS LISTENERS PARA EVENTOS EN TIEMPO REAL
        // =============================================================
    
        // Listener para cuando un CHAT INTERNO recibe un mensaje
        this.state.socket.on('nuevo_mensaje_interno', (mensaje) => {
            console.log('Mensaje interno recibido:', mensaje);
            const esMiPropioMensaje = mensaje.remitente_id === this.config.userId;
            const esChatActivo = this.state.activeChat?.id === mensaje.conversacion_id;
    
            // Si es un eco de un mensaje que yo envié, lo ignoramos visualmente
            if (esMiPropioMensaje) return;
    
            if (esChatActivo) {
                // Si es del chat activo, lo añadimos a la pantalla
                this.state.messages.push({
                    id: mensaje._id,
                    text: mensaje.contenido,
                    isSender: false
                });
                this.renderMessages(); // Volvemos a dibujar los mensajes
            } else {
                // Si no, actualizamos el contador y la lista
                const chatIndex = this.state.chatList.findIndex(c => c.id === mensaje.conversacion_id);
                if (chatIndex !== -1) {
                    this.state.chatList[chatIndex].unreadCount = (this.state.chatList[chatIndex].unreadCount || 0) + 1;
                    this.state.chatList[chatIndex].lastMessage = mensaje.contenido;
                    this.renderChatList(); // Volvemos a dibujar la lista de chats
                }
            }
        });
    
        // Listener para cuando un CHAT DE CLIENTE (B2C) recibe un mensaje
        this.state.socket.on('nuevo_mensaje_cliente_b2c', (data) => {
            console.log('Mensaje B2C recibido:', data);
            const esChatActivo = this.state.activeChat?.id === data.conversacionId;
    
            if (esChatActivo) {
                this.state.messages.push({
                    id: data.mensaje._id,
                    text: data.mensaje.contenido,
                    isSender: false
                });
                this.renderMessages();
            } else {
                const chatIndex = this.state.chatList.findIndex(c => c.id === data.conversacionId);
                if (chatIndex !== -1) {
                    this.state.chatList[chatIndex].unreadCount = (this.state.chatList[chatIndex].unreadCount || 0) + 1;
                    this.state.chatList[chatIndex].lastMessage = data.mensaje.contenido;
                    this.renderChatList();
                }
            }
        });
        
        // Listener para cuando una conversación B2C se actualiza (ej. alguien la tomó)
        this.state.socket.on('conversacion_b2c_actualizada', (data) => {
            console.log('Conversación B2C actualizada:', data.conversacionId);
            const index = this.state.chatList.findIndex(c => c.id === data.conversacionId);
            const chatMapeado = this.mapChatData(data.conversacionActualizada);
            
            if (index !== -1) {
                this.state.chatList.splice(index, 1, chatMapeado);
            } else {
                this.state.chatList.unshift(chatMapeado);
            }
            // Re-renderizar la lista de chats para mostrar los cambios
            this.renderChatList();
        });
    
        // Listener para cuando llega una nueva conversación pendiente
        this.state.socket.on('nueva_conversacion_pendiente_agente', (nuevaConvData) => {
            console.log('Nueva conversación pendiente:', nuevaConvData);
            const existe = this.state.chatList.some(c => c.id === nuevaConvData._id.toString());
            if (!existe) {
                this.state.chatList.unshift(this.mapChatData(nuevaConvData));
                this.renderChatList();
            }
        });
    },

    // --- Peticiones a la API ---
    async fetchData(endpoint) {
        const response = await fetch(`${this.config.apiBaseUrl}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${this.state.token}` }
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    async fetchInitialData() {
        const [internalChats, b2cChats] = await Promise.all([
            this.fetchData('/internal-chats'),
            this.fetchData('/agent/conversations')
        ]);
        this.state.chatList = [...internalChats, ...b2cChats].map(this.mapChatData.bind(this));
        this.renderChatList();
    },

    async fetchMessages(chat) {
        this.state.messages = [];
        const endpoint = chat.tipo === 'b2c_chat' 
            ? `/agent/conversations/${chat.id}/messages` 
            : `/internal-chats/${chat.id}/messages`;
        const data = await this.fetchData(endpoint);
        this.state.messages = (data.mensajes || []).map(msg => ({
            id: msg._id, text: msg.contenido,
            isSender: chat.tipo === 'b2c_chat' 
                ? msg.remitente_tipo === 'agente' && msg.remitente_id === this.config.userId
                : msg.remitente_id === this.config.userId
        })).reverse();
        this.renderMessages();
    },

    // --- Renderizado de la Interfaz ---
    createBaseElements() {
        this.elements.widgetContainer = document.getElementById(this.config.containerId);
        this.render();
    },

    render() {
        this.elements.widgetContainer.innerHTML = ''; // Limpiar
        if (this.state.isMinimized) {
            const button = document.createElement('button');
            button.className = 'cn-widget-button';
            button.innerHTML = '💬'; // Icono simple
            button.onclick = () => {
                this.state.isMinimized = false;
                this.render();
            };
            this.elements.widgetContainer.appendChild(button);
        } else {
            const windowDiv = document.createElement('div');
            windowDiv.className = 'cn-widget-window';
            windowDiv.innerHTML = `
                <header class="cn-header">
                    <span>Empresa - ${this.config.companyName}</span>
                    <button class="cn-minimize-btn">&minus;</button>
                </header>
                <div class="cn-content"></div>
                <footer class="cn-footer">
                    <input type="text" class="cn-input" placeholder="Escribe un mensaje...">
                    <button class="cn-send-btn">&#9658;</button>
                </footer>
            `;
            windowDiv.querySelector('.cn-minimize-btn').onclick = () => {
                this.state.isMinimized = true;
                this.render();
            };
            this.elements.widgetContainer.appendChild(windowDiv);
            this.elements.content = windowDiv.querySelector('.cn-content');
            this.renderChatList(); // Mostrar la lista de chats por defecto
        }
    },

    renderChatList() {
        if (!this.elements.content) return;
        let listHTML = '';
        this.state.chatList.forEach(chat => {
            listHTML += `<div class="cn-chat-item" data-id="${chat.id}">${chat.name}</div>`;
        });
        this.elements.content.innerHTML = listHTML;
        
        // Añadir listeners a los items de la lista
        this.elements.content.querySelectorAll('.cn-chat-item').forEach(item => {
            item.onclick = () => {
                const selectedChat = this.state.chatList.find(c => c.id === item.dataset.id);
                this.state.activeChat = selectedChat;
                this.fetchMessages(selectedChat);
            };
        });
    },

    renderMessages() {
        if (!this.elements.content || !this.state.activeChat) return;
        let messagesHTML = `<header class="cn-chat-header"><button class="cn-back-btn">&larr;</button> <strong>${this.state.activeChat.name}</strong></header>`;
        this.state.messages.forEach(msg => {
            messagesHTML += `<div class="cn-message ${msg.isSender ? 'sent' : 'received'}">${msg.text}</div>`;
        });
        this.elements.content.innerHTML = messagesHTML;
        
        this.elements.content.querySelector('.cn-back-btn').onclick = () => {
            this.state.activeChat = null;
            this.renderChatList();
        };
    },

    // --- Mapeo de Datos (igual que en tu widget de Vue) ---
    mapChatData(item) {
        // ... Pega aquí tu función mapChatData completa ...
        // Ejemplo simplificado:
        return {
            id: item._id,
            name: item.nombre_chat_interno || item.nombre_cliente_final || 'Chat',
            tipo: item.canal_origen ? 'b2c_chat' : 'interna_p2p'
        };
    },

    // --- Estilos ---
    createBaseStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            .cn-widget-button { position: fixed; bottom: 60px; right: 200px; width: 60px; height: 60px; border-radius: 50%; background-color: #007bff; color: white; border: none; font-size: 24px; cursor: pointer; box-shadow: 0 4px 8px rgba(0,0,0,0.2); z-index: 2147483647;; }
            .cn-widget-window { position: fixed; bottom: 60px; right: 200px; width: 320px; height: 480px; background: white; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); display: flex; flex-direction: column;  z-index: 2147483647;}
            .cn-header { background: #007bff; color: white; padding: 10px; border-top-left-radius: 10px; border-top-right-radius: 10px; display: flex; justify-content: space-between; align-items: center; }
            .cn-minimize-btn { background: none; border: none; color: white; font-size: 20px; cursor: pointer; }
            .cn-content { flex-grow: 1; overflow-y: auto; padding: 10px; }
            .cn-footer { padding: 10px; border-top: 1px solid #eee; display: flex; }
            .cn-input { flex-grow: 1; border: 1px solid #ccc; border-radius: 20px; padding: 5px 10px; }
            .cn-send-btn { background: #007bff; color: white; border-radius: 50%; border: none; width: 30px; height: 30px; margin-left: 10px; cursor: pointer; }
            .cn-chat-item { padding: 10px; cursor: pointer; border-bottom: 1px solid #f0f0f0; }
            .cn-chat-item:hover { background-color: #f7f7f7; }
            .cn-chat-header { padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid #eee; }
            .cn-back-btn { margin-right: 10px; background: none; border: none; cursor: pointer; font-size: 18px; }
            .cn-message { padding: 8px 12px; border-radius: 15px; margin-bottom: 8px; max-width: 80%; }
            .cn-message.sent { background-color: #007bff; color: white; align-self: flex-end; }
            .cn-message.received { background-color: #e9e9eb; color: black; align-self: flex-start; }
        `;
        document.head.appendChild(style);
    }
};