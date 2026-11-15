import React, { useState, useMemo } from 'react';
import {
  Globe,
  Search,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Clock,
  RefreshCw,
} from 'lucide-react';

export interface HttpCodeDetail {
  code: number;
  name: string;
  category: '1xx' | '2xx' | '3xx' | '4xx' | '5xx';
  categoryLabel: string;
  summary: string;
  description: string;
  cacheable: boolean;
  safeToRetry: boolean;
  spec: string;
  commonHeaders?: string[];
}

export const HTTP_STATUS_CATALOG: HttpCodeDetail[] = [
  // 1xx Informational
  {
    code: 100,
    name: 'Continue',
    category: '1xx',
    categoryLabel: 'Informational',
    summary: 'The initial part of a request has been received and hasn\'t yet been rejected by the server.',
    description: 'Sent by the server to inform the client that it should continue sending the request body, or ignore the response if the request has already been completed.',
    cacheable: false,
    safeToRetry: true,
    spec: 'RFC 9110 §15.2.1',
  },
  {
    code: 101,
    name: 'Switching Protocols',
    category: '1xx',
    categoryLabel: 'Informational',
    summary: 'The server is switching protocols according to the Upgrade header.',
    description: 'Commonly used in WebSocket handshakes when a client requests upgrading from HTTP/1.1 to the WebSocket protocol.',
    cacheable: false,
    safeToRetry: false,
    spec: 'RFC 9110 §15.2.2',
    commonHeaders: ['Upgrade: websocket', 'Connection: Upgrade'],
  },
  {
    code: 103,
    name: 'Early Hints',
    category: '1xx',
    categoryLabel: 'Informational',
    summary: 'Allows returning headers before the main response is ready.',
    description: 'Used to preload resources (CSS, JS, fonts) via Link headers while the server is still computing the final HTML response.',
    cacheable: false,
    safeToRetry: true,
    spec: 'RFC 8297',
    commonHeaders: ['Link: </style.css>; rel=preload; as=style'],
  },

  // 2xx Success
  {
    code: 200,
    name: 'OK',
    category: '2xx',
    categoryLabel: 'Success',
    summary: 'The request has succeeded.',
    description: 'The meaning of success depends on the HTTP method: GET (resource retrieved), POST (result transmitted in body), PUT/DELETE (action completed).',
    cacheable: true,
    safeToRetry: true,
    spec: 'RFC 9110 §15.3.1',
    commonHeaders: ['Content-Type', 'Cache-Control', 'ETag'],
  },
  {
    code: 201,
    name: 'Created',
    category: '2xx',
    categoryLabel: 'Success',
    summary: 'The request succeeded and a new resource has been created as a result.',
    description: 'Typically sent in response to POST or PUT requests. The newly created resource is identified by a Location header field.',
    cacheable: false,
    safeToRetry: false,
    spec: 'RFC 9110 §15.3.2',
    commonHeaders: ['Location: /api/v1/items/42'],
  },
  {
    code: 202,
    name: 'Accepted',
    category: '2xx',
    categoryLabel: 'Success',
    summary: 'The request has been accepted for processing, but processing is not yet complete.',
    description: 'Used for asynchronous and background batch tasks. The response may include a telemetry link or monitor endpoint.',
    cacheable: false,
    safeToRetry: false,
    spec: 'RFC 9110 §15.3.3',
  },
  {
    code: 204,
    name: 'No Content',
    category: '2xx',
    categoryLabel: 'Success',
    summary: 'The server successfully processed the request and is not returning any content.',
    description: 'Often returned by DELETE endpoints, or PUT endpoints where no modified representation needs to be returned to the client.',
    cacheable: true,
    safeToRetry: true,
    spec: 'RFC 9110 §15.3.5',
  },
  {
    code: 206,
    name: 'Partial Content',
    category: '2xx',
    categoryLabel: 'Success',
    summary: 'The server is delivering only part of the resource due to a Range header sent by the client.',
    description: 'Used by video/audio streaming players and download managers to resume interrupted downloads and stream media chunks.',
    cacheable: true,
    safeToRetry: true,
    spec: 'RFC 9110 §15.3.7',
    commonHeaders: ['Content-Range: bytes 0-1023/2048', 'Accept-Ranges: bytes'],
  },

  // 3xx Redirection
  {
    code: 301,
    name: 'Moved Permanently',
    category: '3xx',
    categoryLabel: 'Redirection',
    summary: 'The target resource has been assigned a new permanent URI.',
    description: 'Search engines and clients update their bookmark references to the new location specified in the Location header.',
    cacheable: true,
    safeToRetry: true,
    spec: 'RFC 9110 §15.4.2',
    commonHeaders: ['Location: https://new-domain.com/path'],
  },
  {
    code: 302,
    name: 'Found',
    category: '3xx',
    categoryLabel: 'Redirection',
    summary: 'The target resource resides temporarily under a different URI.',
    description: 'Since redirection might be altered on occasion, the client should continue to use the effective request URI for future requests.',
    cacheable: false,
    safeToRetry: true,
    spec: 'RFC 9110 §15.4.3',
    commonHeaders: ['Location: /login'],
  },
  {
    code: 304,
    name: 'Not Modified',
    category: '3xx',
    categoryLabel: 'Redirection',
    summary: 'The cached copy of the resource is still fresh and can be used.',
    description: 'Sent when the client includes conditional headers (If-None-Match, If-Modified-Since) and the resource has not changed.',
    cacheable: true,
    safeToRetry: true,
    spec: 'RFC 9110 §15.4.5',
    commonHeaders: ['ETag', 'Last-Modified'],
  },
  {
    code: 307,
    name: 'Temporary Redirect',
    category: '3xx',
    categoryLabel: 'Redirection',
    summary: 'Target resource resides temporarily under a different URI; the request method must NOT be changed.',
    description: 'Guarantees that the HTTP method (e.g. POST) and the request body will not be changed when the redirect request is performed.',
    cacheable: false,
    safeToRetry: true,
    spec: 'RFC 9110 §15.4.8',
    commonHeaders: ['Location: https://target.com/api'],
  },
  {
    code: 308,
    name: 'Permanent Redirect',
    category: '3xx',
    categoryLabel: 'Redirection',
    summary: 'Target resource has been assigned a permanent URI; method must NOT be changed.',
    description: 'Similar to 301 Moved Permanently, but strictly disallows changing the HTTP request method from POST to GET.',
    cacheable: true,
    safeToRetry: true,
    spec: 'RFC 9110 §15.4.9',
    commonHeaders: ['Location: https://target.com/api'],
  },

  // 4xx Client Error
  {
    code: 400,
    name: 'Bad Request',
    category: '4xx',
    categoryLabel: 'Client Error',
    summary: 'The server cannot process the request due to client error.',
    description: 'Common causes include malformed request syntax, invalid query parameters, deceptive request routing, or size limits exceeded.',
    cacheable: false,
    safeToRetry: false,
    spec: 'RFC 9110 §15.5.1',
  },
  {
    code: 401,
    name: 'Unauthorized',
    category: '4xx',
    categoryLabel: 'Client Error',
    summary: 'The request has not been applied because it lacks valid authentication credentials.',
    description: 'The server MUST include a WWW-Authenticate header field containing at least one challenge applicable to the target resource.',
    cacheable: false,
    safeToRetry: false,
    spec: 'RFC 9110 §15.5.2',
    commonHeaders: ['WWW-Authenticate: Bearer realm="Access"'],
  },
  {
    code: 403,
    name: 'Forbidden',
    category: '4xx',
    categoryLabel: 'Client Error',
    summary: 'The server understood the request but refuses to authorize it.',
    description: 'Unlike 401 Unauthorized, re-authenticating will make no difference. Access is permanently or contextually tied to permissions/roles.',
    cacheable: false,
    safeToRetry: false,
    spec: 'RFC 9110 §15.5.4',
  },
  {
    code: 404,
    name: 'Not Found',
    category: '4xx',
    categoryLabel: 'Client Error',
    summary: 'The server cannot find the requested resource.',
    description: 'In an API, this can mean the endpoint is invalid or the specific resource ID does not exist in the database.',
    cacheable: true,
    safeToRetry: false,
    spec: 'RFC 9110 §15.5.5',
  },
  {
    code: 405,
    name: 'Method Not Allowed',
    category: '4xx',
    categoryLabel: 'Client Error',
    summary: 'The method received is known by the server but not supported by the target resource.',
    description: 'The server MUST generate an Allow header field containing a list of the target resource\'s currently supported methods.',
    cacheable: false,
    safeToRetry: false,
    spec: 'RFC 9110 §15.5.6',
    commonHeaders: ['Allow: GET, POST, HEAD'],
  },
  {
    code: 409,
    name: 'Conflict',
    category: '4xx',
    categoryLabel: 'Client Error',
    summary: 'The request could not be completed due to a conflict with the current state of the resource.',
    description: 'Common in version control conflicts, optimistic concurrency locks, or duplicate unique field submissions.',
    cacheable: false,
    safeToRetry: false,
    spec: 'RFC 9110 §15.5.10',
  },
  {
    code: 410,
    name: 'Gone',
    category: '4xx',
    categoryLabel: 'Client Error',
    summary: 'The target resource is no longer available and will not be available again.',
    description: 'Informs search engines and caching systems that the link has been intentionally removed and forwarding addresses are not provided.',
    cacheable: true,
    safeToRetry: false,
    spec: 'RFC 9110 §15.5.11',
  },
  {
    code: 418,
    name: 'I\'m a teapot',
    category: '4xx',
    categoryLabel: 'Client Error',
    summary: 'The server refuses the attempt to brew coffee with a teapot.',
    description: 'RFC 2324 Hyper Text Coffee Pot Control Protocol (HTCPCP/1.0) April Fools\' joke specification, now permanently recognized in RFC 9110.',
    cacheable: false,
    safeToRetry: false,
    spec: 'RFC 2324 / RFC 9110 §15.5.18',
  },
  {
    code: 422,
    name: 'Unprocessable Content',
    category: '4xx',
    categoryLabel: 'Client Error',
    summary: 'The server understands the content type and syntax, but was unable to process the contained instructions.',
    description: 'Standard REST API status code for payload schema validation errors (e.g. required field missing or value out of bounds).',
    cacheable: false,
    safeToRetry: false,
    spec: 'RFC 9110 §15.5.21',
  },
  {
    code: 429,
    name: 'Too Many Requests',
    category: '4xx',
    categoryLabel: 'Client Error',
    summary: 'The user has sent too many requests in a given amount of time ("rate limiting").',
    description: 'Often paired with a Retry-After header indicating how long to wait before making a new request.',
    cacheable: false,
    safeToRetry: true,
    spec: 'RFC 6585 §4',
    commonHeaders: ['Retry-After: 30', 'X-RateLimit-Reset'],
  },

  // 5xx Server Error
  {
    code: 500,
    name: 'Internal Server Error',
    category: '5xx',
    categoryLabel: 'Server Error',
    summary: 'The server encountered an unexpected condition that prevented it from fulfilling the request.',
    description: 'Generic catch-all error when an uncaught exception occurs in server code or backend application runtime.',
    cacheable: false,
    safeToRetry: true,
    spec: 'RFC 9110 §15.6.1',
  },
  {
    code: 501,
    name: 'Not Implemented',
    category: '5xx',
    categoryLabel: 'Server Error',
    summary: 'The server does not support the functionality required to fulfill the request.',
    description: 'Sent when the server does not recognize the request method and is not capable of supporting it for any resource.',
    cacheable: false,
    safeToRetry: false,
    spec: 'RFC 9110 §15.6.2',
  },
  {
    code: 502,
    name: 'Bad Gateway',
    category: '5xx',
    categoryLabel: 'Server Error',
    summary: 'The server, while acting as a gateway or proxy, received an invalid response from the inbound server.',
    description: 'Common when Nginx, Cloudflare, or AWS ALB proxies requests to a Node/Python/Go daemon that crashed or closed its socket.',
    cacheable: false,
    safeToRetry: true,
    spec: 'RFC 9110 §15.6.3',
  },
  {
    code: 503,
    name: 'Service Unavailable',
    category: '5xx',
    categoryLabel: 'Server Error',
    summary: 'The server is currently unable to handle the request due to a temporary overload or maintenance.',
    description: 'The implication is that this is a temporary condition which will be alleviated after some delay. Look for Retry-After header.',
    cacheable: false,
    safeToRetry: true,
    spec: 'RFC 9110 §15.6.4',
    commonHeaders: ['Retry-After: 120'],
  },
  {
    code: 504,
    name: 'Gateway Timeout',
    category: '5xx',
    categoryLabel: 'Server Error',
    summary: 'The server, acting as a gateway, did not receive a timely response from the upstream server.',
    description: 'Triggered when a backend database query or upstream microservice takes longer than the reverse proxy timeout threshold.',
    cacheable: false,
    safeToRetry: true,
    spec: 'RFC 9110 §15.6.5',
  },
];

