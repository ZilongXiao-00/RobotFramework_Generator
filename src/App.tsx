import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Code, Search, Settings, FileText, 
  Terminal, ChevronRight, ChevronDown, Trash2, GripVertical,
  Plus, X, CornerDownRight, Download, Hash, Upload,
  Save, Cloud, LogOut, User, FolderOpen, Eye, EyeOff
} from 'lucide-react';

// ─── API Config ────────────────────────────────────────────
const API_BASE = '/api';

const apiFetch = async (path: string, options: RequestInit = {}, token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
};

// ─── Mock Data ─────────────────────────────────────────────
const INITIAL_KEYWORD_LIBRARY = [
  { category: 'Control Flow', name: 'IF', args: ['condition'], desc: 'IF statement', isContainer: true },
  { category: 'Control Flow', name: 'ELSE IF', args: ['condition'], desc: 'ELSE IF statement', isContainer: true },
  { category: 'Control Flow', name: 'ELSE', args: [], desc: 'ELSE statement', isContainer: true },
  { category: 'Control Flow', name: 'FOR', args: ['variable', 'IN', 'values'], desc: 'FOR loop', isContainer: true },
  { category: 'Control Flow', name: 'WHILE', args: ['condition'], desc: 'WHILE loop', isContainer: true },
  { category: 'Control Flow', name: 'Exit For Loop', args: [], desc: 'Stops executing the enclosing FOR loop.' },
  { category: 'Variables', name: 'Set Variable', args: ['value'], desc: 'Returns the given value (used for local assignment).' },
  { category: 'Variables', name: 'Set Suite Variable', args: ['name', 'value'], desc: 'Makes a variable available everywhere within the scope of the current suite.' },
  { category: 'Variables', name: 'Set Global Variable', args: ['name', 'value'], desc: 'Makes a variable available globally in all tests and suites.' },
  { category: 'BuiltIn', name: 'Log', args: ['message', 'level'], desc: 'Logs the given message.' },
  { category: 'BuiltIn', name: 'Sleep', args: ['time'], desc: 'Pauses the test.' },
  { category: 'BuiltIn', name: 'Evaluate', args: ['expression'], desc: 'Evaluates the given expression in Python and returns the result.' },
  { category: 'BuiltIn', name: 'Comment', args: ['text'], desc: 'Adds a comment (BuiltIn keyword).' },
  { category: 'BuiltIn', name: '#', args: ['text'], desc: 'Adds a hash comment.', isComment: true },
  { category: 'Custom Library', name: 'sshCommond', args: ['channel', 'command', 'arg'], desc: 'Execute SSH command' },
  { category: 'Custom', name: '空白模板 (Custom Code)', args: [], isCustomCode: true, desc: '手写代码' },
];

