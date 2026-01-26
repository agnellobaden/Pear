// MODAL NOTIFICATION SYSTEM
// Zeigt neue Einträge in einem Modal an, das nur durch OK-Button geschlossen werden kann

// Override native alert to fix encoding automatically
(function () {
    const originalAlert = window.alert;
    window.alert = function (message) {
        if (typeof message === 'string') {
            message = message
                .replace(/Ã¤/g, 'ä').replace(/Ã¶/g, 'ö').replace(/Ã¼/g, 'ü').replace(/ÃŸ/g, 'ß')
                .replace(/Ã„/g, 'Ä').replace(/Ã–/g, 'Ö').replace(/Ãœ/g, 'Ü')
                .replace(/â‚¬/g, '€').replace(/â€"/g, '–').replace(/â€¦/g, '…')
                .replace(/Ã /g, 'à').replace(/Ã¡/g, 'á').replace(/Ã¢/g, 'â').replace(/Ã£/g, 'ã')
                .replace(/Ã¨/g, 'è').replace(/Ã©/g, 'é').replace(/Ãª/g, 'ê').replace(/Ã«/g, 'ë')
                .replace(/Ã¬/g, 'ì').replace(/Ã­/g, 'í').replace(/Ã®/g, 'î').replace(/Ã¯/g, 'ï')
                .replace(/Ã±/g, 'ñ').replace(/Ã²/g, 'ò').replace(/Ã³/g, 'ó').replace(/Ã´/g, 'ô').replace(/Ãµ/g, 'õ')
                .replace(/Ã¹/g, 'ù').replace(/Ãº/g, 'ú').replace(/Ã»/g, 'û').replace(/Ã½/g, 'ý')
                .replace(/âœ…/g, '✅').replace(/âœ¨/g, '✨').replace(/ðŸš€/g, '🚀').replace(/ðŸ"'/g, '🔒')
                .replace(/ðŸ''/g, '👑').replace(/ðŸ"¥/g, '🔥').replace(/ðŸ›'/g, '🛒').replace(/ðŸ"🔴/g, '🔴')
                .replace(/ðŸŸ🟢/g, '🟢').replace(/â¬†ï¸/g, '⬆️').replace(/âš¡/g, '⚡').replace(/â Œ/g, '❌')
                .replace(/ðŸ"/g, '📍').replace(/ðŸ""/g, '🔔').replace(/📍…/g, '📍').replace(/â€¢/g, '•')
                .replace(/Ã—/g, '×').replace(/Ã¸/g, 'ø').replace(/Ã¥/g, 'å').replace(/Ã¦/g, 'æ')
                .replace(/Ã§/g, 'ç').replace(/Ã¿/g, 'ÿ').replace(/âŒ/g, '❌').replace(/âš–ï¸/g, '⚖️')
                .replace(/ðŸ'§/g, '💧').replace(/ðŸŽ‰/g, '🎉');
        }
        return originalAlert.call(window, message);
    };

    // Override confirm as well
    const originalConfirm = window.confirm;
    window.confirm = function (message) {
        if (typeof message === 'string') {
            message = message
                .replace(/Ã¤/g, 'ä').replace(/Ã¶/g, 'ö').replace(/Ã¼/g, 'ü').replace(/ÃŸ/g, 'ß')
                .replace(/Ã„/g, 'Ä').replace(/Ã–/g, 'Ö').replace(/Ãœ/g, 'Ü')
                .replace(/â‚¬/g, '€').replace(/â€"/g, '–').replace(/â€¦/g, '…')
                .replace(/Ã /g, 'à').replace(/Ã¡/g, 'á').replace(/Ã¢/g, 'â').replace(/Ã£/g, 'ã')
                .replace(/Ã¨/g, 'è').replace(/Ã©/g, 'é').replace(/Ãª/g, 'ê').replace(/Ã«/g, 'ë')
                .replace(/Ã¬/g, 'ì').replace(/Ã­/g, 'í').replace(/Ã®/g, 'î').replace(/Ã¯/g, 'ï')
                .replace(/Ã±/g, 'ñ').replace(/Ã²/g, 'ò').replace(/Ã³/g, 'ó').replace(/Ã´/g, 'ô').replace(/Ãµ/g, 'õ')
                .replace(/Ã¹/g, 'ù').replace(/Ãº/g, 'ú').replace(/Ã»/g, 'û').replace(/Ã½/g, 'ý')
                .replace(/âœ…/g, '✅').replace(/âœ¨/g, '✨').replace(/ðŸš€/g, '🚀').replace(/ðŸ"'/g, '🔒')
                .replace(/ðŸ''/g, '👑').replace(/ðŸ"¥/g, '🔥').replace(/ðŸ›'/g, '🛒').replace(/ðŸ"🔴/g, '🔴')
                .replace(/ðŸŸ🟢/g, '🟢').replace(/â¬†ï¸/g, '⬆️').replace(/âš¡/g, '⚡').replace(/â Œ/g, '❌')
                .replace(/ðŸ"/g, '📍').replace(/ðŸ""/g, '🔔').replace(/📍…/g, '📍').replace(/â€¢/g, '•')
                .replace(/Ã—/g, '×').replace(/Ã¸/g, 'ø').replace(/Ã¥/g, 'å').replace(/Ã¦/g, 'æ')
                .replace(/Ã§/g, 'ç').replace(/Ã¿/g, 'ÿ').replace(/âŒ/g, '❌').replace(/âš–ï¸/g, '⚖️')
                .replace(/ðŸ'§/g, '💧').replace(/ðŸŽ‰/g, '🎉');
        }
        return originalConfirm.call(window, message);
    };
})();



window.showModalNotification = function (title, message, type = 'info', details = null, onConfirm = null) {
    // Fix encoding for all text inputs
    const fixEncoding = (str) => {
        if (!str || typeof str !== 'string') return str;
        return str
            .replace(/Ã¤/g, 'ä').replace(/Ã¶/g, 'ö').replace(/Ã¼/g, 'ü').replace(/ÃŸ/g, 'ß')
            .replace(/Ã„/g, 'Ä').replace(/Ã–/g, 'Ö').replace(/Ãœ/g, 'Ü')
            .replace(/â‚¬/g, '€').replace(/â€"/g, '–').replace(/â€¦/g, '…')
            .replace(/Ã /g, 'à').replace(/Ã¡/g, 'á').replace(/Ã¢/g, 'â').replace(/Ã£/g, 'ã')
            .replace(/Ã¨/g, 'è').replace(/Ã©/g, 'é').replace(/Ãª/g, 'ê').replace(/Ã«/g, 'ë')
            .replace(/Ã¬/g, 'ì').replace(/Ã­/g, 'í').replace(/Ã®/g, 'î').replace(/Ã¯/g, 'ï')
            .replace(/Ã±/g, 'ñ').replace(/Ã²/g, 'ò').replace(/Ã³/g, 'ó').replace(/Ã´/g, 'ô').replace(/Ãµ/g, 'õ')
            .replace(/Ã¹/g, 'ù').replace(/Ãº/g, 'ú').replace(/Ã»/g, 'û').replace(/Ã½/g, 'ý')
            .replace(/âœ…/g, '✅').replace(/âœ¨/g, '✨').replace(/ðŸš€/g, '🚀').replace(/ðŸ"'/g, '🔒')
            .replace(/ðŸ''/g, '👑').replace(/ðŸ"¥/g, '🔥').replace(/ðŸ›'/g, '🛒').replace(/ðŸ"🔴/g, '🔴')
            .replace(/ðŸŸ🟢/g, '🟢').replace(/â¬†ï¸/g, '⬆️').replace(/âš¡/g, '⚡').replace(/â Œ/g, '❌')
            .replace(/ðŸ"/g, '📍').replace(/ðŸ""/g, '🔔').replace(/📍…/g, '📍').replace(/â€¢/g, '•')
            .replace(/Ã—/g, '×').replace(/Ã¸/g, 'ø').replace(/Ã¥/g, 'å').replace(/Ã¦/g, 'æ')
            .replace(/Ã§/g, 'ç').replace(/Ã¿/g, 'ÿ');
    };

    // Apply encoding fix
    title = fixEncoding(title);
    message = fixEncoding(message);
    if (details) details = fixEncoding(details);

    // Remove existing modal if any
    const existing = document.getElementById('modalNotificationOverlay');
    if (existing) existing.remove();

    // Create overlay - VOLLSTÄNDIG BLOCKIEREND!
    const overlay = document.createElement('div');
    overlay.id = 'modalNotificationOverlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: blur(10px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-out;
        padding: 20px;
        cursor: not-allowed;
    `;

    // BLOCKIERE ALLE INTERAKTIONEN mit der App darunter
    overlay.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        // Shake-Animation wenn auf Overlay geklickt wird
        const modal = document.getElementById('modalNotificationContent');
        if (modal) {
            modal.style.animation = 'shake 0.5s';
            setTimeout(() => {
                modal.style.animation = 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            }, 500);
        }
    }, true);

    // Color schemes
    const colors = {
        'info': {
            bg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            icon: '📥',
            border: '#3b82f6',
            glow: 'rgba(59, 130, 246, 0.5)'
        },
        'success': {
            bg: 'linear-gradient(135deg, #10b981, #059669)',
            icon: '✅',
            border: '#10b981',
            glow: 'rgba(16, 185, 129, 0.5)'
        },
        'warning': {
            bg: 'linear-gradient(135deg, #f59e0b, #d97706)',
            icon: '⚠️',
            border: '#f59e0b',
            glow: 'rgba(245, 158, 11, 0.5)'
        },
        'danger': {
            bg: 'linear-gradient(135deg, #ef4444, #dc2626)',
            icon: '❌',
            border: '#ef4444',
            glow: 'rgba(239, 68, 68, 0.5)'
        }
    };
    const color = colors[type] || colors['info'];

    // Create modal content
    const modal = document.createElement('div');
    modal.id = 'modalNotificationContent'; // ID für Shake-Animation
    modal.style.cssText = `
        background: #1e293b;
        border-radius: 24px;
        padding: 0;
        max-width: 500px;
        width: 100%;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
        animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        overflow: hidden;
        cursor: default;
    `;

    // Build modal HTML
    modal.innerHTML = `
        <!-- Header with gradient -->
        <div style="
            background: ${color.bg};
            padding: 30px 24px;
            text-align: center;
            position: relative;
            box-shadow: 0 4px 20px ${color.glow};
        ">
            <div style="
                font-size: 4rem;
                margin-bottom: 12px;
                animation: bounce 0.6s ease-out;
            ">${color.icon}</div>
            <h2 style="
                margin: 0;
                color: white;
                font-size: 1.5rem;
                font-weight: 800;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            ">${title}</h2>
        </div>

        <!-- Content -->
        <div style="padding: 24px;">
            <div style="
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid ${color.border};
                border-radius: 16px;
                padding: 20px;
                margin-bottom: 24px;
                box-shadow: 0 0 20px ${color.glow};
            ">
                <div style="
                    color: white;
                    font-size: 1.1rem;
                    line-height: 1.6;
                    font-weight: 600;
                    text-align: center;
                ">${message}</div>
            </div>

            ${details ? `
                <div style="
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 24px;
                ">
                    <div style="
                        color: rgba(255, 255, 255, 0.7);
                        font-size: 0.9rem;
                        line-height: 1.5;
                    ">${details}</div>
                </div>
            ` : ''}

            <!-- OK Button -->
            <button id="modalNotificationOkBtn" style="
                width: 100%;
                padding: 16px;
                background: ${color.bg};
                border: none;
                border-radius: 12px;
                color: white;
                font-size: 1.1rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s;
                box-shadow: 0 4px 15px ${color.glow};
                text-transform: uppercase;
                letter-spacing: 1px;
            " onmouseover="
                this.style.transform = 'scale(1.05)';
                this.style.boxShadow = '0 6px 25px ${color.glow}';
            " onmouseout="
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 4px 15px ${color.glow}';
            ">
                ✓ OK, Verstanden
            </button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Close ONLY on OK button click - NO OTHER OPTIONS!
    const okBtn = document.getElementById('modalNotificationOkBtn');
    okBtn.onclick = function () {
        overlay.style.animation = 'fadeOut 0.3s ease-in';
        modal.style.animation = 'slideDown 0.3s ease-in';
        setTimeout(() => {
            overlay.remove();
            // Call the onConfirm callback if provided
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
        }, 300);
    };

    // KEIN Overlay-Klick mehr (verhindert versehentliches Schließen)
    // KEINE ESC-Taste mehr (verhindert versehentliches Schließen)
    // NUR OK-Button funktioniert!

    // Play notification sound
    playModalNotificationSound();
};

// Notification sound
function playModalNotificationSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();

        // First tone
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(800, ctx.currentTime);
        gain1.gain.setValueAtTime(0.15, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.3);

        // Second tone (higher)
        setTimeout(() => {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1000, ctx.currentTime);
            gain2.gain.setValueAtTime(0.15, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start();
            osc2.stop(ctx.currentTime + 0.3);
        }, 150);
    } catch (e) {
        console.warn('Audio error', e);
    }
}

// Add CSS animations
const modalNotificationStyle = document.createElement('style');
modalNotificationStyle.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    @keyframes slideUp {
        from { 
            transform: translateY(50px) scale(0.9);
            opacity: 0;
        }
        to { 
            transform: translateY(0) scale(1);
            opacity: 1;
        }
    }
    @keyframes slideDown {
        from { 
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        to { 
            transform: translateY(50px) scale(0.9);
            opacity: 0;
        }
    }
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
`;
document.head.appendChild(modalNotificationStyle);