export const HttpStatusCodePanel: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | '1xx' | '2xx' | '3xx' | '4xx' | '5xx'>('all');
  const [selectedCode, setSelectedCode] = useState<HttpCodeDetail>(HTTP_STATUS_CATALOG[3]); // Default to 200 OK
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const filteredCodes = useMemo(() => {
    const q = search.toLowerCase().trim();
    return HTTP_STATUS_CATALOG.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesQuery =
        !q ||
        item.code.toString().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [search, selectedCategory]);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case '1xx':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case '2xx':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case '3xx':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case '4xx':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      case '5xx':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Category Filter Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              HTTP Status Code Directory (RFC 9110)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredCodes.length} codes listed
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code number, title, or behavior (e.g. 404, Unauthorized, Cacheable)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {[
            { id: 'all', label: 'All Codes' },
            { id: '1xx', label: '1xx Informational' },
            { id: '2xx', label: '2xx Success' },
            { id: '3xx', label: '3xx Redirection' },
            { id: '4xx', label: '4xx Client Error' },
            { id: '5xx', label: '5xx Server Error' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Master / Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Selector List */}
        <div className="lg:col-span-5 space-y-2 max-h-[560px] overflow-y-auto pr-1">
          {filteredCodes.map((item) => {
            const isSelected = selectedCode.code === item.code;
            return (
              <button
                key={item.code}
                onClick={() => setSelectedCode(item)}
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-sky-500/10 border-sky-500 text-slate-900 dark:text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-sky-600 dark:text-sky-400">
                      {item.code}
                    </span>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {item.name}
                    </span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getCategoryColor(
                      item.category
                    )}`}
                  >
                    {item.categoryLabel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {item.summary}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right Column: In-Depth Specification Detail Card */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black font-mono text-sky-600 dark:text-sky-400">
                  {selectedCode.code}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedCode.name}
                  </h3>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mt-0.5 ${getCategoryColor(
                      selectedCode.category
                    )}`}
                  >
                    {selectedCode.categoryLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    copyToClipboard(`${selectedCode.code} ${selectedCode.name}`, 'title')
                  }
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'title' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy Title</span>
                </button>
              </div>
            </div>

            {/* Description Body */}
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Standard Definition
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {selectedCode.summary}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Technical Explanation
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedCode.description}
                </p>
              </div>
            </div>

            {/* Behaviors Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Caching</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {selectedCode.cacheable ? 'Cacheable' : 'Not Cacheable'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Client Retry</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {selectedCode.safeToRetry ? 'Safe to Retry' : 'Requires Modification'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">RFC Specification</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                  {selectedCode.spec}
                </span>
              </div>
            </div>

            {/* Associated Headers if any */}
            {selectedCode.commonHeaders && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Common Response Headers
                </span>
                <div className="space-y-1 font-mono text-xs">
                  {selectedCode.commonHeaders.map((h, i) => (
                    <div key={i} className="text-sky-600 dark:text-sky-400 font-bold">
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
