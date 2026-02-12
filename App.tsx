import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from './services/geminiService';
import { Message, Role, Suggestion } from './types';
import MarkdownRenderer from './components/MarkdownRenderer';
import { 
  IconSend, 
  IconBot, 
  IconSparkles, 
  IconMonitorX, 
  IconWifiOff, 
  IconZap,
  IconRefresh,
  IconTrash,
  IconMessage,
  IconShare,
  IconCheck,
  IconCopy,
  IconCpu,
  IconAlert,
  IconHardDrive,
  ByteBackgroundLogo
} from './components/Icons';

const SUGGESTIONS: Suggestion[] = [
  { id: '1', label: 'Diagnóstico', prompt: 'Hola, mi computadora tiene un problema, ¿puedes ayudarme a diagnosticarlo?', icon: 'monitor' },
  { id: '2', label: 'PC Lenta', prompt: 'Mi computadora está muy lenta, ¿qué puedo hacer para optimizarla?', icon: 'zap' },
  { id: '3', label: 'Internet', prompt: 'Tengo problemas con mi conexión a internet en la PC.', icon: 'wifi' },
  { id: '4', label: 'Virus', prompt: 'Siento que mi computadora tiene un virus o malware. ¿Cómo puedo detectarlo y eliminarlo de forma segura?', icon: 'alert' },
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [dailyTip, setDailyTip] = useState('Cargando consejo del día...');
  const [isRefreshingTip, setIsRefreshingTip] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const refreshTip = async () => {
    setIsRefreshingTip(true);
    try {
      const tip = await geminiService.getQuickTip();
      setDailyTip(tip);
    } catch (e) {
      console.error("Failed to refresh tip", e);
    } finally {
      setIsRefreshingTip(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await geminiService.startChat();
        await refreshTip();
        setIsInitialized(true);
      } catch (e) {
        console.error("Failed to init", e);
      }
    };
    init();

    let cleanUrl = window.location.href.split('?')[0];
    const isPreviewOrLocal = window.location.protocol === 'blob:' || 
                             window.location.hostname === 'localhost' ||
                             window.location.hostname.includes('webcontainer') ||
                             window.location.hostname.includes('scf.usercontent.goog');

    if (isPreviewOrLocal) {
       cleanUrl = 'https://ai.studio/apps/drive/158h_7Z0fDUjN2frcM3HZArm9_gM37yzc';
    }
    setShareUrl(cleanUrl);
  }, []);

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setShowShareMenu(false);

    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: aiMsgId,
      role: Role.MODEL,
      text: '',
      timestamp: Date.now()
    }]);

    try {
      let accumulatedText = '';
      await geminiService.sendMessageStream(textToSend, (chunk) => {
        accumulatedText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === aiMsgId ? { ...msg, text: accumulatedText } : msg
        ));
      });
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId ? { ...msg, text: "Hubo un error. Intenta de nuevo.", isError: true } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareClick = async () => {
    const shareData = {
      title: 'Byte Computadoras - Soporte AI',
      text: 'Diagnóstico inteligente para tu PC.',
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return; 
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    }
    setShowShareMenu(!showShareMenu);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
      setShowShareMenu(false);
    });
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-950 text-slate-200 font-sans selection:bg-tech-500/30 relative overflow-hidden"
         onClick={() => showShareMenu && setShowShareMenu(false)}>
      
      {/* Background Watermark Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <ByteBackgroundLogo className="w-[85vw] h-[85vw] max-w-[600px] max-h-[600px] text-slate-200 opacity-[0.12]" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-tech-600 rounded-lg shadow-lg shadow-tech-900/20">
             <IconCpu className="text-white w-5 h-5" />
          </div>
          <div>
             <h1 className="font-bold text-white text-base tracking-tight leading-tight">BYTE COMPUTADORAS</h1>
             <p className="text-[9px] text-tech-400 uppercase tracking-widest font-bold">Smart Support AI</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          {/* WhatsApp Button in Header */}
          <a 
            href="https://wa.me/526681723601" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 text-green-500 hover:text-green-400 hover:bg-green-500/10 rounded-full transition-all"
            title="Soporte Humano"
          >
            <IconMessage className="w-5 h-5" />
          </a>

          <div className="relative">
            <button onClick={handleShareClick} className="p-2 text-slate-400 hover:text-white transition-colors">
              <IconShare className="w-5 h-5" />
            </button>
            {showShareMenu && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50">
                <button onClick={(e) => { e.stopPropagation(); handleCopyLink(); }} className="w-full px-4 py-3 text-xs flex items-center gap-2 hover:bg-slate-800 rounded-xl">
                  {showShareTooltip ? <IconCheck className="w-4 h-4 text-green-500" /> : <IconCopy className="w-4 h-4" />}
                  {showShareTooltip ? "¡Copiado!" : "Copiar Link"}
                </button>
              </div>
            )}
          </div>
          
          <button onClick={() => setMessages([])} className="p-2 text-slate-400 hover:text-rose-400 transition-colors">
            <IconTrash className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative w-full max-w-4xl mx-auto px-4 z-10 scrollbar-hide">
        
        {messages.length === 0 ? (
          <div className="py-8 animate-fade-in space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-2">
              <div className="inline-block p-3 bg-slate-900 rounded-3xl border border-slate-800 mb-4">
                <IconBot className="w-10 h-10 text-tech-500 animate-pulse-slow" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">Bienvenido a <span className="text-tech-500">BYTE AI</span></h2>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">Tu experto en tecnología disponible 24/7</p>
            </div>

            {/* Daily Tip Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-700/50 p-4 rounded-2xl shadow-xl relative overflow-hidden group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <IconSparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Consejo de Byte</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); refreshTip(); }} 
                  disabled={isRefreshingTip}
                  className={`p-1 rounded-md hover:bg-slate-800 transition-colors ${isRefreshingTip ? 'animate-spin text-tech-500' : 'text-slate-600'}`}
                >
                  <IconRefresh className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className={`${isRefreshingTip ? 'opacity-40' : 'opacity-100'} transition-opacity duration-300`}>
                <p className="text-slate-200 text-sm font-medium italic">"{dailyTip}"</p>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 gap-3">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Acciones Rápidas</div>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSendMessage(s.prompt)}
                  className="flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all group active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-950 rounded-xl group-hover:bg-tech-600 transition-colors">
                      {s.icon === 'monitor' && <IconMonitorX className="w-5 h-5 text-tech-500 group-hover:text-white" />}
                      {s.icon === 'zap' && <IconZap className="w-5 h-5 text-yellow-400 group-hover:text-white" />}
                      {s.icon === 'wifi' && <IconWifiOff className="w-5 h-5 text-blue-400 group-hover:text-white" />}
                      {s.icon === 'alert' && <IconAlert className="w-5 h-5 text-rose-500 group-hover:text-white" />}
                    </div>
                    <span className="font-semibold text-slate-200">{s.label}</span>
                  </div>
                  <IconSend className="w-4 h-4 text-slate-600 group-hover:text-tech-500" />
                </button>
              ))}
            </div>

            {/* Maintenance Section */}
            <div className="bg-tech-950/20 border border-tech-900/30 p-4 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-tech-400">¿Necesitas mantenimiento?</h4>
                <p className="text-[11px] text-slate-400">Limpieza física, cambio de pasta y más.</p>
              </div>
              <a href="https://wa.me/526681723601" target="_blank" className="bg-tech-600 hover:bg-tech-500 text-white text-[11px] font-bold px-4 py-2 rounded-full transition-colors shadow-lg shadow-tech-900/20">
                Agendar
              </a>
            </div>
          </div>
        ) : (
          <div className="py-6 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === Role.USER ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                {msg.role === Role.MODEL && (
                  <div className="w-8 h-8 rounded-xl bg-tech-600 flex items-center justify-center flex-shrink-0 shadow-lg mt-1">
                    <IconBot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                    msg.role === Role.USER ? 'bg-tech-600 text-white rounded-tr-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}>
                  <MarkdownRenderer content={msg.text} isUser={msg.role === Role.USER} />
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </main>

      {/* Footer Input */}
      <footer className="p-4 bg-slate-950/80 backdrop-blur-md z-30">
        <div className="max-w-4xl mx-auto flex items-center gap-2 bg-slate-900 rounded-2xl border border-slate-700 p-1.5 focus-within:border-tech-500 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
            placeholder="Describe tu problema aquí..."
            className="flex-1 bg-transparent text-slate-200 px-3 py-2 focus:outline-none resize-none text-sm max-h-32"
            rows={1}
            onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = 'auto';
                t.style.height = t.scrollHeight + 'px';
            }}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-xl transition-all ${!input.trim() || isLoading ? 'text-slate-700' : 'bg-tech-600 text-white hover:bg-tech-500 shadow-lg shadow-tech-600/20'}`}
          >
            {isLoading ? <IconRefresh className="w-5 h-5 animate-spin" /> : <IconSend className="w-5 h-5" />}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;