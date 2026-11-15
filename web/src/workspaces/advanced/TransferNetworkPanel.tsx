import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Wifi,
  Radio,
  Share2,
  Copy,
  Check,
  Download,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  ExternalLink,
} from 'lucide-react';
import { chunkPayloadForQrTransfer, QrChunk } from './advancedHelpers';
import { WEB_TOOLS } from '../../data/webRegistry';

interface ToolProps {
  toolId: number;
  copied?: boolean;
  onCopy?: (text: string) => void;
  onNavigateToTool?: (toolId: number) => void;
}

export const TransferNetworkPanel: React.FC<ToolProps> = ({
  toolId,
  copied,
  onCopy,
  onNavigateToTool,
}) => {
  // 471: QR Streaming File Transfer
  const [qrInputText, setQrInputText] = useState('Air-Gapped Encrypted Payload: Security Key #8472-X90');
  const [qrChunks, setQrChunks] = useState<QrChunk[]>([]);
  const [currentChunkIdx, setCurrentChunkIdx] = useState(0);
  const [isPlayingStream, setIsPlayingStream] = useState(false);
  const [streamQrDataUrl, setStreamQrDataUrl] = useState('');
  const [streamSpeedMs, setStreamSpeedMs] = useState(350);

  // 472: Local Wi-Fi Transfer
  const [localServerPort, setLocalServerPort] = useState(8080);
  const [localIp, setLocalIp] = useState('192.168.1.145');
  const [wifiPairQr, setWifiPairQr] = useState('');

  // 473: LAN Discovery
  const [isScanningLan, setIsScanningLan] = useState(false);
  const [discoveredNodes, setDiscoveredNodes] = useState<
    Array<{ ip: string; name: string; type: string; latency: string }>
  >([]);

  // 500: Universal Share-to-Tool
  const [sharedText, setSharedText] = useState('');

  // QR Stream Chunking
  useEffect(() => {
    if (qrInputText) {
      const chunks = chunkPayloadForQrTransfer(qrInputText, 120);
      setQrChunks(chunks);
      setCurrentChunkIdx(0);
    }
  }, [qrInputText]);

  // Generate QR for active chunk
  useEffect(() => {
    if (qrChunks.length > 0 && qrChunks[currentChunkIdx]) {
      QRCode.toDataURL(qrChunks[currentChunkIdx].payload, {
        width: 320,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      })
        .then((url) => setStreamQrDataUrl(url))
        .catch((e) => console.error(e));
    }
  }, [qrChunks, currentChunkIdx]);

  // Stream Player Animation
  useEffect(() => {
    let interval: any = null;
    if (isPlayingStream && qrChunks.length > 1) {
      interval = setInterval(() => {
        setCurrentChunkIdx((prev) => (prev + 1) % qrChunks.length);
      }, streamSpeedMs);
    }
    return () => clearInterval(interval);
  }, [isPlayingStream, qrChunks, streamSpeedMs]);

  // Wi-Fi pairing QR
  useEffect(() => {
    const pairUrl = `http://${localIp}:${localServerPort}/share`;
    QRCode.toDataURL(pairUrl, {
      width: 260,
      margin: 2,
      color: { dark: '#4c1d95', light: '#ffffff' },
    })
      .then((url) => setWifiPairQr(url))
      .catch((e) => console.error(e));
  }, [localIp, localServerPort]);

  // LAN Scanner Simulation
  const runLanScan = () => {
    setIsScanningLan(true);
    setDiscoveredNodes([]);
    setTimeout(() => {
      setDiscoveredNodes([
        { ip: '192.168.1.1', name: 'Gateway Router (Wi-Fi 6 AP)', type: 'Router', latency: '2 ms' },
        { ip: '192.168.1.104', name: 'MacBook Pro (Local Node)', type: 'Workstation', latency: '<1 ms' },
        { ip: '192.168.1.145', name: 'Toolstrum Offline Peer', type: 'P2P Node', latency: '4 ms' },
        { ip: '192.168.1.201', name: 'Network Attached Storage', type: 'NAS Storage', latency: '6 ms' },
      ]);
      setIsScanningLan(false);
    }, 1200);
  };

  // 500: Smart tool suggestions based on shared content
  const suggestedTools = React.useMemo(() => {
    if (!sharedText.trim()) return [];
    const t = sharedText.trim().toLowerCase();
    if (t.startsWith('http://') || t.startsWith('https://')) {
      return WEB_TOOLS.filter((item) => [376, 377, 378, 383, 388].includes(item.id));
    }
    if (t.includes('begin:vcard') || t.includes('tel:') || t.includes('mailto:')) {
      return WEB_TOOLS.filter((item) => [351, 439].includes(item.id));
    }
    if (t.startsWith('{') || t.startsWith('[') || t.includes('function') || t.includes('const ')) {
      return WEB_TOOLS.filter((item) => [244, 245, 248, 250, 480].includes(item.id));
    }
    return WEB_TOOLS.filter((item) => [205, 206, 212, 474, 483].includes(item.id));
  }, [sharedText]);

  return (
    <div className="space-y-6">
      {/* 471: QR-BASED FILE TRANSFER */}
      {toolId === 471 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <QrCode className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Air-Gapped Animated QR Stream Transfer
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Transmits files or payloads across air-gapped computers and mobile cameras without Wi-Fi, Bluetooth, or cables using chunked sequential QR streams.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Payload / Base64 Data to Stream
              </label>
              <textarea
                rows={6}
                value={qrInputText}
                onChange={(e) => setQrInputText(e.target.value)}
                placeholder="Type or paste payload to chunk into QR stream..."
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Playback FPS / Frame Duration</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {streamSpeedMs} ms / frame
                </span>
              </div>
              <input
                type="range"
                min="150"
                max="800"
                step="50"
                value={streamSpeedMs}
                onChange={(e) => setStreamSpeedMs(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPlayingStream(!isPlayingStream)}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
              >
                {isPlayingStream ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlayingStream ? 'Pause QR Stream' : 'Play Animated QR Stream'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPlayingStream(false);
                  setCurrentChunkIdx(0);
                }}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-between space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                Live Frame {qrChunks.length > 0 ? `${currentChunkIdx + 1} of ${qrChunks.length}` : '0 of 0'}
              </span>
              <div className="text-xs font-mono text-slate-400 truncate max-w-xs">
                {qrChunks[currentChunkIdx]?.payload || 'Awaiting chunks'}
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
              {streamQrDataUrl ? (
                <img src={streamQrDataUrl} alt="QR Stream" className="w-60 h-60" />
              ) : (
                <div className="w-60 h-60 flex items-center justify-center text-slate-400 text-xs">
                  Generating Frame...
                </div>
              )}
            </div>

            <div className="w-full flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>{qrChunks.length} Total QR Frames</span>
              <span className="font-mono font-bold text-purple-600">Air-Gapped 100% Offline</span>
            </div>
          </div>
        </div>
      )}

      {/* 472: LOCAL WI-FI FILE TRANSFER */}
      {toolId === 472 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Wifi className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Peer-to-Peer Local Network Wi-Fi File Server
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Transfer large files directly between phones, tablets, and laptops on the same Wi-Fi subnet with zero cloud storage hops.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  Local IP Address
                </label>
                <input
                  type="text"
                  value={localIp}
                  onChange={(e) => setLocalIp(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                  Port Number
                </label>
                <input
                  type="number"
                  value={localServerPort}
                  onChange={(e) => setLocalServerPort(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2 text-xs">
              <span className="font-bold text-purple-900 dark:text-purple-200 block">
                Direct Browser Access URL:
              </span>
              <div className="font-mono font-bold text-purple-700 dark:text-purple-300 break-all">
                http://{localIp}:{localServerPort}/share
              </div>
              <button
                type="button"
                onClick={() => onCopy && onCopy(`http://${localIp}:${localServerPort}/share`)}
                className="text-[11px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Copy Pairing URL
              </button>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-4 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Scan with Phone Camera to Connect
            </span>
            <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-100">
              {wifiPairQr && <img src={wifiPairQr} alt="Pairing QR" className="w-52 h-52" />}
            </div>
            <p className="text-xs text-slate-500 max-w-xs">
              Opens the offline P2P staging receiver directly in your mobile browser.
            </p>
          </div>
        </div>
      )}

      {/* 473: LAN DEVICE DISCOVERY */}
      {toolId === 473 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Local Subnet & LAN Node Discovery
                </h3>
              </div>
              <button
                type="button"
                disabled={isScanningLan}
                onClick={runLanScan}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                {isScanningLan ? 'Probing Subnet...' : 'Scan Subnet Nodes'}
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Discovers reachable devices, gateways, and Toolstrum offline peer instances running on your local /24 subnet.
            </p>

            <div className="space-y-2">
              {discoveredNodes.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Click "Scan Subnet Nodes" to probe local IP addresses.
                </div>
              ) : (
                discoveredNodes.map((node, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{node.name}</div>
                      <div className="font-mono text-[11px] text-slate-400">{node.ip} • {node.type}</div>
                    </div>
                    <span className="font-mono text-emerald-500 font-bold">{node.latency}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 500: UNIVERSAL SHARE-TO-TOOL */}
      {toolId === 500 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Share2 className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Universal Share-to-Tool Dispatcher
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Paste any link, text snippet, or payload here. Toolstrum will automatically inspect its structure and recommend the ideal offline tool.
            </p>

            <textarea
              rows={5}
              value={sharedText}
              onChange={(e) => setSharedText(e.target.value)}
              placeholder="Paste shared text, URL, JSON, vCard, or document content here..."
              className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
            />

            {suggestedTools.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-purple-900 dark:text-purple-300 block">
                  Recommended Compatible Tools:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedTools.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-purple-900 dark:text-purple-200 truncate">
                          {t.name}
                        </div>
                        <div className="text-[10px] text-slate-500">Tool #{t.id}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigateToTool && onNavigateToTool(t.id)}
                        className="p-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex-shrink-0"
                        title="Open Tool"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
