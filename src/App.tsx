import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Code, Search, Settings, FileText,
  Terminal, ChevronRight, ChevronDown, Trash2, GripVertical,
  Plus, X, CornerDownRight, Download, Hash, Upload,
  Save, Cloud, LogOut, User, FolderOpen, Eye, EyeOff,
  Database, RefreshCw, BookOpen
} from 'lucide-react';

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

interface LibraryFile { id: number; file_name: string; keywords: any[]; created_at: string; }

const INITIAL_KEYWORD_LIBRARY = [
  { category: 'Control Flow', name: 'IF', args: ['condition'], desc: 'IF statement', isContainer: true },
  { category: 'Control Flow', name: 'ELSE IF', args: ['condition'], desc: 'ELSE IF statement', isContainer: true },
  { category: 'Control Flow', name: 'ELSE', args: [], desc: 'ELSE statement', isContainer: true },
  { category: 'Control Flow', name: 'FOR', args: ['variable', 'IN', 'values'], desc: 'FOR loop', isContainer: true },
  { category: 'Control Flow', name: 'WHILE', args: ['condition'], desc: 'WHILE loop', isContainer: true },
  { category: 'Control Flow', name: 'Exit For Loop', args: [], desc: 'Stops the FOR loop.' },
  { category: 'Variables', name: 'Set Variable', args: ['value'], desc: 'Returns the given value.' },
  { category: 'Variables', name: 'Set Suite Variable', args: ['name', 'value'], desc: 'Suite-scoped variable.' },
  { category: 'Variables', name: 'Set Global Variable', args: ['name', 'value'], desc: 'Global variable.' },
  { category: 'BuiltIn', name: 'Log', args: ['message', 'level'], desc: 'Logs a message.' },
  { category: 'BuiltIn', name: 'Sleep', args: ['time'], desc: 'Pauses the test.' },
  { category: 'BuiltIn', name: 'Evaluate', args: ['expression'], desc: 'Evaluates Python expression.' },
  { category: 'BuiltIn', name: 'Comment', args: ['text'], desc: 'Adds a comment.' },
  { category: 'BuiltIn', name: '#', args: ['text'], desc: 'Hash comment.', isComment: true },
  { category: 'Custom Library', name: 'sshCommond', args: ['channel', 'command', 'arg'], desc: 'SSH command' },
  { category: 'Custom', name: '空白模板 (Custom Code)', args: [], isCustomCode: true, desc: '手写代码' },
];