// ─── Auth Page ─────────────────────────────────────────────
function AuthPage({ onLogin }: { onLogin: (token: string, user: any) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) { setError('邮箱和密码不能为空'); return; }
    setLoading(true);
    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/register';
      const body: any = { email, password };
      if (mode === 'register') body.name = name || email;
      const data = await apiFetch(path, { method: 'POST', body: JSON.stringify(body) });
      localStorage.setItem('rf_token', data.token);
      localStorage.setItem('rf_user', JSON.stringify(data.user));
      onLogin(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#F27D26] rounded-xl mb-4 shadow-lg shadow-orange-900/40">
            <span className="text-white font-black text-xl tracking-tight">RF</span>
          </div>
          <h1 className="text-white font-bold text-2xl tracking-wide">Robot Framework</h1>
          <p className="text-gray-500 text-sm mt-1 font-mono">Visual Editor</p>
        </div>

        {/* Card */}
        <div className="bg-[#1e1e1e] border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex gap-1 mb-8 bg-[#141414] p-1 rounded-lg">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                  mode === m ? 'bg-[#F27D26] text-white shadow' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {m === 'login' ? '登录' : '注册'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">用户名</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="你的名字"
                  className="w-full px-4 py-3 bg-[#141414] border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#F27D26] transition-colors"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-[#141414] border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#F27D26] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder={mode === 'register' ? '至少6位' : '请输入密码'}
                  className="w-full px-4 py-3 bg-[#141414] border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#F27D26] transition-colors pr-10"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-600 hover:text-gray-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-900/30 border border-red-800/50 rounded-lg text-red-400 text-xs">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 bg-[#F27D26] hover:bg-[#d96b1f] disabled:opacity-50 text-white font-bold text-sm rounded-lg transition-colors mt-2"
            >
              {loading ? '处理中...' : mode === 'login' ? '登录' : '创建账号'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── My Cases Panel ────────────────────────────────────────
function MyCasesPanel({
  token, onLoad, onClose
}: {
  token: string;
  onLoad: (content: any, caseId: number, caseName: string) => void;
  onClose: () => void;
}) {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/cases', {}, token);
      setCases(data.cases);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCases(); }, []);

  const handleLoad = async (id: number) => {
    try {
      const data = await apiFetch(`/cases/${id}`, {}, token);
      onLoad(data.case.content, data.case.id, data.case.name);
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('确认删除这个用例吗？')) return;
    setDeletingId(id);
    try {
      await apiFetch(`/cases/${id}`, { method: 'DELETE' }, token);
      setCases(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <Cloud size={16} className="text-[#F27D26]" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">云端用例</h2>
              <p className="text-[10px] text-gray-400">{cases.length} 个已保存</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">加载中...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500 text-sm">{error}</div>
          ) : cases.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">还没有保存的用例</p>
              <p className="text-gray-300 text-xs mt-1">点击顶部"保存到云端"按钮保存当前工作</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cases.map(c => (
                <div
                  key={c.id}
                  onClick={() => handleLoad(c.id)}
                  className="group flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-[#F27D26] hover:bg-orange-50/30 cursor-pointer transition-all"
                >
                  <div className="w-9 h-9 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FolderOpen size={16} className="text-gray-400 group-hover:text-[#F27D26]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{c.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{formatDate(c.updated_at)}</p>
                  </div>
                  <button
                    onClick={e => handleDelete(e, c.id)}
                    disabled={deletingId === c.id}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Save Modal ────────────────────────────────────────────
function SaveModal({
  defaultName,
  currentCaseId,
  onSave,
  onClose
}: {
  defaultName: string;
  currentCaseId: number | null;
  onSave: (name: string, overwrite: boolean) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(defaultName);
  const [overwrite, setOverwrite] = useState(!!currentCaseId);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-bold text-gray-900 mb-1">保存到云端</h3>
        <p className="text-xs text-gray-400 mb-5">用例将保存到你的账号下，随时可以加载</p>

        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">用例名称</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F27D26] mb-4"
          autoFocus
        />

        {currentCaseId && (
          <label className="flex items-center gap-3 mb-5 cursor-pointer">
            <input
              type="checkbox"
              checked={overwrite}
              onChange={e => setOverwrite(e.target.checked)}
              className="w-4 h-4 accent-[#F27D26]"
            />
            <span className="text-sm text-gray-600">覆盖原有版本</span>
          </label>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => { if (name.trim()) { onSave(name.trim(), overwrite); onClose(); } }}
            className="flex-1 py-2.5 bg-[#F27D26] text-white text-sm font-bold rounded-lg hover:bg-[#d96b1f] transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────
export default function App() {
  // Auth state
  const [token, setToken] = useState<string>(() => localStorage.getItem('rf_token') || '');
  const [user, setUser] = useState<any>(() => {
    const u = localStorage.getItem('rf_user');
    return u ? JSON.parse(u) : null;
  });
  const isLoggedIn = !!token && !!user;

  // Cloud state
  const [currentCaseId, setCurrentCaseId] = useState<number | null>(null);
  const [currentCaseName, setCurrentCaseName] = useState<string>('');
  const [showMyCases, setShowMyCases] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const [library, setLibrary] = useState(INITIAL_KEYWORD_LIBRARY);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const robotInputRef = useRef<HTMLInputElement>(null);

  const [draggedStepId, setDraggedStepId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; position: string } | null>(null);

  const [testCases, setTestCases] = useState([
    { id: 'tc_1', name: '测试用例名称', teardown: 'sshClose     ${SUITE START TIME}    ${SUITE_NAME}    ${TEST_NAME}', tags: '', steps: [] as any[] }
  ]);
  const [activeTestCaseId, setActiveTestCaseId] = useState('tc_1');
  const [userKeywords, setUserKeywords] = useState<any[]>([]);
  const [activeUserKeywordId, setActiveUserKeywordId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'testcases' | 'keywords'>('testcases');
  const [globalVars, setGlobalVars] = useState<{ name: string; value: string }[]>([]);
  const [settingsSection, setSettingsSection] = useState("Resource          PreDefinedKey.robot\nResource          Setting.resource");
  const [customKeywordsSection, setCustomKeywordsSection] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const libraryRef = useRef(library);
  useEffect(() => { libraryRef.current = library; }, [library]);

  const activeTestCase = testCases.find(tc => tc.id === activeTestCaseId) || testCases[0];
  const activeUserKeyword = userKeywords.find(kw => kw.id === activeUserKeywordId);
  const currentEntity = activeTab === 'testcases' ? activeTestCase : activeUserKeyword;
  const steps = currentEntity ? currentEntity.steps : [];

  // ─── Auth Handlers ──────────────────────────────────────
  const handleLogin = (tok: string, u: any) => {
    setToken(tok);
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('rf_token');
    localStorage.removeItem('rf_user');
    setToken('');
    setUser(null);
    setCurrentCaseId(null);
    setCurrentCaseName('');
  };

  // ─── Cloud Save/Load ────────────────────────────────────
  const buildSaveContent = () => ({
    testCases,
    globalVars,
    settingsSection,
    customKeywordsSection,
    userKeywords,
  });

  const handleSave = async (name: string, overwrite: boolean) => {
    setSaveStatus('saving');
    try {
      const content = buildSaveContent();
      const saveName = name || activeTestCase?.name || '未命名用例';

      if (overwrite && currentCaseId) {
        await apiFetch(`/cases/${currentCaseId}`, {
          method: 'PUT',
          body: JSON.stringify({ name: saveName, content }),
        }, token);
        setCurrentCaseName(saveName);
        setLogs(prev => [...prev, `[CLOUD] 用例已更新: ${saveName}`]);
      } else {
        const data = await apiFetch('/cases', {
          method: 'POST',
          body: JSON.stringify({ name: saveName, content }),
        }, token);
        setCurrentCaseId(data.case.id);
        setCurrentCaseName(saveName);
        setLogs(prev => [...prev, `[CLOUD] 用例已保存: ${saveName}`]);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err: any) {
      setSaveStatus('error');
      setLogs(prev => [...prev, `[ERROR] 保存失败: ${err.message}`]);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleLoadCase = (content: any, caseId: number, caseName: string) => {
    if (content.testCases) setTestCases(content.testCases);
    if (content.globalVars) setGlobalVars(content.globalVars);
    if (content.settingsSection !== undefined) setSettingsSection(content.settingsSection);
    if (content.customKeywordsSection !== undefined) setCustomKeywordsSection(content.customKeywordsSection);
    if (content.userKeywords) setUserKeywords(content.userKeywords);
    if (content.testCases?.length > 0) setActiveTestCaseId(content.testCases[0].id);
    setCurrentCaseId(caseId);
    setCurrentCaseName(caseName);
    setActiveTab('testcases');
    setLogs(prev => [...prev, `[CLOUD] 已加载用例: ${caseName}`]);
  };

  // ─── Render Auth ────────────────────────────────────────
  if (!isLoggedIn) {
    return <AuthPage onLogin={handleLogin} />;
  }

  // ─── Step State Helpers ─────────────────────────────────
  const setSteps = (updater: any) => {
    if (activeTab === 'testcases') {
      setTestCases(prev => prev.map(tc => {
        if (tc.id === activeTestCaseId) {
          const newSteps = typeof updater === 'function' ? updater(tc.steps) : updater;
          return { ...tc, steps: newSteps };
        }
        return tc;
      }));
    } else if (activeTab === 'keywords' && activeUserKeywordId) {
      setUserKeywords(prev => prev.map(kw => {
        if (kw.id === activeUserKeywordId) {
          const newSteps = typeof updater === 'function' ? updater(kw.steps) : updater;
          return { ...kw, steps: newSteps };
        }
        return kw;
      }));
    }
  };

  const updateActiveTestCase = (updates: any) => {
    setTestCases(prev => prev.map(tc => tc.id === activeTestCaseId ? { ...tc, ...updates } : tc));
  };

  const updateActiveUserKeyword = (updates: any) => {
    setUserKeywords(prev => prev.map(kw => kw.id === activeUserKeywordId ? { ...kw, ...updates } : kw));
  };

  // ─── Import Keywords ────────────────────────────────────
  const handleImportKeywords = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target!.result as string);
        const newKeywords: any[] = [];
        Object.keys(json).forEach(fileName => {
          const keywords = json[fileName];
          if (Array.isArray(keywords)) {
            keywords.forEach(kw => {
              newKeywords.push({ category: fileName, name: kw.name, args: kw.args || [], desc: kw.doc || '', isContainer: false, isCustomCode: false, isComment: false });
            });
          }
        });
        setLibrary(prev => {
          const existingNames = new Set(prev.map(k => k.name));
          const uniqueNew = newKeywords.filter(k => !existingNames.has(k.name));
          return [...prev, ...uniqueNew];
        });
        setLogs(prev => [...prev, `[INFO] 成功导入 ${newKeywords.length} 个关键字来自 ${file.name}`]);
      } catch (err: any) {
        setLogs(prev => [...prev, `[ERROR] 解析 JSON 文件失败: ${err.message}`]);
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  // ─── Import Robot ────────────────────────────────────────
  const handleImportRobot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImportFile(file);
    setShowImportConfirm(true);
    e.target.value = '';
  };

  const cancelImport = () => { setShowImportConfirm(false); setPendingImportFile(null); };

  const confirmImport = () => {
    setShowImportConfirm(false);
    if (!pendingImportFile) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target!.result as string;
        const rawLines = content.split('\n');
        const lines: string[] = [];
        for (let line of rawLines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('...')) {
            if (lines.length > 0) lines[lines.length - 1] += '    ' + trimmed.substring(3).trim();
          } else {
            lines.push(line.replace(/\r$/, ''));
          }
        }

        let currentSection: string | null = null;
        let parsedGlobalVars: any[] = [];
        let parsedTestCases: any[] = [];
        let currentTestCase: any = null;
        let blockStack: any[] = [];
        let parsedSettings: string[] = [];
        let parsedKeywords: string[] = [];

        const finalizeTestCase = () => {
          if (currentTestCase) { parsedTestCases.push(currentTestCase); currentTestCase = null; blockStack = []; }
        };

        const parseStepLine = (lineStr: string) => {
          const parts = lineStr.trim().split(/\s{2,}|\t+/);
          if (parts.length === 0) return null;
          let outputVars: string[] = [], modifier = '', keyword = '', args: string[] = [], ci = 0;
          while (ci < parts.length && (parts[ci].startsWith('${') || parts[ci].startsWith('@{') || parts[ci].startsWith('&{'))) {
            let v = parts[ci]; if (v.endsWith('=')) v = v.slice(0, -1).trim();
            outputVars.push(v); ci++;
            if (ci < parts.length && parts[ci] === '=') ci++;
          }
          const mods = ['Run Keyword And Continue On Failure', 'Run Keyword And Ignore Error', 'Wait Until Keyword Succeeds'];
          if (ci < parts.length && mods.includes(parts[ci])) { modifier = parts[ci]; ci++; }
          if (ci < parts.length) { keyword = parts[ci]; ci++; }
          if (!keyword) return null;
          while (ci < parts.length) { args.push(parts[ci]); ci++; }

          const libKw = libraryRef.current.find(k => k.name.toLowerCase() === keyword.toLowerCase());
          const isContainer = libKw ? libKw.isContainer : ['IF', 'FOR', 'WHILE', 'ELSE IF', 'ELSE'].includes(keyword.toUpperCase());
          let namedArgs: any = {}, extraArgs: string[] = [];
          if (libKw?.args) {
            libKw.args.forEach((argName: string, idx: number) => { namedArgs[argName] = idx < args.length ? args[idx] : ''; });
            if (args.length > libKw.args.length) extraArgs = args.slice(libKw.args.length);
          } else { extraArgs = [...args]; }

          return {
            id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            keyword, isCustomCode: false, isContainer, isComment: false,
            args: namedArgs, extraArgs, modifier, outputVars,
            children: isContainer ? [] : undefined
          };
        };

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const trimmed = line.trim();
          if (!trimmed && currentSection !== 'keywords' && currentSection !== 'settings') continue;
          if (trimmed.startsWith('***')) {
            const sn = trimmed.replace(/\*/g, '').trim().toLowerCase();
            if (sn.includes('settings')) { currentSection = 'settings'; finalizeTestCase(); }
            else if (sn.includes('variables')) { currentSection = 'variables'; finalizeTestCase(); }
            else if (sn.includes('test cases')) { currentSection = 'testcases'; finalizeTestCase(); }
            else if (sn.includes('keywords')) { currentSection = 'keywords'; finalizeTestCase(); }
            continue;
          }
          if (currentSection === 'settings') { if (trimmed) parsedSettings.push(line); }
          else if (currentSection === 'keywords') { if (line.trim() || parsedKeywords.length > 0) parsedKeywords.push(line); }
          else if (currentSection === 'variables') {
            const parts = trimmed.split(/\s{2,}|\t+/);
            if (parts.length >= 2) parsedGlobalVars.push({ name: parts[0], value: parts[1] });
          } else if (currentSection === 'testcases') {
            if (!line.startsWith(' ') && !line.startsWith('\t')) {
              finalizeTestCase();
              currentTestCase = { id: `tc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, name: trimmed, teardown: '', tags: '', steps: [] };
              blockStack = [];
            } else if (currentTestCase) {
              if (trimmed.startsWith('[Tags]')) { currentTestCase.tags = trimmed.replace('[Tags]', '').trim(); }
              else if (trimmed.startsWith('[Teardown]')) { currentTestCase.teardown = trimmed.replace('[Teardown]', '').trim(); }
              else if (trimmed.startsWith('#')) {
                const step = { id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, keyword: '#', isComment: true, args: { text: trimmed.substring(1).trim() } };
                if (blockStack.length > 0) blockStack[blockStack.length - 1].children.push(step);
                else currentTestCase.steps.push(step);
              } else if (trimmed.toUpperCase() === 'END') { blockStack.pop(); }
              else {
                const step = parseStepLine(trimmed);
                if (step) {
                  if (['ELSE', 'ELSE IF'].includes(step.keyword.toUpperCase())) blockStack.pop();
                  if (blockStack.length > 0) blockStack[blockStack.length - 1].children.push(step);
                  else currentTestCase.steps.push(step);
                  if (step.isContainer) blockStack.push(step);
                }
              }
            }
          }
        }
        finalizeTestCase();

        if (parsedTestCases.length > 0) { setTestCases(parsedTestCases); setActiveTestCaseId(parsedTestCases[0].id); }
        setGlobalVars(parsedGlobalVars);
        setSettingsSection(parsedSettings.length > 0 ? parsedSettings.join('\n') : '');
        setCustomKeywordsSection(parsedKeywords.length > 0 ? parsedKeywords.join('\n') : '');
        setCurrentCaseId(null); // 导入后清除云端关联
        setCurrentCaseName('');
        setLogs(prev => [...prev, `[INFO] 成功导入并解析 Robot 文件: ${pendingImportFile!.name}，共 ${parsedTestCases.length} 个用例`]);
      } catch (err: any) {
        setLogs(prev => [...prev, `[ERROR] 解析 Robot 文件失败: ${err.message}`]);
      }
      setPendingImportFile(null);
    };
    reader.readAsText(pendingImportFile);
  };

  // ─── Tree Operations ─────────────────────────────────────
  const findStep = (nodes: any[], id: string): any => {
    for (let node of nodes) {
      if (node.id === id) return node;
      if (node.children) { const found = findStep(node.children, id); if (found) return found; }
    }
    return null;
  };

  const updateNode = (nodes: any[], id: string, updates: any): any[] =>
    nodes.map(node => {
      if (node.id === id) return { ...node, ...updates };
      if (node.children) return { ...node, children: updateNode(node.children, id, updates) };
      return node;
    });

  const removeNode = (nodes: any[], id: string) => {
    let removedNode: any = null;
    const filterNodes = (list: any[]): any[] => list.filter(node => {
      if (node.id === id) { removedNode = node; return false; }
      if (node.children) node.children = filterNodes(node.children);
      return true;
    });
    return { newNodes: filterNodes(nodes), removedNode };
  };

  const insertNode = (nodes: any[], targetId: string | null, position: string, newNode: any): any[] => {
    if (!targetId && position === 'append') return [...nodes, newNode];
    let result: any[] = [];
    for (let node of nodes) {
      if (node.id === targetId) {
        if (position === 'before') { result.push(newNode); result.push(node); }
        else if (position === 'after') { result.push(node); result.push(newNode); }
        else if (position === 'inside') result.push({ ...node, children: [...(node.children || []), newNode] });
      } else {
        result.push(node.children ? { ...node, children: insertNode(node.children, targetId, position, newNode) } : node);
      }
    }
    return result;
  };

  const moveStep = (stepId: string, targetId: string | null, position: string) => {
    setSteps((prev: any[]) => {
      const { newNodes, removedNode } = removeNode(prev, stepId);
      if (!removedNode) return prev;
      return insertNode(newNodes, targetId, position, removedNode);
    });
  };

  const insertNewStep = (keyword: any, targetId: string | null, position: string) => {
    const defaultArgs: any = {};
    if (keyword.args) keyword.args.forEach((arg: string) => {
      if (keyword.name === 'sshCommond' && arg === 'channel') defaultArgs[arg] = '${channel}';
      else if (keyword.name === 'FOR' && arg === 'IN') defaultArgs[arg] = 'IN RANGE';
      else defaultArgs[arg] = '';
    });
    const newStep = {
      id: `step_${Date.now()}`, keyword: keyword.name,
      isCustomCode: keyword.isCustomCode || false, isContainer: keyword.isContainer || false,
      isComment: keyword.isComment || false, args: defaultArgs, extraArgs: [], modifier: '',
      customCode: '', outputVars: [], children: keyword.isContainer ? [] : undefined
    };
    setSteps((prev: any[]) => insertNode(prev, targetId, position, newStep));
    setSelectedStepId(newStep.id);
  };

  const addUserKeyword = () => {
    const newId = `kw_${Date.now()}`;
    setUserKeywords(prev => [...prev, { id: newId, name: '新关键字', desc: '关键字描述', args: [], returnVars: [], steps: [] }]);
    setActiveUserKeywordId(newId);
    setActiveTab('keywords');
  };

  const removeUserKeyword = (id: string) => {
    setUserKeywords(prev => prev.filter(kw => kw.id !== id));
    if (activeUserKeywordId === id) { setActiveUserKeywordId(null); setActiveTab('testcases'); }
  };

  // ─── Drag and Drop ──────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, keyword: any) => { e.dataTransfer.setData('application/json', JSON.stringify(keyword)); e.stopPropagation(); };
  const handleStepDragStart = (e: React.DragEvent, id: string) => { e.dataTransfer.setData('stepId', id); setDraggedStepId(id); e.stopPropagation(); };
  const handleStepDragOver = (e: React.DragEvent, id: string, isContainer: boolean) => {
    e.preventDefault(); e.stopPropagation();
    if (draggedStepId === id) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    let position = 'after';
    if (y < rect.height * 0.25) position = 'before';
    else if (isContainer && y < rect.height * 0.75) position = 'inside';
    setDropTarget({ id, position });
  };
  const handleStepDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault(); e.stopPropagation(); setDropTarget(null); setDraggedStepId(null);
    const stepId = e.dataTransfer.getData('stepId');
    const keywordData = e.dataTransfer.getData('application/json');
    if (stepId) { if (stepId !== targetId) moveStep(stepId, targetId, dropTarget?.position || 'after'); }
    else if (keywordData) insertNewStep(JSON.parse(keywordData), targetId, dropTarget?.position || 'after');
  };
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDropTarget(null); setDraggedStepId(null);
    const stepId = e.dataTransfer.getData('stepId');
    const keywordData = e.dataTransfer.getData('application/json');
    if (stepId) moveStep(stepId, null, 'append');
    else if (keywordData) insertNewStep(JSON.parse(keywordData), null, 'append');
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragEnd = () => { setDraggedStepId(null); setDropTarget(null); };

  const updateStep = (id: string, updates: any) => setSteps((prev: any[]) => updateNode(prev, id, updates));
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSteps((prev: any[]) => removeNode(prev, id).newNodes);
    if (selectedStepId === id) setSelectedStepId(null);
  };

  const selectedStep = findStep(steps, selectedStepId || '');

  // ─── Code Generation ─────────────────────────────────────
  const generateStepCode = (nodes: any[], indentLevel = 1): string => {
    let code = '';
    const indent = '    '.repeat(indentLevel);
    nodes.forEach((step, index) => {
      if (step.isComment) { code += `${indent}# ${step.args.text}\n`; }
      else if (step.isCustomCode) { step.customCode.split('\n').forEach((l: string) => { code += `${indent}${l}\n`; }); }
      else if (step.isContainer) {
        let line = `${indent}${step.keyword}`;
        Object.values(step.args).forEach((val: any) => { if (val) line += `    ${val}`; });
        (step.extraArgs || []).forEach((val: any) => { if (val) line += `    ${val}`; });
        code += line + '\n';
        if (step.children?.length > 0) code += generateStepCode(step.children, indentLevel + 1);
        else code += `${indent}    # TODO: Add steps here\n`;
        const kwU = step.keyword.toUpperCase();
        if (['FOR', 'WHILE', 'IF', 'ELSE IF', 'ELSE'].includes(kwU)) {
          const next = nodes[index + 1];
          const isIfChain = ['IF', 'ELSE IF', 'ELSE'].includes(kwU);
          if (!(isIfChain && next && ['ELSE IF', 'ELSE'].includes(next.keyword.toUpperCase()))) {
            code += `${indent}END\n`;
          }
        }
      } else {
        let line = indent;
        const validVars = (step.outputVars || []).filter((v: string) => v.trim());
        if (validVars.length > 0) line += validVars.join('    ') + '    ';
        else if (step.outputVar) line += `${step.outputVar}    `;
        if (step.modifier) line += `${step.modifier}    `;
        line += step.keyword;
        Object.values(step.args).forEach((val: any) => { if (val) line += `    ${val}`; });
        (step.extraArgs || []).forEach((val: any) => { if (val) line += `    ${val}`; });
        code += line + '\n';
      }
    });
    return code;
  };

  const generateCode = (): string => {
    let code = '*** Settings ***\n';
    if (settingsSection) code += settingsSection + '\n';
    code += '\n';
    if (globalVars.length > 0 && globalVars.some(v => v.name)) {
      code += '*** Variables ***\n';
      globalVars.forEach(v => { if (v.name && v.value) code += `${v.name.padEnd(20)} ${v.value}\n`; });
      code += '\n';
    }
    code += '*** Test Cases ***\n';
    testCases.forEach(tc => {
      code += `${tc.name || 'Demo Visual Test Case'}\n`;
      if (tc.tags) code += `    [Tags]    ${tc.tags}\n`;
      code += generateStepCode(tc.steps, 1);
      if (tc.teardown) code += `    [Teardown]    ${tc.teardown}\n`;
      code += '\n';
    });
    if (userKeywords.length > 0) {
      code += '*** Keywords ***\n';
      userKeywords.forEach(kw => {
        code += `${kw.name || 'Unnamed Keyword'}\n`;
        if (kw.desc) code += `    [Documentation]    ${kw.desc}\n`;
        if (kw.args?.length > 0) {
          const va = kw.args.filter((a: string) => a.trim());
          if (va.length > 0) code += `    [Arguments]    ${va.map((a: string) => a.startsWith('${') ? a : `\${${a}}`).join('    ')}\n`;
        }
        code += generateStepCode(kw.steps, 1);
        if (kw.returnVars?.length > 0) {
          const vr = kw.returnVars.filter((r: string) => r.trim());
          if (vr.length > 0) code += `    [Return]    ${vr.map((r: string) => r.startsWith('${') ? r : `\${${r}}`).join('    ')}\n`;
        }
        code += '\n';
      });
    }
    if (customKeywordsSection.trim()) {
      if (userKeywords.length === 0) code += '*** Keywords ***\n';
      code += customKeywordsSection + '\n';
    }
    return code;
  };

  const handleDownload = () => {
    const code = generateCode();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'test_suite.robot';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const runSimulation = () => {
    setIsRunning(true); setShowCode(false);
    setLogs(['[INFO] Starting test execution...', '[INFO] Parsing visual blocks...']);
    setTimeout(() => { setLogs(prev => [...prev, '[PASS] Test execution completed successfully.']); setIsRunning(false); }, 1500);
  };

  // ─── Render Steps ────────────────────────────────────────
  const renderSteps = (nodes: any[], parentId: string | null = null): React.ReactNode => {
    if (!nodes || nodes.length === 0) {
      if (parentId) return <div className="py-4 text-center border-2 border-dashed border-gray-200 rounded bg-gray-50/50 text-gray-400 text-xs font-medium">拖拽模块到此内部</div>;
      return null;
    }
    return nodes.map((step) => {
      const isDragTarget = dropTarget?.id === step.id;
      if (step.isComment) return (
        <React.Fragment key={step.id}>
          {isDragTarget && dropTarget!.position === 'before' && <div className="h-1 bg-[#F27D26] rounded my-1" />}
          <div draggable onDragStart={e => handleStepDragStart(e, step.id)} onDragOver={e => handleStepDragOver(e, step.id, false)} onDrop={e => handleStepDrop(e, step.id)} onDragEnd={handleDragEnd} onClick={e => { e.stopPropagation(); setSelectedStepId(step.id); }} className={`group relative flex items-center bg-green-50/50 border rounded-lg shadow-sm cursor-pointer transition-all mb-2 px-3 py-2 ${selectedStepId === step.id ? 'border-green-500 ring-1 ring-green-500' : 'border-green-200 hover:border-green-300'} ${draggedStepId === step.id ? 'opacity-50' : ''}`}>
            <GripVertical size={16} className="text-green-400 mr-2 opacity-50 group-hover:opacity-100 cursor-grab" />
            <Hash size={14} className="text-green-600 mr-1" />
            <span className="text-green-700 font-mono text-sm flex-1">{step.args.text || 'Comment'}</span>
            <button onClick={e => handleDelete(e, step.id)} className="text-green-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
          </div>
          {isDragTarget && dropTarget!.position === 'after' && <div className="h-1 bg-[#F27D26] rounded my-1" />}
        </React.Fragment>
      );
      return (
        <React.Fragment key={step.id}>
          {isDragTarget && dropTarget!.position === 'before' && <div className="h-1 bg-[#F27D26] rounded my-1" />}
          <div draggable onDragStart={e => handleStepDragStart(e, step.id)} onDragOver={e => handleStepDragOver(e, step.id, step.isContainer)} onDrop={e => handleStepDrop(e, step.id)} onDragEnd={handleDragEnd} onClick={e => { e.stopPropagation(); setSelectedStepId(step.id); }} className={`group relative flex flex-col bg-white border rounded-lg shadow-sm cursor-pointer transition-all mb-2 ${selectedStepId === step.id ? 'border-[#F27D26] ring-1 ring-[#F27D26]' : 'border-gray-300 hover:border-gray-400'} ${draggedStepId === step.id ? 'opacity-50' : ''} ${isDragTarget && dropTarget!.position === 'inside' ? 'ring-2 ring-[#F27D26]' : ''}`}>
            <div className="flex items-stretch">
              <div className={`w-8 flex items-center justify-center border-r border-gray-100 text-gray-400 group-hover:text-gray-600 rounded-tl-lg cursor-grab ${step.isContainer ? 'bg-blue-50' : 'bg-gray-50'}`}><GripVertical size={16} /></div>
              <div className="flex-1 p-3 flex flex-col justify-center">
                <div className="flex items-center gap-2 flex-wrap">
                  {step.isContainer && <CornerDownRight size={14} className="text-blue-500" />}
                  {(step.outputVars || []).filter((v: string) => v).length > 0 && <span className="text-xs font-mono text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">{step.outputVars.filter((v: string) => v).join(', ')} =</span>}
                  {step.modifier && <span className="text-xs font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">{step.modifier}</span>}
                  <span className={`text-sm font-bold ${step.isCustomCode ? 'text-blue-600' : step.isContainer ? 'text-blue-700' : 'text-gray-800'}`}>{step.keyword}</span>
                  <div className="flex gap-2 ml-2 flex-wrap">
                    {Object.entries(step.args).map(([key, val]: [string, any]) => val && <span key={key} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">{key}: <span className="font-mono text-gray-800">{val}</span></span>)}
                    {(step.extraArgs || []).map((val: any, idx: number) => val && <span key={`extra_${idx}`} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">arg{idx+1}: <span className="font-mono text-gray-800">{val}</span></span>)}
                  </div>
                </div>
              </div>
              <button onClick={e => handleDelete(e, step.id)} className="w-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-tr-lg transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
            </div>
            {step.isContainer && (
              <div className="ml-8 mr-2 mb-2 p-2 border-l-2 border-blue-300 bg-blue-50/30 rounded-r min-h-[40px]" onDrop={e => handleStepDrop(e, step.id)} onDragOver={e => handleStepDragOver(e, step.id, true)}>
                {renderSteps(step.children, step.id)}
              </div>
            )}
          </div>
          {isDragTarget && dropTarget!.position === 'after' && <div className="h-1 bg-[#F27D26] rounded my-1" />}
        </React.Fragment>
      );
    });
  };

  const combinedLibrary = [...library, ...userKeywords.map(kw => ({ category: '用户自定义 (User Keywords)', name: kw.name, args: kw.args, desc: kw.desc, isContainer: false, isUserKeyword: true }))];
  const filteredLibrary = combinedLibrary.filter(kw => kw.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const categories = [...new Set(filteredLibrary.map(kw => kw.category))];

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-[#E4E3E0] text-[#141414] font-sans overflow-hidden">

      {/* Import Confirm Modal */}
      {showImportConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">确认导入</h3>
            <p className="text-sm text-gray-600 mb-6">导入将覆盖当前画布中的所有内容，是否继续？</p>
            <div className="flex justify-end gap-3">
              <button onClick={cancelImport} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">取消</button>
              <button onClick={confirmImport} className="px-4 py-2 text-sm font-medium text-white bg-[#F27D26] hover:bg-[#d96b1c] rounded-md">确认导入</button>
            </div>
          </div>
        </div>
      )}

      {/* My Cases Panel */}
      {showMyCases && <MyCasesPanel token={token} onLoad={handleLoadCase} onClose={() => setShowMyCases(false)} />}

      {/* Save Modal */}
      {showSaveModal && (
        <SaveModal
          defaultName={currentCaseName || activeTestCase?.name || '未命名用例'}
          currentCaseId={currentCaseId}
          onSave={handleSave}
          onClose={() => setShowSaveModal(false)}
        />
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#141414] text-[#E4E3E0] shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F27D26] rounded flex items-center justify-center font-bold text-white">RF</div>
          <div>
            <h1 className="font-bold text-sm tracking-wide">Robot Framework Visual Editor</h1>
            <p className="text-[10px] text-gray-400 font-mono">
              {currentCaseName ? (
                <span className="text-orange-400">☁ {currentCaseName}</span>
              ) : 'MVP Prototype'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCode(!showCode)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-gray-600 rounded hover:bg-gray-800 transition-colors">
            <Code size={14} /> {showCode ? '隐藏代码' : '查看代码'}
          </button>
          <button onClick={() => robotInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-gray-600 rounded hover:bg-gray-800 transition-colors">
            <Upload size={14} /> 导入 .robot
          </button>
          <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-gray-600 rounded hover:bg-gray-800 transition-colors">
            <Download size={14} /> 下载 .robot
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-700 mx-1" />

          {/* Cloud Load */}
          <button onClick={() => setShowMyCases(true)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-gray-600 rounded hover:bg-gray-800 transition-colors">
            <FolderOpen size={14} /> 我的用例
          </button>

          {/* Cloud Save */}
          <button
            onClick={() => setShowSaveModal(true)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              saveStatus === 'saved' ? 'bg-green-600 text-white border border-green-600' :
              saveStatus === 'saving' ? 'bg-gray-700 text-gray-300 border border-gray-600' :
              saveStatus === 'error' ? 'bg-red-900 text-red-300 border border-red-700' :
              'bg-[#F27D26] text-white hover:bg-[#d96b1f] border border-[#F27D26]'
            }`}
          >
            {saveStatus === 'saving' ? <><Save size={14} className="animate-pulse" /> 保存中...</> :
             saveStatus === 'saved' ? <><Cloud size={14} /> 已保存</> :
             saveStatus === 'error' ? <><X size={14} /> 保存失败</> :
             <><Save size={14} /> 保存到云端</>}
          </button>

          <button onClick={runSimulation} disabled={isRunning || steps.length === 0} className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 transition-colors border border-gray-600">
            <Play size={14} fill="currentColor" /> 运行
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-700 mx-1" />

          {/* User */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded border border-gray-700">
              <div className="w-5 h-5 bg-[#F27D26] rounded-full flex items-center justify-center">
                <User size={11} className="text-white" />
              </div>
              <span className="text-xs text-gray-300 font-medium max-w-[100px] truncate">{user?.name || user?.email}</span>
            </div>
            <button onClick={handleLogout} title="退出登录" className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded transition-colors">
              <LogOut size={15} />
            </button>
          </div>
        </div>
        <input type="file" accept=".robot" ref={robotInputRef} style={{ display: 'none' }} onChange={handleImportRobot} />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Library */}
        <div className="w-64 bg-white border-r border-gray-300 flex flex-col shadow-sm z-10">
          <div className="p-3 border-b border-gray-200">
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                <input type="text" placeholder="搜索关键字..." className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-gray-600 flex items-center justify-center transition-colors" title="导入 JSON 关键字">
                <Upload size={14} />
              </button>
              <input type="file" accept=".json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImportKeywords} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {categories.map(cat => (
              <div key={cat}>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">{cat}</div>
                <div className="space-y-1">
                  {filteredLibrary.filter(kw => kw.category === cat).map(kw => (
                    <div key={kw.name} draggable onDragStart={e => handleDragStart(e, kw)} onDoubleClick={() => insertNewStep(kw, null, 'append')} className={`px-3 py-2 text-xs border rounded cursor-grab active:cursor-grabbing hover:shadow-sm transition-all ${kw.isContainer ? 'bg-blue-50 border-blue-200 text-blue-800 border-l-4 border-l-blue-500' : (kw as any).isComment ? 'bg-green-50 border-green-200 text-green-800' : (kw as any).isCustomCode ? 'bg-purple-50 border-purple-200 text-purple-800' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`} title={`${kw.desc}\n(双击直接添加到最下方)`}>
                      <div className="font-medium flex items-center gap-1">
                        {kw.isContainer && <CornerDownRight size={12} />}
                        {(kw as any).isComment && <Hash size={12} />}
                        {kw.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle: Canvas */}
        <div className="flex-1 flex flex-col relative bg-[#f5f5f5] min-w-0">
          {showCode ? (
            <div className="flex-1 p-4 overflow-hidden flex flex-col">
              <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-lg shadow-inner font-mono text-sm whitespace-pre overflow-auto flex-1">
                <code>{generateCode()}</code>
              </pre>
            </div>
          ) : (
            <div className="flex-1 p-6 overflow-y-auto" onDrop={handleCanvasDrop} onDragOver={handleDragOver}>
              <div className="max-w-3xl mx-auto min-h-full pb-32">
                {/* Tabs */}
                <div className="flex border-b border-gray-300 mb-6">
                  {(['testcases', 'keywords'] as const).map(tab => (
                    <button key={tab} onClick={() => { setActiveTab(tab); if (tab === 'keywords' && userKeywords.length > 0 && !activeUserKeywordId) setActiveUserKeywordId(userKeywords[0].id); }} className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === tab ? 'border-[#F27D26] text-[#F27D26]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                      {tab === 'testcases' ? '测试用例 (Test Cases)' : '自定义关键字 (Keywords)'}
                    </button>
                  ))}
                </div>

                {activeTab === 'testcases' ? (
                  <>
                    {/* Test Case Tabs */}
                    <div className="flex items-end gap-1 mb-4 border-b border-gray-300 overflow-x-auto pt-2 px-2">
                      {testCases.map(tc => (
                        <div key={tc.id} onClick={() => setActiveTestCaseId(tc.id)} className={`group flex items-center gap-2 px-4 py-2 rounded-t-lg border-t border-l border-r cursor-pointer whitespace-nowrap transition-colors ${activeTestCaseId === tc.id ? 'bg-white border-gray-300 text-[#F27D26] font-bold relative top-[1px]' : 'bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200'}`}>
                          <span className="max-w-[200px] truncate" title={tc.name || '未命名用例'}>{tc.name || '未命名用例'}</span>
                          {testCases.length > 1 && (
                            <button onClick={e => { e.stopPropagation(); const n = testCases.filter(t => t.id !== tc.id); setTestCases(n); if (activeTestCaseId === tc.id) setActiveTestCaseId(n[0].id); }} className={`ml-1 ${activeTestCaseId === tc.id ? 'text-gray-400 hover:text-red-500' : 'text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500'}`}><X size={14} /></button>
                          )}
                        </div>
                      ))}
                      <button onClick={() => { const id = `tc_${Date.now()}`; setTestCases([...testCases, { id, name: `新测试用例 ${testCases.length + 1}`, teardown: '', tags: '', steps: [] }]); setActiveTestCaseId(id); }} className="flex items-center gap-1 px-3 py-2 rounded-t-lg text-gray-500 hover:text-[#F27D26] hover:bg-gray-100 cursor-pointer whitespace-nowrap transition-colors mb-[1px]">
                        <Plus size={14} /> 添加用例
                      </button>
                    </div>

                    {/* Settings */}
                    <div className="mb-6 bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                      <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => setShowSettings(!showSettings)}>
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700"><Settings size={16} /> 设置 (Suite & Test Case Settings)</div>
                        {showSettings ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                      {showSettings && (
                        <div className="p-4 space-y-4">
                          <div className="pb-4 border-b border-gray-100 space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">*** Settings *** (全局配置)</label>
                              <textarea value={settingsSection} onChange={e => setSettingsSection(e.target.value)} className="w-full px-2 py-1.5 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" rows={3} placeholder="Resource    PreDefinedKey.robot" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">全局变量 (Suite Variables)</label>
                              <div className="space-y-2">
                                {globalVars.map((v, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    <input type="text" value={v.name} onChange={e => { const n = [...globalVars]; n[i].name = e.target.value; setGlobalVars(n); }} placeholder="${VAR_NAME}" className="w-1/3 px-2 py-1 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" />
                                    <span className="text-gray-400">=</span>
                                    <input type="text" value={v.value} onChange={e => { const n = [...globalVars]; n[i].value = e.target.value; setGlobalVars(n); }} placeholder="Value" className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" />
                                    <button onClick={() => setGlobalVars(globalVars.filter((_, idx) => idx !== i))} className="p-1 text-gray-400 hover:text-red-500"><X size={14} /></button>
                                  </div>
                                ))}
                                <button onClick={() => setGlobalVars([...globalVars, { name: '', value: '' }])} className="flex items-center gap-1 text-xs text-[#F27D26] font-medium hover:underline mt-2"><Plus size={12} /> 添加变量</button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">*** Keywords *** (自定义关键字)</label>
                              <textarea value={customKeywordsSection} onChange={e => setCustomKeywordsSection(e.target.value)} className="w-full px-2 py-1.5 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" rows={3} placeholder="自定义关键字定义..." />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-[#F27D26] mb-3 uppercase tracking-wider">当前用例设置 (Active Test Case)</h3>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">用例名称 (Test Case Name)</label>
                                <input type="text" value={activeTestCase.name} onChange={e => updateActiveTestCase({ name: e.target.value })} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">标签 (Tags)</label>
                                <input type="text" value={activeTestCase.tags || ''} onChange={e => updateActiveTestCase({ tags: e.target.value })} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" placeholder="例如: Done, Smoke" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">清理步骤 (Teardown)</label>
                                <input type="text" value={activeTestCase.teardown || ''} onChange={e => updateActiveTestCase({ teardown: e.target.value })} className="w-full px-2 py-1.5 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" placeholder="例如: sshClose     ${SUITE START TIME}" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-end gap-1 mb-4 border-b border-gray-300 overflow-x-auto pt-2 px-2">
                      {userKeywords.map(kw => (
                        <div key={kw.id} onClick={() => setActiveUserKeywordId(kw.id)} className={`group flex items-center gap-2 px-4 py-2 rounded-t-lg border-t border-l border-r cursor-pointer whitespace-nowrap transition-colors ${activeUserKeywordId === kw.id ? 'bg-white border-gray-300 text-[#F27D26] font-bold relative top-[1px]' : 'bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200'}`}>
                          <span className="max-w-[200px] truncate">{kw.name || '未命名关键字'}</span>
                          <button onClick={e => { e.stopPropagation(); removeUserKeyword(kw.id); }} className="ml-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500"><X size={14} /></button>
                        </div>
                      ))}
                      <button onClick={addUserKeyword} className="flex items-center gap-1 px-3 py-2 rounded-t-lg text-gray-500 hover:text-[#F27D26] hover:bg-gray-100 cursor-pointer whitespace-nowrap transition-colors mb-[1px]"><Plus size={14} /> 添加关键字</button>
                    </div>
                    {activeUserKeyword ? (
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200"><h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">关键字定义 (Keyword Definition)</h3></div>
                        <div className="p-4 space-y-4">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">关键字名称 (Name)</label>
                            <input type="text" value={activeUserKeyword.name} onChange={e => updateActiveUserKeyword({ name: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27D26]/20 focus:border-[#F27D26]" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">介绍 (Documentation)</label>
                            <textarea value={activeUserKeyword.desc} onChange={e => updateActiveUserKeyword({ desc: e.target.value })} rows={2} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F27D26]/20 focus:border-[#F27D26]" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">输入参数 (Arguments)</label>
                              <div className="space-y-2">
                                {activeUserKeyword.args.map((arg: string, idx: number) => (
                                  <div key={idx} className="flex gap-2">
                                    <input type="text" value={arg} onChange={e => { const n = [...activeUserKeyword.args]; n[idx] = e.target.value; updateActiveUserKeyword({ args: n }); }} className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs" placeholder="${arg_name}" />
                                    <button onClick={() => updateActiveUserKeyword({ args: activeUserKeyword.args.filter((_: any, i: number) => i !== idx) })} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                                  </div>
                                ))}
                                <button onClick={() => updateActiveUserKeyword({ args: [...activeUserKeyword.args, ''] })} className="text-[10px] text-[#F27D26] font-bold uppercase hover:underline">+ 添加参数</button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">输出变量 (Return)</label>
                              <div className="space-y-2">
                                {activeUserKeyword.returnVars.map((ret: string, idx: number) => (
                                  <div key={idx} className="flex gap-2">
                                    <input type="text" value={ret} onChange={e => { const n = [...activeUserKeyword.returnVars]; n[idx] = e.target.value; updateActiveUserKeyword({ returnVars: n }); }} className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs" placeholder="${return_var}" />
                                    <button onClick={() => updateActiveUserKeyword({ returnVars: activeUserKeyword.returnVars.filter((_: any, i: number) => i !== idx) })} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                                  </div>
                                ))}
                                <button onClick={() => updateActiveUserKeyword({ returnVars: [...activeUserKeyword.returnVars, ''] })} className="text-[10px] text-[#F27D26] font-bold uppercase hover:underline">+ 添加输出</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-4">还没有自定义关键字</p>
                        <button onClick={addUserKeyword} className="px-4 py-2 bg-[#F27D26] text-white rounded-lg font-bold text-sm hover:bg-[#d96a1d] transition-colors">立即创建一个</button>
                      </div>
                    )}
                  </>
                )}

                {/* Steps Area */}
                {(activeTab === 'testcases' || activeUserKeyword) && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">执行步骤 (Steps)</h3>
                      <span className="text-[10px] text-gray-400 font-mono">{steps.length} 步</span>
                    </div>
                    {steps.length === 0 ? (
                      <div className="h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400">
                        <Plus size={48} className="mb-4 opacity-50" />
                        <p className="font-medium">从左侧拖拽关键字到此处</p>
                        <p className="text-xs mt-1">支持 IF/FOR 嵌套结构</p>
                      </div>
                    ) : renderSteps(steps, null)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Console */}
          <div className="h-48 bg-[#1e1e1e] border-t border-gray-700 flex flex-col z-10">
            <div className="px-4 py-1.5 bg-[#2d2d2d] border-b border-gray-700 flex items-center gap-2 text-xs font-medium text-gray-300"><Terminal size={14} /> 执行控制台</div>
            <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] text-gray-300 space-y-1">
              {logs.length === 0 ? <div className="text-gray-600 italic">等待执行...</div> : logs.map((log, i) => (
                <div key={i} className={log.includes('[PASS]') ? 'text-green-400' : log.includes('[CLOUD]') ? 'text-blue-400' : log.includes('[ERROR]') ? 'text-red-400' : ''}>{log}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Properties */}
        <div className="w-72 bg-white border-l border-gray-300 flex flex-col shadow-sm z-10">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50"><h2 className="text-sm font-bold text-gray-800">属性配置 (Properties)</h2></div>
          <div className="flex-1 overflow-y-auto p-4">
            {!selectedStep ? (
              <div className="text-center text-gray-400 text-xs mt-10">请在画布中选中一个模块</div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">当前关键字</label>
                  <div className="text-sm font-bold text-gray-800 flex items-center gap-1">
                    {selectedStep.isContainer && <CornerDownRight size={14} className="text-blue-500" />}
                    {selectedStep.isComment && <Hash size={14} className="text-green-600" />}
                    {selectedStep.keyword}
                  </div>
                </div>
                {selectedStep.isComment ? (
                  <div className="pt-2 border-t border-gray-100">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">注释内容 (Comment Text)</label>
                    <textarea value={selectedStep.args.text || ''} onChange={e => updateStep(selectedStep.id, { args: { text: e.target.value } })} className="w-full h-24 p-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" placeholder="输入注释内容..." />
                  </div>
                ) : selectedStep.isCustomCode ? (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">原生代码</label>
                    <textarea value={selectedStep.customCode} onChange={e => updateStep(selectedStep.id, { customCode: e.target.value })} className="w-full h-48 p-2 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:border-[#F27D26] bg-gray-50" />
                  </div>
                ) : (
                  <>
                    <div className="pt-2 border-t border-gray-100">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">输入参数 (Arguments)</label>
                      {Object.keys(selectedStep.args).length === 0 ? (
                        <div className="text-xs text-gray-400 italic">此关键字无预设参数</div>
                      ) : (
                        <div className="space-y-3">
                          {Object.keys(selectedStep.args).map(argName => (
                            <div key={argName}>
                              <label className="block text-xs text-gray-700 mb-1">{argName}</label>
                              <input type="text" value={selectedStep.args[argName]} onChange={e => updateStep(selectedStep.id, { args: { ...selectedStep.args, [argName]: e.target.value } })} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" placeholder={`输入 ${argName}`} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {!selectedStep.isContainer && (
                      <div className="pt-4 border-t border-gray-100">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">执行修饰符 (Modifier)</label>
                        <select value={selectedStep.modifier || ''} onChange={e => updateStep(selectedStep.id, { modifier: e.target.value })} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26] bg-white">
                          <option value="">无 (None)</option>
                          <option value="Run Keyword And Continue On Failure">Run Keyword And Continue On Failure</option>
                          <option value="Run Keyword And Ignore Error">Run Keyword And Ignore Error</option>
                          <option value="Wait Until Keyword Succeeds">Wait Until Keyword Succeeds</option>
                        </select>
                      </div>
                    )}
                    <div className="pt-4 border-t border-gray-100">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">附加参数 (Extra Args)</label>
                      {(selectedStep.extraArgs || []).map((arg: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 mb-2">
                          <input type="text" value={arg} onChange={e => { const n = [...(selectedStep.extraArgs || [])]; n[idx] = e.target.value; updateStep(selectedStep.id, { extraArgs: n }); }} className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" placeholder={`Arg ${idx + 1}`} />
                          <button onClick={() => { const n = [...(selectedStep.extraArgs || [])]; n.splice(idx, 1); updateStep(selectedStep.id, { extraArgs: n }); }} className="p-1 text-gray-400 hover:text-red-500"><X size={14} /></button>
                        </div>
                      ))}
                      <button onClick={() => updateStep(selectedStep.id, { extraArgs: [...(selectedStep.extraArgs || []), ''] })} className="flex items-center gap-1 text-xs text-[#F27D26] font-medium hover:underline"><Plus size={12} /> 添加参数</button>
                    </div>
                    {!selectedStep.isContainer && (
                      <div className="pt-4 border-t border-gray-100">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">输出变量 (Return Values)</label>
                        {(selectedStep.outputVars || []).map((v: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 mb-2">
                            <input type="text" value={v} onChange={e => { const n = [...(selectedStep.outputVars || [])]; n[idx] = e.target.value; updateStep(selectedStep.id, { outputVars: n }); }} className="flex-1 px-2 py-1.5 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" placeholder="例如: ${result}" />
                            <button onClick={() => { const n = [...(selectedStep.outputVars || [])]; n.splice(idx, 1); updateStep(selectedStep.id, { outputVars: n }); }} className="p-1 text-gray-400 hover:text-red-500"><X size={14} /></button>
                          </div>
                        ))}
                        <button onClick={() => updateStep(selectedStep.id, { outputVars: [...(selectedStep.outputVars || []), ''] })} className="flex items-center gap-1 text-xs text-[#F27D26] font-medium hover:underline"><Plus size={12} /> 添加输出变量</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}