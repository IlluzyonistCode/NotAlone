export const isWindowFocused = () => document.hasFocus();

export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');

        return false;
    }

    const permission = await Notification.requestPermission();

    return permission === 'granted';
};

export const sendNotification = (title, options = {}) => {
    if (!('Notification' in window)) return;

    if (Notification.permission !== 'granted') return;

    const defaultOptions = {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        silent: false,
        vibrate: [200, 100, 200]
    };

    const notification = new Notification(title, { ...defaultOptions, ...options });

    notification.onclick = (event) => {
        event.preventDefault();

        window.focus();

        if (options.onClick) options.onClick();

        notification.close();
    };

    return notification;
};

export const sendMessageNotification = (senderName, messageBody, conversationId, onClick) => {
    const isEmojiOnly = (text) => {
        const trimmed = text?.trim() || '';

        if (!trimmed) return false;

        if (/[a-zA-Zа-яА-ЯёЁ0-9]/i.test(trimmed)) return false;

        const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}]/gu;
        const emojis = trimmed.match(emojiPattern);
        
        if (!emojis) return false;
        
        return emojis.length === trimmed.length;
    };

    let body = messageBody;
    let isRomantic = false;

    if (messageBody.includes('🤗 Hugs you warmly')) {
        body = 'sent you a hug 🤗';

        isRomantic = true;
    } else if (messageBody.includes('💋 Kisses you tenderly')) {
        body = 'sent you a kiss 💋';

        isRomantic = true;
    } else if (messageBody.includes('💝 Gives you their heart')) {
        body = 'sent you their heart 💝';

        isRomantic = true;
    } else if (isEmojiOnly(messageBody) && messageBody.length <= 6) {
        body = messageBody;
    } else if (messageBody.length > 50) {
        body = messageBody.substring(0, 47) + '...';
    }

    sendNotification(`${senderName} ${body}`, {
        body: isRomantic ? '💕 Romantic message 💕' : undefined,
        tag: `message-${conversationId}`,
        renotify: true,
        requireInteraction: isRomantic,
        onClick
    });
};

export const sendRomanticNotification = (senderName, actionType, onClick) => {
    const actions = {
        hug: { title: '🤗 Hug received!', body: `${senderName} sent you a warm hug!` },
        kiss: { title: '💋 Kiss received!', body: `${senderName} sent you a kiss!` },
        heart: { title: '💝 Heart received!', body: `${senderName} gave you their heart!` }
    };

    const action = actions[actionType];

    if (action)
        sendNotification(action.title, {
            body: action.body,
            tag: `romantic-${Date.now()}`,
            requireInteraction: true,
            vibrate: [200, 100, 200, 100, 300],
            onClick
        });
};