// ─── AuthPage ──────────────────────────────────────────────
function AuthPage({ onLogin }: { onLogin: (token: string, user: any) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!email || !password) { setError('邮箱和密码不能为空'); return; }
    setLoading(true);
    try {
      const body: any = { email, password };
      if (mode === 'register') body.name = name || email;
      const data = await apiFetch(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(body) });
      localStorage.setItem('rf_token', data.token);
      localStorage.setItem('rf_user', JSON.stringify(data.user));
      onLogin(data.token, data.user);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#F27D26] rounded-xl mb-4"><span className="text-white font-black text-xl">RF</span></div>
          <h1 className="text-white font-bold text-2xl">Robot Framework</h1>
          <p className="text-gray-500 text-sm mt-1 font-mono">Visual Editor</p>
        </div>
        <div className="bg-[#1e1e1e] border border-gray-800 rounded-2xl p-8">
          <div className="flex gap-1 mb-8 bg-[#141414] p-1 rounded-lg">
            {(['login','register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode===m?'bg-[#F27D26] text-white':'text-gray-500 hover:text-gray-300'}`}>{m==='login'?'登录':'注册'}</button>
            ))}
          </div>
          <div className="space-y-4">
            {mode==='register' && <div><label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">用户名</label><input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="你的名字" className="w-full px-4 py-3 bg-[#141414] border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#F27D26]"/></div>}
            <div><label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">邮箱</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} placeholder="your@email.com" className="w-full px-4 py-3 bg-[#141414] border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#F27D26]"/></div>
            <div><label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">密码</label>
              <div className="relative">
                <input type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} placeholder={mode==='register'?'至少6位':'密码'} className="w-full px-4 py-3 bg-[#141414] border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#F27D26] pr-10"/>
                <button onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-3.5 text-gray-600 hover:text-gray-400">{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button>
              </div>
            </div>
            {error && <div className="px-4 py-3 bg-red-900/30 border border-red-800/50 rounded-lg text-red-400 text-xs">{error}</div>}
            <button onClick={submit} disabled={loading} className="w-full py-3 bg-[#F27D26] hover:bg-[#d96b1f] disabled:opacity-50 text-white font-bold text-sm rounded-lg transition-colors mt-2">{loading?'处理中...':mode==='login'?'登录':'创建账号'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── My Cases Panel ────────────────────────────────────────
function MyCasesPanel({ token, onLoad, onClose }: { token: string; onLoad: (c: any, id: number, n: string) => void; onClose: () => void; }) {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { apiFetch('/cases',{},token).then(d=>setCases(d.cases)).catch(e=>setError(e.message)).finally(()=>setLoading(false)); }, []);
  const handleLoad = async (id: number) => { try { const d = await apiFetch(`/cases/${id}`,{},token); onLoad(d.case.content,d.case.id,d.case.name); onClose(); } catch(e:any){setError(e.message);} };
  const handleDelete = async (e: React.MouseEvent, id: number) => { e.stopPropagation(); if(!confirm('确认删除？'))return; try{await apiFetch(`/cases/${id}`,{method:'DELETE'},token); setCases(p=>p.filter(c=>c.id!==id));}catch(e:any){setError(e.message);} };
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center"><Cloud size={16} className="text-[#F27D26]"/></div><div><p className="font-bold text-gray-900 text-sm">云端用例</p><p className="text-[10px] text-gray-400">{cases.length} 个已保存</p></div></div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={16} className="text-gray-500"/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading?<div className="text-center py-12 text-gray-400 text-sm">加载中...</div>:error?<div className="text-center py-12 text-red-500 text-sm">{error}</div>:cases.length===0?<div className="text-center py-12"><FileText size={40} className="mx-auto text-gray-200 mb-3"/><p className="text-gray-400 text-sm">还没有保存的用例</p></div>:(
            <div className="space-y-2">{cases.map(c=>(
              <div key={c.id} onClick={()=>handleLoad(c.id)} className="group flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-[#F27D26] hover:bg-orange-50/30 cursor-pointer transition-all">
                <div className="w-9 h-9 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center flex-shrink-0"><FolderOpen size={16} className="text-gray-400 group-hover:text-[#F27D26]"/></div>
                <div className="flex-1 min-w-0"><p className="font-semibold text-gray-800 text-sm truncate">{c.name}</p><p className="text-[10px] text-gray-400 font-mono">{new Date(c.updated_at).toLocaleString('zh-CN')}</p></div>
                <button onClick={e=>handleDelete(e,c.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={14} className="text-red-400"/></button>
              </div>
            ))}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Save Modal ────────────────────────────────────────────
function SaveModal({ defaultName, currentCaseId, onSave, onClose }: { defaultName: string; currentCaseId: number|null; onSave: (n:string,o:boolean)=>void; onClose:()=>void; }) {
  const [name, setName] = useState(defaultName);
  const [overwrite, setOverwrite] = useState(!!currentCaseId);
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e=>e.stopPropagation()}>
        <h3 className="font-bold text-gray-900 mb-1">保存到云端</h3>
        <p className="text-xs text-gray-400 mb-5">用例将保存到你的账号下</p>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">用例名称</label>
        <input type="text" value={name} onChange={e=>setName(e.target.value)} autoFocus className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F27D26] mb-4"/>
        {currentCaseId && <label className="flex items-center gap-3 mb-5 cursor-pointer"><input type="checkbox" checked={overwrite} onChange={e=>setOverwrite(e.target.checked)} className="w-4 h-4 accent-[#F27D26]"/><span className="text-sm text-gray-600">覆盖原有版本</span></label>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50">取消</button>
          <button onClick={()=>{if(name.trim()){onSave(name.trim(),overwrite);onClose();}}} className="flex-1 py-2.5 bg-[#F27D26] text-white text-sm font-bold rounded-lg hover:bg-[#d96b1f]">保存</button>
        </div>
      </div>
    </div>
  );
}

// ─── Sync Keyword Modal ────────────────────────────────────
// 选择要同步到哪个库文件，并输入关键字信息
function SyncKeywordModal({
  keyword, libraries, onSync, onClose
}: {
  keyword: any;
  libraries: LibraryFile[];
  onSync: (libId: number, kwEntry: any) => Promise<void>;
  onClose: () => void;
}) {
  const [selectedLibId, setSelectedLibId] = useState<number | null>(libraries[0]?.id ?? null);
  const [kwName, setKwName] = useState(keyword?.name || '');
  const [kwArgs, setKwArgs] = useState<string[]>(keyword?.args || []);
  const [kwDoc, setKwDoc] = useState(keyword?.desc || '');
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  const handleSync = async () => {
    if (!selectedLibId) { setError('请选择目标库'); return; }
    if (!kwName.trim()) { setError('关键字名称不能为空'); return; }
    setSyncing(true);
    try {
      await onSync(selectedLibId, { name: kwName.trim(), args: kwArgs.filter(a => a.trim()), doc: kwDoc, tags: [] });
      onClose();
    } catch (e: any) { setError(e.message); }
    finally { setSyncing(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center"><BookOpen size={16} className="text-[#F27D26]"/></div>
          <div><h3 className="font-bold text-gray-900 text-sm">同步到关键字库</h3><p className="text-[10px] text-gray-400">将此关键字写入选定的云端库文件</p></div>
        </div>

        {libraries.length === 0 ? (
          <div className="py-6 text-center text-gray-400 text-sm">还没有导入任何库文件，请先上传 .robot/.resource</div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">目标库文件</label>
              <div className="space-y-1">
                {libraries.map(lib => (
                  <label key={lib.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedLibId===lib.id?'border-[#F27D26] bg-orange-50':'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="lib" checked={selectedLibId===lib.id} onChange={()=>setSelectedLibId(lib.id)} className="accent-[#F27D26]"/>
                    <span className="text-sm font-medium text-gray-700 font-mono">{lib.file_name}</span>
                    <span className="text-[10px] text-gray-400 ml-auto">{Array.isArray(lib.keywords)?lib.keywords.length:0} 个关键字</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">关键字名称</label>
              <input type="text" value={kwName} onChange={e=>setKwName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F27D26]"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">参数</label>
              {kwArgs.map((a, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input type="text" value={a} onChange={e=>{const n=[...kwArgs];n[i]=e.target.value;setKwArgs(n);}} placeholder="${arg}" className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#F27D26]"/>
                  <button onClick={()=>setKwArgs(kwArgs.filter((_,j)=>j!==i))} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><X size={13}/></button>
                </div>
              ))}
              <button onClick={()=>setKwArgs([...kwArgs,''])} className="text-[10px] text-[#F27D26] font-bold hover:underline">+ 添加参数</button>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">说明 (Documentation)</label>
              <textarea value={kwDoc} onChange={e=>setKwDoc(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#F27D26]"/>
            </div>
          </div>
        )}

        {error && <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>}

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50">取消</button>
          {libraries.length > 0 && (
            <button onClick={handleSync} disabled={syncing} className="flex-1 py-2.5 bg-[#F27D26] text-white text-sm font-bold rounded-lg hover:bg-[#d96b1f] disabled:opacity-50">
              {syncing ? '同步中...' : '同步到库'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('rf_token') || '');
  const [user, setUser] = useState<any>(() => { const u = localStorage.getItem('rf_user'); return u ? JSON.parse(u) : null; });
  const isLoggedIn = !!token && !!user;

  const [currentCaseId, setCurrentCaseId] = useState<number | null>(null);
  const [currentCaseName, setCurrentCaseName] = useState('');
  const [showMyCases, setShowMyCases] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle');

  const [library, setLibrary] = useState(INITIAL_KEYWORD_LIBRARY);
  const [userLibraryFiles, setUserLibraryFiles] = useState<LibraryFile[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);

  // 折叠状态：存放已折叠的 category 名称
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // 同步到库的弹窗
  const [syncModal, setSyncModal] = useState<{ keyword: any } | null>(null);

  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);

  const robotInputRef = useRef<HTMLInputElement>(null);
  const libFileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => { if (isLoggedIn) loadUserLibraries(); }, [isLoggedIn]);

  // ── 切换折叠 ────────────────────────────────────────────
  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  // ── 加载云端库 ───────────────────────────────────────────
  const loadUserLibraries = async () => {
    setLibraryLoading(true);
    try {
      const data = await apiFetch('/libraries', {}, token);
      const files: LibraryFile[] = data.libraries;
      setUserLibraryFiles(files);
      mergeLibrariesIntoSidebar(files);
      if (files.length > 0) {
        const total = files.reduce((s, f) => s + (Array.isArray(f.keywords) ? f.keywords.length : 0), 0);
        setLogs(prev => [...prev, `[CLOUD] 已自动加载 ${files.length} 个库，共 ${total} 个关键字`]);
      }
    } catch (e: any) { console.error('[加载库]', e.message); }
    finally { setLibraryLoading(false); }
  };

  const mergeLibrariesIntoSidebar = (files: LibraryFile[]) => {
    const cloudKws: any[] = [];
    files.forEach(file => {
      const kws = Array.isArray(file.keywords) ? file.keywords : JSON.parse(file.keywords as any);
      kws.forEach((kw: any) => {
        cloudKws.push({ category: file.file_name, name: kw.name, args: kw.args || [], desc: kw.doc || '', isContainer: false, isCustomCode: false, isComment: false, _libId: file.id });
      });
    });
    setLibrary(prev => {
      const builtIn = prev.filter(k => !['Control Flow','Variables','BuiltIn','Custom Library','Custom','用户自定义 (User Keywords)'].every(b => b !== k.category)
        ? INITIAL_KEYWORD_LIBRARY.some(ik => ik.name === k.name) : true
      );
      // 保留内置，清除旧的云端库条目，重新加入
      const fresh = INITIAL_KEYWORD_LIBRARY.filter(k => !cloudKws.find(c => c.name === k.name));
      return [...fresh, ...cloudKws];
    });
  };

  // ── 上传 .robot/.resource ────────────────────────────────
  const handleLibFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files?.length) return;
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('files', f));
    setLibraryLoading(true);
    setLogs(prev => [...prev, `[INFO] 上传 ${files.length} 个文件解析中...`]);
    try {
      const res = await fetch(`${API_BASE}/libraries/parse`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '上传失败');
      await loadUserLibraries();
      data.results?.forEach((r: any) => setLogs(prev => [...prev, `[CLOUD] ${r.file_name}: ${r.keyword_count} 个关键字已入库`]));
      data.errors?.forEach((er: any) => setLogs(prev => [...prev, `[ERROR] ${er.file}: ${er.error}`]));
    } catch (err: any) { setLogs(prev => [...prev, `[ERROR] 上传失败: ${err.message}`]); }
    finally { setLibraryLoading(false); e.target.value = ''; }
  };

  // ── 删除侧边栏中某个关键字（从云端库中移除）──────────────
  const handleDeleteKeywordFromLibrary = async (kwName: string, libId: number) => {
    const lib = userLibraryFiles.find(f => f.id === libId);
    if (!lib) return;
    if (!confirm(`从 "${lib.file_name}" 中删除关键字 "${kwName}"？`)) return;
    const kws = Array.isArray(lib.keywords) ? lib.keywords : JSON.parse(lib.keywords as any);
    const updated = kws.filter((k: any) => k.name !== kwName);
    try {
      await apiFetch(`/libraries/${libId}/keywords`, { method: 'PUT', body: JSON.stringify({ keywords: updated }) }, token);
      // 更新本地状态
      setUserLibraryFiles(prev => prev.map(f => f.id === libId ? { ...f, keywords: updated } : f));
      setLibrary(prev => prev.filter(k => !(k.name === kwName && (k as any)._libId === libId)));
      setLogs(prev => [...prev, `[INFO] 已从 ${lib.file_name} 删除关键字: ${kwName}`]);
    } catch (e: any) { setLogs(prev => [...prev, `[ERROR] 删除失败: ${e.message}`]); }
  };

  // ── 同步关键字到库 ───────────────────────────────────────
  const handleSyncKeywordToLib = async (libId: number, kwEntry: any) => {
    const lib = userLibraryFiles.find(f => f.id === libId);
    if (!lib) throw new Error('库不存在');
    const kws = Array.isArray(lib.keywords) ? lib.keywords : JSON.parse(lib.keywords as any);
    // 同名则替换，否则追加
    const exists = kws.findIndex((k: any) => k.name === kwEntry.name);
    const updated = exists >= 0 ? kws.map((k: any, i: number) => i === exists ? kwEntry : k) : [...kws, kwEntry];
    await apiFetch(`/libraries/${libId}/keywords`, { method: 'PUT', body: JSON.stringify({ keywords: updated }) }, token);
    // 更新本地状态
    setUserLibraryFiles(prev => prev.map(f => f.id === libId ? { ...f, keywords: updated } : f));
    // 更新侧边栏（如果已存在则更新，否则添加）
    setLibrary(prev => {
      const idx = prev.findIndex(k => k.name === kwEntry.name && (k as any)._libId === libId);
      const newEntry = { category: lib.file_name, name: kwEntry.name, args: kwEntry.args || [], desc: kwEntry.doc || '', isContainer: false, isCustomCode: false, isComment: false, _libId: libId };
      if (idx >= 0) return prev.map((k, i) => i === idx ? newEntry : k);
      return [...prev, newEntry];
    });
    setLogs(prev => [...prev, `[CLOUD] 关键字 "${kwEntry.name}" 已同步到 ${lib.file_name}`]);
  };

  // ── 删除整个库文件 ───────────────────────────────────────
  const handleDeleteLibraryFile = async (lib: LibraryFile) => {
    if (!confirm(`删除库 "${lib.file_name}"？`)) return;
    try {
      await apiFetch(`/libraries/${lib.id}`, { method: 'DELETE' }, token);
      setUserLibraryFiles(prev => prev.filter(f => f.id !== lib.id));
      setLibrary(prev => prev.filter(k => k.category !== lib.file_name));
      setLogs(prev => [...prev, `[INFO] 已删除库: ${lib.file_name}`]);
    } catch (e: any) { setLogs(prev => [...prev, `[ERROR] 删除失败: ${e.message}`]); }
  };

  // ── Auth ─────────────────────────────────────────────────
  const handleLogin = (tok: string, u: any) => { setToken(tok); setUser(u); };
  const handleLogout = () => {
    localStorage.removeItem('rf_token'); localStorage.removeItem('rf_user');
    setToken(''); setUser(null); setCurrentCaseId(null); setCurrentCaseName('');
    setUserLibraryFiles([]); setLibrary(INITIAL_KEYWORD_LIBRARY);
  };

  const buildSaveContent = () => ({ testCases, globalVars, settingsSection, customKeywordsSection, userKeywords });
  const handleSave = async (name: string, overwrite: boolean) => {
    setSaveStatus('saving');
    try {
      const content = buildSaveContent();
      if (overwrite && currentCaseId) {
        await apiFetch(`/cases/${currentCaseId}`, { method: 'PUT', body: JSON.stringify({ name, content }) }, token);
        setCurrentCaseName(name);
      } else {
        const data = await apiFetch('/cases', { method: 'POST', body: JSON.stringify({ name, content }) }, token);
        setCurrentCaseId(data.case.id); setCurrentCaseName(name);
      }
      setSaveStatus('saved');
      setLogs(prev => [...prev, `[CLOUD] 用例已保存: ${name}`]);
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
    if (content.testCases?.length) setActiveTestCaseId(content.testCases[0].id);
    setCurrentCaseId(caseId); setCurrentCaseName(caseName); setActiveTab('testcases');
    setLogs(prev => [...prev, `[CLOUD] 已加载: ${caseName}`]);
  };

  if (!isLoggedIn) return <AuthPage onLogin={handleLogin} />;

  // ── Step helpers ─────────────────────────────────────────
  const activeTestCase = testCases.find(tc => tc.id === activeTestCaseId) || testCases[0];
  const activeUserKeyword = userKeywords.find(kw => kw.id === activeUserKeywordId);
  const currentEntity = activeTab === 'testcases' ? activeTestCase : activeUserKeyword;
  const steps = currentEntity ? currentEntity.steps : [];

  const setSteps = (updater: any) => {
    if (activeTab === 'testcases') {
      setTestCases(prev => prev.map(tc => tc.id !== activeTestCaseId ? tc : { ...tc, steps: typeof updater === 'function' ? updater(tc.steps) : updater }));
    } else if (activeUserKeywordId) {
      setUserKeywords(prev => prev.map(kw => kw.id !== activeUserKeywordId ? kw : { ...kw, steps: typeof updater === 'function' ? updater(kw.steps) : updater }));
    }
  };

  const updateActiveTestCase = (u: any) => setTestCases(prev => prev.map(tc => tc.id === activeTestCaseId ? { ...tc, ...u } : tc));
  const updateActiveUserKeyword = (u: any) => setUserKeywords(prev => prev.map(kw => kw.id === activeUserKeywordId ? { ...kw, ...u } : kw));

  // ── Import Robot ─────────────────────────────────────────
  const handleImportRobot = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; setPendingImportFile(f); setShowImportConfirm(true); e.target.value = ''; };
  const cancelImport = () => { setShowImportConfirm(false); setPendingImportFile(null); };
  const confirmImport = () => {
    setShowImportConfirm(false); if (!pendingImportFile) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const content = ev.target!.result as string;
        const rawLines = content.split('\n');
        const lines: string[] = [];
        for (let line of rawLines) {
          const t = line.trim();
          if (t.startsWith('...')) { if (lines.length > 0) lines[lines.length-1] += '    ' + t.substring(3).trim(); }
          else lines.push(line.replace(/\r$/,''));
        }
        let section: string|null=null, parsedVars:any[]=[], parsedTCs:any[]=[], curTC:any=null, stack:any[]=[];
        let parsedSettings:string[]=[], parsedKws:string[]=[];
        const finalize = () => { if(curTC){parsedTCs.push(curTC);curTC=null;stack=[];} };
        const parseStep = (lineStr: string) => {
          const parts = lineStr.trim().split(/\s{2,}|\t+/); if(!parts.length)return null;
          let ov:string[]=[],mod='',kw='',args:string[]=[],ci=0;
          while(ci<parts.length&&/^[@$&]\{/.test(parts[ci])){let v=parts[ci];if(v.endsWith('='))v=v.slice(0,-1).trim();ov.push(v);ci++;if(ci<parts.length&&parts[ci]==='=')ci++;}
          const mods=['Run Keyword And Continue On Failure','Run Keyword And Ignore Error','Wait Until Keyword Succeeds'];
          if(ci<parts.length&&mods.includes(parts[ci])){mod=parts[ci];ci++;}
          if(ci<parts.length){kw=parts[ci];ci++;} if(!kw)return null;
          while(ci<parts.length){args.push(parts[ci]);ci++;}
          const lib=libraryRef.current.find(k=>k.name.toLowerCase()===kw.toLowerCase());
          const isCont=lib?lib.isContainer:['IF','FOR','WHILE','ELSE IF','ELSE'].includes(kw.toUpperCase());
          let named:any={},extra:string[]=[];
          if(lib?.args){lib.args.forEach((a:string,i:number)=>{named[a]=i<args.length?args[i]:'';});if(args.length>lib.args.length)extra=args.slice(lib.args.length);}else extra=[...args];
          return {id:`step_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,keyword:kw,isCustomCode:false,isContainer:isCont,isComment:false,args:named,extraArgs:extra,modifier:mod,outputVars:ov,children:isCont?[]:undefined};
        };
        for(const line of lines){
          const t=line.trim();
          if(!t&&section!=='keywords'&&section!=='settings')continue;
          if(t.startsWith('***')){const sn=t.replace(/\*/g,'').trim().toLowerCase();finalize();if(sn.includes('settings'))section='settings';else if(sn.includes('variables'))section='variables';else if(sn.includes('test cases'))section='testcases';else if(sn.includes('keywords'))section='keywords';continue;}
          if(section==='settings'){if(t)parsedSettings.push(line);}
          else if(section==='keywords'){if(t||parsedKws.length>0)parsedKws.push(line);}
          else if(section==='variables'){const p=t.split(/\s{2,}|\t+/);if(p.length>=2)parsedVars.push({name:p[0],value:p[1]});}
          else if(section==='testcases'){
            if(!line.startsWith(' ')&&!line.startsWith('\t')){finalize();curTC={id:`tc_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,name:t,teardown:'',tags:'',steps:[]};stack=[];}
            else if(curTC){
              if(t.startsWith('[Tags]'))curTC.tags=t.replace('[Tags]','').trim();
              else if(t.startsWith('[Teardown]'))curTC.teardown=t.replace('[Teardown]','').trim();
              else if(t.startsWith('#')){const s={id:`step_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,keyword:'#',isComment:true,args:{text:t.substring(1).trim()}};(stack.length>0?stack[stack.length-1].children:curTC.steps).push(s);}
              else if(t.toUpperCase()==='END'){stack.pop();}
              else{const s=parseStep(t);if(s){if(['ELSE','ELSE IF'].includes(s.keyword.toUpperCase()))stack.pop();(stack.length>0?stack[stack.length-1].children:curTC.steps).push(s);if(s.isContainer)stack.push(s);}}
            }
          }
        }
        finalize();
        if(parsedTCs.length>0){setTestCases(parsedTCs);setActiveTestCaseId(parsedTCs[0].id);}
        setGlobalVars(parsedVars);
        setSettingsSection(parsedSettings.length>0?parsedSettings.join('\n'):'');
        setCustomKeywordsSection(parsedKws.length>0?parsedKws.join('\n'):'');
        setCurrentCaseId(null);setCurrentCaseName('');
        setLogs(prev=>[...prev,`[INFO] 导入完成: ${pendingImportFile!.name}，${parsedTCs.length} 个用例`]);
      } catch(err:any){setLogs(prev=>[...prev,`[ERROR] 解析失败: ${err.message}`]);}
      setPendingImportFile(null);
    };
    reader.readAsText(pendingImportFile);
  };

  // ── Tree ops ─────────────────────────────────────────────
  const findStep=(nodes:any[],id:string):any=>{for(let n of nodes){if(n.id===id)return n;if(n.children){const f=findStep(n.children,id);if(f)return f;}}return null;};
  const updateNode=(nodes:any[],id:string,u:any):any[]=>nodes.map(n=>n.id===id?{...n,...u}:n.children?{...n,children:updateNode(n.children,id,u)}:n);
  const removeNode=(nodes:any[],id:string)=>{let removed:any=null;const filter=(list:any[]):any[]=>list.filter(n=>{if(n.id===id){removed=n;return false;}if(n.children)n.children=filter(n.children);return true;});return{newNodes:filter(nodes),removedNode:removed};};
  const insertNode=(nodes:any[],tid:string|null,pos:string,nn:any):any[]=>{if(!tid&&pos==='append')return[...nodes,nn];let res:any[]=[];for(let n of nodes){if(n.id===tid){if(pos==='before'){res.push(nn);res.push(n);}else if(pos==='after'){res.push(n);res.push(nn);}else if(pos==='inside')res.push({...n,children:[...(n.children||[]),nn]});}else res.push(n.children?{...n,children:insertNode(n.children,tid,pos,nn)}:n);}return res;};
  const moveStep=(sid:string,tid:string|null,pos:string)=>setSteps((p:any[])=>{const{newNodes,removedNode}=removeNode(p,sid);return removedNode?insertNode(newNodes,tid,pos,removedNode):p;});
  const insertNewStep=(kw:any,tid:string|null,pos:string)=>{const da:any={};if(kw.args)kw.args.forEach((a:string)=>{da[a]=kw.name==='sshCommond'&&a==='channel'?'${channel}':kw.name==='FOR'&&a==='IN'?'IN RANGE':'';});const s={id:`step_${Date.now()}`,keyword:kw.name,isCustomCode:kw.isCustomCode||false,isContainer:kw.isContainer||false,isComment:kw.isComment||false,args:da,extraArgs:[],modifier:'',customCode:'',outputVars:[],children:kw.isContainer?[]:undefined};setSteps((p:any[])=>insertNode(p,tid,pos,s));setSelectedStepId(s.id);};
  const addUserKeyword=()=>{const id=`kw_${Date.now()}`;setUserKeywords(prev=>[...prev,{id,name:'新关键字',desc:'',args:[],returnVars:[],steps:[]}]);setActiveUserKeywordId(id);setActiveTab('keywords');};
  const removeUserKeyword=(id:string)=>{setUserKeywords(prev=>prev.filter(k=>k.id!==id));if(activeUserKeywordId===id){setActiveUserKeywordId(null);setActiveTab('testcases');}};

  // ── DnD ──────────────────────────────────────────────────
  const handleDragStart=(e:React.DragEvent,kw:any)=>{e.dataTransfer.setData('application/json',JSON.stringify(kw));e.stopPropagation();};
  const handleStepDragStart=(e:React.DragEvent,id:string)=>{e.dataTransfer.setData('stepId',id);setDraggedStepId(id);e.stopPropagation();};
  const handleStepDragOver=(e:React.DragEvent,id:string,isCont:boolean)=>{e.preventDefault();e.stopPropagation();if(draggedStepId===id)return;const r=(e.currentTarget as HTMLElement).getBoundingClientRect();const y=e.clientY-r.top;setDropTarget({id,position:y<r.height*0.25?'before':(isCont&&y<r.height*0.75)?'inside':'after'});};
  const handleStepDrop=(e:React.DragEvent,tid:string)=>{e.preventDefault();e.stopPropagation();const dt=dropTarget;setDropTarget(null);setDraggedStepId(null);const sid=e.dataTransfer.getData('stepId');const kd=e.dataTransfer.getData('application/json');if(sid){if(sid!==tid)moveStep(sid,tid,dt?.position||'after');}else if(kd)insertNewStep(JSON.parse(kd),tid,dt?.position||'after');};
  const handleCanvasDrop=(e:React.DragEvent)=>{e.preventDefault();e.stopPropagation();setDropTarget(null);setDraggedStepId(null);const sid=e.dataTransfer.getData('stepId');const kd=e.dataTransfer.getData('application/json');if(sid)moveStep(sid,null,'append');else if(kd)insertNewStep(JSON.parse(kd),null,'append');};
  const handleDragOver=(e:React.DragEvent)=>{e.preventDefault();e.stopPropagation();};
  const handleDragEnd=()=>{setDraggedStepId(null);setDropTarget(null);};
  const updateStep=(id:string,u:any)=>setSteps((p:any[])=>updateNode(p,id,u));
  const handleDeleteStep=(e:React.MouseEvent,id:string)=>{e.stopPropagation();setSteps((p:any[])=>removeNode(p,id).newNodes);if(selectedStepId===id)setSelectedStepId(null);};
  const selectedStep=findStep(steps,selectedStepId||'');

  // ── Code Gen ─────────────────────────────────────────────
  const genSteps=(nodes:any[],level=1):string=>{let c='';const ind='    '.repeat(level);nodes.forEach((s,i)=>{if(s.isComment){c+=`${ind}# ${s.args.text}\n`;}else if(s.isCustomCode){s.customCode.split('\n').forEach((l:string)=>{c+=`${ind}${l}\n`;});}else if(s.isContainer){let line=`${ind}${s.keyword}`;Object.values(s.args).forEach((v:any)=>{if(v)line+=`    ${v}`;});(s.extraArgs||[]).forEach((v:any)=>{if(v)line+=`    ${v}`;});c+=line+'\n';c+=s.children?.length>0?genSteps(s.children,level+1):`${ind}    # TODO\n`;const ku=s.keyword.toUpperCase();if(['FOR','WHILE','IF','ELSE IF','ELSE'].includes(ku)){const next=nodes[i+1];if(!(['IF','ELSE IF','ELSE'].includes(ku)&&next&&['ELSE IF','ELSE'].includes(next.keyword.toUpperCase())))c+=`${ind}END\n`;}}else{let line=ind;const vv=(s.outputVars||[]).filter((v:string)=>v.trim());if(vv.length>0)line+=vv.join('    ')+'    ';else if(s.outputVar)line+=`${s.outputVar}    `;if(s.modifier)line+=`${s.modifier}    `;line+=s.keyword;Object.values(s.args).forEach((v:any)=>{if(v)line+=`    ${v}`;});(s.extraArgs||[]).forEach((v:any)=>{if(v)line+=`    ${v}`;});c+=line+'\n';}});return c;};
  const generateCode=():string=>{let c='*** Settings ***\n';if(settingsSection)c+=settingsSection+'\n';c+='\n';if(globalVars.some(v=>v.name)){c+='*** Variables ***\n';globalVars.forEach(v=>{if(v.name&&v.value)c+=`${v.name.padEnd(20)} ${v.value}\n`;});c+='\n';}c+='*** Test Cases ***\n';testCases.forEach(tc=>{c+=`${tc.name||'Test Case'}\n`;if(tc.tags)c+=`    [Tags]    ${tc.tags}\n`;c+=genSteps(tc.steps);if(tc.teardown)c+=`    [Teardown]    ${tc.teardown}\n`;c+='\n';});if(userKeywords.length>0){c+='*** Keywords ***\n';userKeywords.forEach(kw=>{c+=`${kw.name||'Keyword'}\n`;if(kw.desc)c+=`    [Documentation]    ${kw.desc}\n`;const va=(kw.args||[]).filter((a:string)=>a.trim());if(va.length>0)c+=`    [Arguments]    ${va.map((a:string)=>a.startsWith('${')? a:`\${${a}}`).join('    ')}\n`;c+=genSteps(kw.steps);const vr=(kw.returnVars||[]).filter((r:string)=>r.trim());if(vr.length>0)c+=`    [Return]    ${vr.map((r:string)=>r.startsWith('${')? r:`\${${r}}`).join('    ')}\n`;c+='\n';});}if(customKeywordsSection.trim()){if(!userKeywords.length)c+='*** Keywords ***\n';c+=customKeywordsSection+'\n';}return c;};
  const handleDownload=()=>{const blob=new Blob([generateCode()],{type:'text/plain'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='test_suite.robot';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);};
  const runSimulation=()=>{setIsRunning(true);setShowCode(false);setLogs(['[INFO] Starting...']);setTimeout(()=>{setLogs(p=>[...p,'[PASS] 执行完成']);setIsRunning(false);},1500);};

  // ── Render Steps ─────────────────────────────────────────
  const renderSteps=(nodes:any[],parentId:string|null=null):React.ReactNode=>{
    if(!nodes?.length){if(parentId)return<div className="py-4 text-center border-2 border-dashed border-gray-200 rounded bg-gray-50/50 text-gray-400 text-xs">拖拽模块到此内部</div>;return null;}
    return nodes.map(step=>{
      const isDT=dropTarget?.id===step.id;
      if(step.isComment)return(<React.Fragment key={step.id}>{isDT&&dropTarget!.position==='before'&&<div className="h-1 bg-[#F27D26] rounded my-1"/>}<div draggable onDragStart={e=>handleStepDragStart(e,step.id)} onDragOver={e=>handleStepDragOver(e,step.id,false)} onDrop={e=>handleStepDrop(e,step.id)} onDragEnd={handleDragEnd} onClick={e=>{e.stopPropagation();setSelectedStepId(step.id);}} className={`group relative flex items-center bg-green-50/50 border rounded-lg shadow-sm cursor-pointer mb-2 px-3 py-2 ${selectedStepId===step.id?'border-green-500 ring-1 ring-green-500':'border-green-200 hover:border-green-300'} ${draggedStepId===step.id?'opacity-50':''}`}><GripVertical size={16} className="text-green-400 mr-2 cursor-grab"/><Hash size={14} className="text-green-600 mr-1"/><span className="text-green-700 font-mono text-sm flex-1">{step.args.text||'Comment'}</span><button onClick={e=>handleDeleteStep(e,step.id)} className="text-green-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button></div>{isDT&&dropTarget!.position==='after'&&<div className="h-1 bg-[#F27D26] rounded my-1"/>}</React.Fragment>);
      return(<React.Fragment key={step.id}>{isDT&&dropTarget!.position==='before'&&<div className="h-1 bg-[#F27D26] rounded my-1"/>}<div draggable onDragStart={e=>handleStepDragStart(e,step.id)} onDragOver={e=>handleStepDragOver(e,step.id,step.isContainer)} onDrop={e=>handleStepDrop(e,step.id)} onDragEnd={handleDragEnd} onClick={e=>{e.stopPropagation();setSelectedStepId(step.id);}} className={`group relative flex flex-col bg-white border rounded-lg shadow-sm cursor-pointer mb-2 ${selectedStepId===step.id?'border-[#F27D26] ring-1 ring-[#F27D26]':'border-gray-300 hover:border-gray-400'} ${draggedStepId===step.id?'opacity-50':''} ${isDT&&dropTarget!.position==='inside'?'ring-2 ring-[#F27D26]':''}`}><div className="flex items-stretch"><div className={`w-8 flex items-center justify-center border-r border-gray-100 text-gray-400 group-hover:text-gray-600 rounded-tl-lg cursor-grab ${step.isContainer?'bg-blue-50':'bg-gray-50'}`}><GripVertical size={16}/></div><div className="flex-1 p-3 flex flex-col justify-center"><div className="flex items-center gap-2 flex-wrap">{step.isContainer&&<CornerDownRight size={14} className="text-blue-500"/>}{(step.outputVars||[]).filter((v:string)=>v).length>0&&<span className="text-xs font-mono text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">{step.outputVars.filter((v:string)=>v).join(', ')} =</span>}{step.modifier&&<span className="text-xs font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">{step.modifier}</span>}<span className={`text-sm font-bold ${step.isCustomCode?'text-blue-600':step.isContainer?'text-blue-700':'text-gray-800'}`}>{step.keyword}</span><div className="flex gap-2 ml-2 flex-wrap">{Object.entries(step.args).map(([k,v]:[string,any])=>v&&<span key={k} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">{k}: <span className="font-mono">{v}</span></span>)}{(step.extraArgs||[]).map((v:any,i:number)=>v&&<span key={`e${i}`} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">arg{i+1}: <span className="font-mono">{v}</span></span>)}</div></div></div><button onClick={e=>handleDeleteStep(e,step.id)} className="w-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-tr-lg opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button></div>{step.isContainer&&(<div className="ml-8 mr-2 mb-2 p-2 border-l-2 border-blue-300 bg-blue-50/30 rounded-r min-h-[40px]" onDrop={e=>handleStepDrop(e,step.id)} onDragOver={e=>handleStepDragOver(e,step.id,true)}>{renderSteps(step.children,step.id)}</div>)}</div>{isDT&&dropTarget!.position==='after'&&<div className="h-1 bg-[#F27D26] rounded my-1"/>}</React.Fragment>);
    });
  };

  // ── Sidebar data ─────────────────────────────────────────
  const combinedLibrary = [
    ...library,
    ...userKeywords.map(kw => ({ category: '用户自定义 (User Keywords)', name: kw.name, args: kw.args, desc: kw.desc, isContainer: false, isUserKeyword: true, _kwId: kw.id }))
  ];
  const filteredLibrary = combinedLibrary.filter(kw => kw.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const categories = [...new Set(filteredLibrary.map(kw => kw.category))];

  // 判断某个 category 是否是云端库（可编辑/删除关键字）
  const isCloudLibCat = (cat: string) => userLibraryFiles.some(f => f.file_name === cat);

  return (
    <div className="flex flex-col h-screen bg-[#E4E3E0] text-[#141414] font-sans overflow-hidden">

      {/* Import Confirm */}
      {showImportConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">确认导入</h3>
            <p className="text-sm text-gray-600 mb-6">导入将覆盖当前画布内容，是否继续？</p>
            <div className="flex justify-end gap-3">
              <button onClick={cancelImport} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">取消</button>
              <button onClick={confirmImport} className="px-4 py-2 text-sm font-medium text-white bg-[#F27D26] hover:bg-[#d96b1c] rounded-md">确认导入</button>
            </div>
          </div>
        </div>
      )}

      {showMyCases && <MyCasesPanel token={token} onLoad={handleLoadCase} onClose={()=>setShowMyCases(false)}/>}
      {showSaveModal && <SaveModal defaultName={currentCaseName||activeTestCase?.name||'未命名'} currentCaseId={currentCaseId} onSave={handleSave} onClose={()=>setShowSaveModal(false)}/>}
      {syncModal && <SyncKeywordModal keyword={syncModal.keyword} libraries={userLibraryFiles} onSync={handleSyncKeywordToLib} onClose={()=>setSyncModal(null)}/>}

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#141414] text-[#E4E3E0] shadow-md z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F27D26] rounded flex items-center justify-center font-bold text-white">RF</div>
          <div>
            <h1 className="font-bold text-sm tracking-wide">Robot Framework Visual Editor</h1>
            <p className="text-[10px] font-mono">{currentCaseName?<span className="text-orange-400">☁ {currentCaseName}</span>:<span className="text-gray-400">MVP Prototype</span>}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={()=>setShowCode(!showCode)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-gray-600 rounded hover:bg-gray-800"><Code size={14}/>{showCode?'隐藏代码':'查看代码'}</button>
          <button onClick={()=>robotInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-gray-600 rounded hover:bg-gray-800"><Upload size={14}/> 导入 .robot</button>
          <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-gray-600 rounded hover:bg-gray-800"><Download size={14}/> 下载 .robot</button>
          <div className="w-px h-6 bg-gray-700 mx-1"/>
          <button onClick={()=>setShowMyCases(true)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-gray-600 rounded hover:bg-gray-800"><FolderOpen size={14}/> 我的用例</button>
          <button onClick={()=>setShowSaveModal(true)} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded ${saveStatus==='saved'?'bg-green-600 text-white border border-green-600':saveStatus==='saving'?'bg-gray-700 text-gray-300 border border-gray-600':saveStatus==='error'?'bg-red-900 text-red-300 border border-red-700':'bg-[#F27D26] text-white hover:bg-[#d96b1f] border border-[#F27D26]'}`}>
            {saveStatus==='saving'?<><Save size={14} className="animate-pulse"/>保存中...</>:saveStatus==='saved'?<><Cloud size={14}/>已保存</>:saveStatus==='error'?<><X size={14}/>失败</>:<><Save size={14}/>保存到云端</>}
          </button>
          <button onClick={runSimulation} disabled={isRunning||steps.length===0} className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 border border-gray-600">
            <Play size={14} fill="currentColor"/> 运行
          </button>
          <div className="w-px h-6 bg-gray-700 mx-1"/>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded border border-gray-700">
            <div className="w-5 h-5 bg-[#F27D26] rounded-full flex items-center justify-center"><User size={11} className="text-white"/></div>
            <span className="text-xs text-gray-300 max-w-[80px] truncate">{user?.name||user?.email}</span>
          </div>
          <button onClick={handleLogout} title="退出" className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded"><LogOut size={15}/></button>
        </div>
        <input type="file" accept=".robot" ref={robotInputRef} style={{display:'none'}} onChange={handleImportRobot}/>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Library ── */}
        <div className="w-64 bg-white border-r border-gray-300 flex flex-col shadow-sm z-10">
          <div className="p-3 border-b border-gray-200 space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2 text-gray-400"/>
              <input type="text" placeholder="搜索关键字..." className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
            </div>
            <button onClick={()=>libFileInputRef.current?.click()} disabled={libraryLoading} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#F27D26]/10 hover:bg-[#F27D26]/20 border border-[#F27D26]/30 rounded text-[#F27D26] text-xs font-medium disabled:opacity-50">
              {libraryLoading?<RefreshCw size={13} className="animate-spin"/>:<Database size={13}/>}
              {libraryLoading?'解析中...':'上传库文件解析入库'}
            </button>
            <input type="file" accept=".robot,.resource" multiple ref={libFileInputRef} style={{display:'none'}} onChange={handleLibFileUpload}/>

            {/* 已入库文件列表 */}
            {userLibraryFiles.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded p-2 space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">已入库</span>
                  <button onClick={loadUserLibraries} title="刷新" className="text-gray-400 hover:text-[#F27D26]"><RefreshCw size={11}/></button>
                </div>
                {userLibraryFiles.map(lib => (
                  <div key={lib.id} className="flex items-center gap-1 group">
                    <span className="flex-1 text-[10px] text-gray-600 truncate font-mono" title={lib.file_name}>{lib.file_name}</span>
                    <button onClick={()=>window.open(`${API_BASE}/libraries/${lib.id}/export?token=${token}`,'_blank')} title="导出 .robot" className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-blue-500"><Download size={11}/></button>
                    <button onClick={()=>handleDeleteLibraryFile(lib)} title="删除整个库" className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500"><X size={11}/></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Keyword list — 支持折叠 */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {categories.map(cat => {
              const isCollapsed = collapsedCategories.has(cat);
              const catKws = filteredLibrary.filter(kw => kw.category === cat);
              const isCloud = isCloudLibCat(cat);
              const cloudLib = userLibraryFiles.find(f => f.file_name === cat);
              return (
                <div key={cat} className="mb-2">
                  {/* Category header — clickable to collapse */}
                  <div
                    onClick={() => toggleCategory(cat)}
                    className="flex items-center gap-1 px-1 py-1.5 rounded hover:bg-gray-100 cursor-pointer group/cat select-none"
                  >
                    <span className="text-gray-400 flex-shrink-0">
                      {isCollapsed ? <ChevronRight size={13}/> : <ChevronDown size={13}/>}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex-1 truncate">{cat}</span>
                    <span className="text-[9px] text-gray-400 flex-shrink-0">{catKws.length}</span>
                  </div>

                  {/* Keywords — hidden when collapsed */}
                  {!isCollapsed && (
                    <div className="space-y-1 mt-1 pl-1">
                      {catKws.map(kw => (
                        <div key={kw.name} className="group/kw relative flex items-stretch">
                          <div
                            draggable
                            onDragStart={e => handleDragStart(e, kw)}
                            onDoubleClick={() => insertNewStep(kw, null, 'append')}
                            className={`flex-1 px-3 py-2 text-xs border rounded-l cursor-grab active:cursor-grabbing hover:shadow-sm transition-all ${
                              kw.isContainer ? 'bg-blue-50 border-blue-200 text-blue-800 border-l-4 border-l-blue-500'
                              : (kw as any).isComment ? 'bg-green-50 border-green-200 text-green-800'
                              : (kw as any).isCustomCode ? 'bg-purple-50 border-purple-200 text-purple-800'
                              : isCloud ? 'bg-amber-50 border-amber-200 text-amber-900'
                              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                            } ${(isCloud || (kw as any).isUserKeyword) ? '' : 'rounded'}`}
                            title={`${(kw as any).desc || ''}\n(双击添加)`}
                          >
                            <div className="font-medium flex items-center gap-1 truncate">
                              {kw.isContainer && <CornerDownRight size={12}/>}
                              {(kw as any).isComment && <Hash size={12}/>}
                              <span className="truncate">{kw.name}</span>
                            </div>
                          </div>

                          {/* 删除按钮 — 仅云端库和用户自定义关键字显示 */}
                          {isCloud && cloudLib && (
                            <button
                              onClick={() => handleDeleteKeywordFromLibrary(kw.name, cloudLib.id)}
                              className="opacity-0 group-hover/kw:opacity-100 w-7 flex items-center justify-center bg-gray-50 border border-l-0 border-amber-200 rounded-r text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title={`从 ${cat} 删除此关键字`}
                            >
                              <Trash2 size={11}/>
                            </button>
                          )}
                          {(kw as any).isUserKeyword && (
                            <button
                              onClick={() => removeUserKeyword((kw as any)._kwId)}
                              className="opacity-0 group-hover/kw:opacity-100 w-7 flex items-center justify-center bg-gray-50 border border-l-0 border-gray-200 rounded-r text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="删除此自定义关键字"
                            >
                              <Trash2 size={11}/>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Middle: Canvas ── */}
        <div className="flex-1 flex flex-col relative bg-[#f5f5f5] min-w-0">
          {showCode ? (
            <div className="flex-1 p-4 overflow-hidden flex flex-col">
              <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-lg shadow-inner font-mono text-sm whitespace-pre overflow-auto flex-1"><code>{generateCode()}</code></pre>
            </div>
          ) : (
            <div className="flex-1 p-6 overflow-y-auto" onDrop={handleCanvasDrop} onDragOver={handleDragOver}>
              <div className="max-w-3xl mx-auto min-h-full pb-32">
                {/* Tabs */}
                <div className="flex border-b border-gray-300 mb-6">
                  {(['testcases','keywords'] as const).map(tab=>(
                    <button key={tab} onClick={()=>{setActiveTab(tab);if(tab==='keywords'&&userKeywords.length>0&&!activeUserKeywordId)setActiveUserKeywordId(userKeywords[0].id);}} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab===tab?'border-[#F27D26] text-[#F27D26]':'border-transparent text-gray-500 hover:text-gray-700'}`}>
                      {tab==='testcases'?'测试用例 (Test Cases)':'自定义关键字 (Keywords)'}
                    </button>
                  ))}
                </div>

                {activeTab === 'testcases' ? (
                  <>
                    <div className="flex items-end gap-1 mb-4 border-b border-gray-300 overflow-x-auto pt-2 px-2">
                      {testCases.map(tc=>(
                        <div key={tc.id} onClick={()=>setActiveTestCaseId(tc.id)} className={`group flex items-center gap-2 px-4 py-2 rounded-t-lg border-t border-l border-r cursor-pointer whitespace-nowrap transition-colors ${activeTestCaseId===tc.id?'bg-white border-gray-300 text-[#F27D26] font-bold relative top-[1px]':'bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200'}`}>
                          <span className="max-w-[200px] truncate">{tc.name||'未命名'}</span>
                          {testCases.length>1&&<button onClick={e=>{e.stopPropagation();const n=testCases.filter(t=>t.id!==tc.id);setTestCases(n);if(activeTestCaseId===tc.id)setActiveTestCaseId(n[0].id);}} className="ml-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500"><X size={14}/></button>}
                        </div>
                      ))}
                      <button onClick={()=>{const id=`tc_${Date.now()}`;setTestCases([...testCases,{id,name:`新用例 ${testCases.length+1}`,teardown:'',tags:'',steps:[]}]);setActiveTestCaseId(id);}} className="flex items-center gap-1 px-3 py-2 text-gray-500 hover:text-[#F27D26] hover:bg-gray-100 cursor-pointer whitespace-nowrap mb-[1px]"><Plus size={14}/> 添加用例</button>
                    </div>

                    <div className="mb-6 bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                      <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-200" onClick={()=>setShowSettings(!showSettings)}>
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700"><Settings size={16}/> 设置</div>
                        {showSettings?<ChevronDown size={16}/>:<ChevronRight size={16}/>}
                      </div>
                      {showSettings&&(
                        <div className="p-4 space-y-4">
                          <div className="pb-4 border-b border-gray-100 space-y-4">
                            <div><label className="block text-xs font-bold text-gray-700 mb-1">*** Settings ***</label><textarea value={settingsSection} onChange={e=>setSettingsSection(e.target.value)} className="w-full px-2 py-1.5 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" rows={3}/></div>
                            <div><label className="block text-xs font-bold text-gray-700 mb-1">全局变量</label>
                              <div className="space-y-2">
                                {globalVars.map((v,i)=>(
                                  <div key={i} className="flex items-center gap-2">
                                    <input type="text" value={v.name} onChange={e=>{const n=[...globalVars];n[i].name=e.target.value;setGlobalVars(n);}} placeholder="${VAR}" className="w-1/3 px-2 py-1 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]"/>
                                    <span className="text-gray-400">=</span>
                                    <input type="text" value={v.value} onChange={e=>{const n=[...globalVars];n[i].value=e.target.value;setGlobalVars(n);}} className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]"/>
                                    <button onClick={()=>setGlobalVars(globalVars.filter((_,idx)=>idx!==i))} className="p-1 text-gray-400 hover:text-red-500"><X size={14}/></button>
                                  </div>
                                ))}
                                <button onClick={()=>setGlobalVars([...globalVars,{name:'',value:''}])} className="flex items-center gap-1 text-xs text-[#F27D26] font-medium hover:underline"><Plus size={12}/> 添加变量</button>
                              </div>
                            </div>
                            <div><label className="block text-xs font-bold text-gray-700 mb-1">*** Keywords *** (手写)</label><textarea value={customKeywordsSection} onChange={e=>setCustomKeywordsSection(e.target.value)} className="w-full px-2 py-1.5 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" rows={3}/></div>
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-[#F27D26] mb-3 uppercase tracking-wider">当前用例</h3>
                            <div className="space-y-3">
                              <div><label className="block text-xs font-bold text-gray-700 mb-1">用例名称</label><input type="text" value={activeTestCase.name} onChange={e=>updateActiveTestCase({name:e.target.value})} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]"/></div>
                              <div><label className="block text-xs font-bold text-gray-700 mb-1">标签</label><input type="text" value={activeTestCase.tags||''} onChange={e=>updateActiveTestCase({tags:e.target.value})} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" placeholder="Done, Smoke"/></div>
                              <div><label className="block text-xs font-bold text-gray-700 mb-1">Teardown</label><input type="text" value={activeTestCase.teardown||''} onChange={e=>updateActiveTestCase({teardown:e.target.value})} className="w-full px-2 py-1.5 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]"/></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-end gap-1 mb-4 border-b border-gray-300 overflow-x-auto pt-2 px-2">
                      {userKeywords.map(kw=>(
                        <div key={kw.id} onClick={()=>setActiveUserKeywordId(kw.id)} className={`group flex items-center gap-2 px-4 py-2 rounded-t-lg border-t border-l border-r cursor-pointer whitespace-nowrap ${activeUserKeywordId===kw.id?'bg-white border-gray-300 text-[#F27D26] font-bold relative top-[1px]':'bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200'}`}>
                          <span className="max-w-[200px] truncate">{kw.name}</span>
                          <button onClick={e=>{e.stopPropagation();removeUserKeyword(kw.id);}} className="ml-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500"><X size={14}/></button>
                        </div>
                      ))}
                      <button onClick={addUserKeyword} className="flex items-center gap-1 px-3 py-2 text-gray-500 hover:text-[#F27D26] hover:bg-gray-100 cursor-pointer whitespace-nowrap mb-[1px]"><Plus size={14}/> 添加关键字</button>
                    </div>

                    {activeUserKeyword ? (
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">关键字定义</h3>
                          {/* ── 同步到库按钮 ── */}
                          {userLibraryFiles.length > 0 && (
                            <button
                              onClick={() => setSyncModal({ keyword: { name: activeUserKeyword.name, args: activeUserKeyword.args, desc: activeUserKeyword.desc } })}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                            >
                              <BookOpen size={13}/> 同步到库
                            </button>
                          )}
                        </div>
                        <div className="p-4 space-y-4">
                          <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">名称</label><input type="text" value={activeUserKeyword.name} onChange={e=>updateActiveUserKeyword({name:e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F27D26]"/></div>
                          <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">说明</label><textarea value={activeUserKeyword.desc} onChange={e=>updateActiveUserKeyword({desc:e.target.value})} rows={2} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F27D26]"/></div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">参数</label>
                              {activeUserKeyword.args.map((a:string,i:number)=>(<div key={i} className="flex gap-2 mb-2"><input type="text" value={a} onChange={e=>{const n=[...activeUserKeyword.args];n[i]=e.target.value;updateActiveUserKeyword({args:n});}} className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs" placeholder="${arg}"/><button onClick={()=>updateActiveUserKeyword({args:activeUserKeyword.args.filter((_:any,j:number)=>j!==i)})} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14}/></button></div>))}
                              <button onClick={()=>updateActiveUserKeyword({args:[...activeUserKeyword.args,'']})} className="text-[10px] text-[#F27D26] font-bold hover:underline">+ 添加参数</button>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">返回值</label>
                              {activeUserKeyword.returnVars.map((r:string,i:number)=>(<div key={i} className="flex gap-2 mb-2"><input type="text" value={r} onChange={e=>{const n=[...activeUserKeyword.returnVars];n[i]=e.target.value;updateActiveUserKeyword({returnVars:n});}} className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs" placeholder="${result}"/><button onClick={()=>updateActiveUserKeyword({returnVars:activeUserKeyword.returnVars.filter((_:any,j:number)=>j!==i)})} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14}/></button></div>))}
                              <button onClick={()=>updateActiveUserKeyword({returnVars:[...activeUserKeyword.returnVars,'']})} className="text-[10px] text-[#F27D26] font-bold hover:underline">+ 添加返回值</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                        <FileText size={48} className="mx-auto text-gray-300 mb-4"/>
                        <p className="text-gray-500 mb-4">还没有自定义关键字</p>
                        <button onClick={addUserKeyword} className="px-4 py-2 bg-[#F27D26] text-white rounded-lg font-bold text-sm hover:bg-[#d96a1d]">立即创建</button>
                      </div>
                    )}
                  </>
                )}

                {/* Steps */}
                {(activeTab==='testcases'||activeUserKeyword)&&(
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">执行步骤 (Steps)</h3>
                      <span className="text-[10px] text-gray-400 font-mono">{steps.length} 步</span>
                    </div>
                    {steps.length===0?(
                      <div className="h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400">
                        <Plus size={48} className="mb-4 opacity-50"/>
                        <p className="font-medium">从左侧拖拽关键字到此处</p>
                        <p className="text-xs mt-1">支持 IF/FOR 嵌套结构</p>
                      </div>
                    ):renderSteps(steps)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Console */}
          <div className="h-48 bg-[#1e1e1e] border-t border-gray-700 flex flex-col z-10">
            <div className="px-4 py-1.5 bg-[#2d2d2d] border-b border-gray-700 flex items-center gap-2 text-xs font-medium text-gray-300"><Terminal size={14}/> 执行控制台</div>
            <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] text-gray-300 space-y-1">
              {logs.length===0?<div className="text-gray-600 italic">等待执行...</div>:logs.map((log,i)=>(
                <div key={i} className={log.includes('[PASS]')?'text-green-400':log.includes('[CLOUD]')?'text-blue-400':log.includes('[ERROR]')?'text-red-400':''}>{log}</div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Properties ── */}
        <div className="w-72 bg-white border-l border-gray-300 flex flex-col shadow-sm z-10">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50"><h2 className="text-sm font-bold text-gray-800">属性配置 (Properties)</h2></div>
          <div className="flex-1 overflow-y-auto p-4">
            {!selectedStep?(<div className="text-center text-gray-400 text-xs mt-10">请在画布中选中一个模块</div>):(
              <div className="space-y-5">
                <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">当前关键字</label>
                  <div className="text-sm font-bold text-gray-800 flex items-center gap-1">{selectedStep.isContainer&&<CornerDownRight size={14} className="text-blue-500"/>}{selectedStep.isComment&&<Hash size={14} className="text-green-600"/>}{selectedStep.keyword}</div>
                </div>
                {selectedStep.isComment?(
                  <div className="pt-2 border-t border-gray-100"><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">注释内容</label><textarea value={selectedStep.args.text||''} onChange={e=>updateStep(selectedStep.id,{args:{text:e.target.value}})} className="w-full h-24 p-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" placeholder="输入注释..."/></div>
                ):selectedStep.isCustomCode?(
                  <div><label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">原生代码</label><textarea value={selectedStep.customCode} onChange={e=>updateStep(selectedStep.id,{customCode:e.target.value})} className="w-full h-48 p-2 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:border-[#F27D26] bg-gray-50"/></div>
                ):(
                  <>
                    <div className="pt-2 border-t border-gray-100">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">输入参数</label>
                      {Object.keys(selectedStep.args).length===0?<div className="text-xs text-gray-400 italic">无预设参数</div>:(
                        <div className="space-y-3">{Object.keys(selectedStep.args).map(argName=>(<div key={argName}><label className="block text-xs text-gray-700 mb-1">{argName}</label><input type="text" value={selectedStep.args[argName]} onChange={e=>updateStep(selectedStep.id,{args:{...selectedStep.args,[argName]:e.target.value}})} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]"/></div>))}</div>
                      )}
                    </div>
                    {!selectedStep.isContainer&&(
                      <div className="pt-4 border-t border-gray-100">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">执行修饰符</label>
                        <select value={selectedStep.modifier||''} onChange={e=>updateStep(selectedStep.id,{modifier:e.target.value})} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26] bg-white">
                          <option value="">无</option>
                          <option value="Run Keyword And Continue On Failure">Run Keyword And Continue On Failure</option>
                          <option value="Run Keyword And Ignore Error">Run Keyword And Ignore Error</option>
                          <option value="Wait Until Keyword Succeeds">Wait Until Keyword Succeeds</option>
                        </select>
                      </div>
                    )}
                    <div className="pt-4 border-t border-gray-100">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">附加参数</label>
                      {(selectedStep.extraArgs||[]).map((arg:string,idx:number)=>(<div key={idx} className="flex items-center gap-2 mb-2"><input type="text" value={arg} onChange={e=>{const n=[...(selectedStep.extraArgs||[])];n[idx]=e.target.value;updateStep(selectedStep.id,{extraArgs:n});}} className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" placeholder={`Arg ${idx+1}`}/><button onClick={()=>{const n=[...(selectedStep.extraArgs||[])];n.splice(idx,1);updateStep(selectedStep.id,{extraArgs:n});}} className="p-1 text-gray-400 hover:text-red-500"><X size={14}/></button></div>))}
                      <button onClick={()=>updateStep(selectedStep.id,{extraArgs:[...(selectedStep.extraArgs||[]),''] })} className="flex items-center gap-1 text-xs text-[#F27D26] font-medium hover:underline"><Plus size={12}/> 添加参数</button>
                    </div>
                    {!selectedStep.isContainer&&(
                      <div className="pt-4 border-t border-gray-100">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">输出变量</label>
                        {(selectedStep.outputVars||[]).map((v:string,idx:number)=>(<div key={idx} className="flex items-center gap-2 mb-2"><input type="text" value={v} onChange={e=>{const n=[...(selectedStep.outputVars||[])];n[idx]=e.target.value;updateStep(selectedStep.id,{outputVars:n});}} className="flex-1 px-2 py-1.5 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" placeholder="${result}"/><button onClick={()=>{const n=[...(selectedStep.outputVars||[])];n.splice(idx,1);updateStep(selectedStep.id,{outputVars:n});}} className="p-1 text-gray-400 hover:text-red-500"><X size={14}/></button></div>))}
                        <button onClick={()=>updateStep(selectedStep.id,{outputVars:[...(selectedStep.outputVars||[]),''] })} className="flex items-center gap-1 text-xs text-[#F27D26] font-medium hover:underline"><Plus size={12}/> 添加输出变量</button>
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