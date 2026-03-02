import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Code, Search, Settings, FileText, 
  Terminal, ChevronRight, ChevronDown, Trash2, GripVertical,
  Plus, X, CornerDownRight, Download, Hash, Upload
} from 'lucide-react';

// --- Mock Data ---
const INITIAL_KEYWORD_LIBRARY = [
  { category: 'Control Flow', name: 'IF', args: ['condition'], desc: 'IF statement', isContainer: true },
  { category: 'Control Flow', name: 'ELSE IF', args: ['condition'], desc: 'ELSE IF statement', isContainer: true },
  { category: 'Control Flow', name: 'ELSE', args: [], desc: 'ELSE statement', isContainer: true },
  { category: 'Control Flow', name: 'FOR', args: ['variable', 'IN', 'values'], desc: 'FOR loop', isContainer: true },
  { category: 'Control Flow', name: 'WHILE', args: ['condition'], desc: 'WHILE loop', isContainer: true },
  { category: 'Control Flow', name: 'Exit For Loop', args: [], desc: 'Stops executing the enclosing FOR loop.' },
  // { category: 'Control Flow', name: 'Run Keyword If', args: ['condition', 'keyword'], desc: 'Runs the given keyword with the given arguments, if condition is true.' },
  { category: 'Variables', name: 'Set Variable', args: ['value'], desc: 'Returns the given value (used for local assignment).' },
  { category: 'Variables', name: 'Set Suite Variable', args: ['name', 'value'], desc: 'Makes a variable available everywhere within the scope of the current suite.' },
  { category: 'Variables', name: 'Set Global Variable', args: ['name', 'value'], desc: 'Makes a variable available globally in all tests and suites.' },
  { category: 'BuiltIn', name: 'Log', args: ['message', 'level'], desc: 'Logs the given message.' },
  { category: 'BuiltIn', name: 'Sleep', args: ['time'], desc: 'Pauses the test.' },
  // { category: 'BuiltIn', name: 'Should Be Equal As Strings', args: ['first', 'second'], desc: 'Fails if objects are unequal after converting them to strings.' },
  { category: 'BuiltIn', name: 'Evaluate', args: ['expression'], desc: 'Evaluates the given expression in Python and returns the result.' },
  { category: 'BuiltIn', name: 'Comment', args: ['text'], desc: 'Adds a comment (BuiltIn keyword).' },
  { category: 'BuiltIn', name: '#', args: ['text'], desc: 'Adds a hash comment.', isComment: true },
//   { category: 'Custom Library', name: 'SERControl_DriverNoOccpuant', args: [], desc: 'Driver No Occpuant' },
//   { category: 'Custom Library', name: 'SERControl_DriverOccpuant', args: [], desc: 'Driver Occpuant' },
//   { category: 'Custom Library', name: 'NioApp_Lock_Vehicle_With_Retry', args: [], desc: 'Lock Vehicle' },
//   { category: 'Custom Library', name: 'NT3_Wait_Util_VDF_Deep_Sleep', args: [], desc: 'Wait deep sleep' },
//   { category: 'Custom Library', name: 'Phone_ShortPress_Input_Password', args: ['button'], desc: 'HMIName Recovery time State' },
//   { category: 'Custom Library', name: 'PHY_OutCar_Pull', args: ['door'], desc: 'Pull door' },
//   { category: 'Custom Library', name: 'HMI_CheckButtonText', args: ['text'], desc: 'ButtonName ExpectText ExpectResult LastTime CheckByOldPicture' },
//   { category: 'Custom Library', name: '初始化连接', args: ['车内/外机械臂'], desc: '车内/外机械臂' },
//   { category: 'Custom Library', name: 'HMI_ShortPress_Button', args: ['button'], desc: 'HMIName Recovery time State' },
  { category: 'Custom Library', name: 'sshCommond', args: ['channel', 'command','arg'], desc: 'Execute SSH command' },
  // { category: 'Custom Library', name: 'Should Be Equal As Strings', args: ['arg','rec_status'], desc: 'Execute SSH command' },
  { category: 'Custom', name: '空白模板 (Custom Code)', args: [], isCustomCode: true, desc: '手写代码' },
];

export default function App() {
  const [library, setLibrary] = useState(INITIAL_KEYWORD_LIBRARY);
  const [selectedStepId, setSelectedStepId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState(null);
  
  const fileInputRef = useRef(null);
  const robotInputRef = useRef(null);

  // Drag and drop state
  const [draggedStepId, setDraggedStepId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null); // { id, position: 'before' | 'after' | 'inside' }

  // Test Case Settings
  const [testCases, setTestCases] = useState([
    {
      id: 'tc_1',
      name: '测试用例名称',
      teardown: 'sshClose     ${SUITE START TIME}    ${SUITE_NAME}    ${TEST_NAME}',
      tags: '',
      steps: []
    }
  ]);
  const [activeTestCaseId, setActiveTestCaseId] = useState('tc_1');
  const [globalVars, setGlobalVars] = useState([]);
  const [settingsSection, setSettingsSection] = useState("Resource          PreDefinedKey.robot\nResource          Setting.resource");
  const [customKeywordsSection, setCustomKeywordsSection] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const libraryRef = useRef(library);
  useEffect(() => {
    libraryRef.current = library;
  }, [library]);

  const activeTestCase = testCases.find(tc => tc.id === activeTestCaseId) || testCases[0];
  const steps = activeTestCase.steps;

  const setSteps = (updater) => {
    setTestCases(prev => prev.map(tc => {
      if (tc.id === activeTestCaseId) {
        const newSteps = typeof updater === 'function' ? updater(tc.steps) : updater;
        return { ...tc, steps: newSteps };
      }
      return tc;
    }));
  };

  const updateActiveTestCase = (updates) => {
    setTestCases(prev => prev.map(tc => tc.id === activeTestCaseId ? { ...tc, ...updates } : tc));
  };

  // --- Import Keywords ---
  const handleImportKeywords = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const newKeywords = [];
        
        Object.keys(json).forEach(fileName => {
          const keywords = json[fileName];
          if (Array.isArray(keywords)) {
            keywords.forEach(kw => {
              newKeywords.push({
                category: fileName, // Use the filename (e.g., PreDefinedKey.robot) as the category
                name: kw.name,
                args: kw.args || [],
                desc: kw.doc || '',
                isContainer: false,
                isCustomCode: false,
                isComment: false
              });
            });
          }
        });

        // Merge with existing library, avoiding exact duplicates by name
        setLibrary(prev => {
          const existingNames = new Set(prev.map(k => k.name));
          const uniqueNew = newKeywords.filter(k => !existingNames.has(k.name));
          return [...prev, ...uniqueNew];
        });
        
        setLogs(prev => [...prev, `[INFO] 成功导入 ${newKeywords.length} 个关键字来自 ${file.name}`]);
      } catch (err) {
        console.error(err);
        setLogs(prev => [...prev, `[ERROR] 解析 JSON 文件失败: ${err.message}`]);
      }
      // Reset input so the same file can be uploaded again if needed
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  // --- Import Robot File ---
  const handleImportRobot = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPendingImportFile(file);
    setShowImportConfirm(true);
    e.target.value = '';
  };

  const cancelImport = () => {
    setShowImportConfirm(false);
    setPendingImportFile(null);
  };

  const confirmImport = () => {
    setShowImportConfirm(false);
    if (!pendingImportFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const rawLines = content.split('\n');
        
        // Handle line continuations (...)
        const lines = [];
        for (let line of rawLines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('...')) {
            if (lines.length > 0) {
              lines[lines.length - 1] += '    ' + trimmed.substring(3).trim();
            }
          } else {
            lines.push(line.replace(/\r$/, ''));
          }
        }

        let currentSection = null;
        let parsedGlobalVars = [];
        let parsedTestCases = [];
        let currentTestCase = null;
        let blockStack = [];
        let parsedSettings = [];
        let parsedKeywords = [];

        const finalizeTestCase = () => {
          if (currentTestCase) {
            parsedTestCases.push(currentTestCase);
            currentTestCase = null;
            blockStack = [];
          }
        };

        const parseStepLine = (lineStr) => {
          const parts = lineStr.trim().split(/\s{2,}|\t+/);
          if (parts.length === 0) return null;

          let outputVars = [];
          let modifier = '';
          let keyword = '';
          let args = [];
          let currentIndex = 0;

          // 1. Extract Output Variables
          while (currentIndex < parts.length && (parts[currentIndex].startsWith('${') || parts[currentIndex].startsWith('@{') || parts[currentIndex].startsWith('&{'))) {
            let varName = parts[currentIndex];
            if (varName.endsWith('=')) {
              varName = varName.slice(0, -1).trim();
            }
            outputVars.push(varName);
            currentIndex++;
            if (currentIndex < parts.length && parts[currentIndex] === '=') {
              currentIndex++;
            }
          }

          // 2. Extract Modifier
          const actualModifiers = ['Run Keyword And Continue On Failure', 'Run Keyword And Ignore Error', 'Wait Until Keyword Succeeds'];
          if (currentIndex < parts.length && actualModifiers.includes(parts[currentIndex])) {
            modifier = parts[currentIndex];
            currentIndex++;
          }

          // 3. Extract Keyword
          if (currentIndex < parts.length) {
            keyword = parts[currentIndex];
            currentIndex++;
          }

          if (!keyword) return null;

          // 4. Extract Args
          while (currentIndex < parts.length) {
            args.push(parts[currentIndex]);
            currentIndex++;
          }

          const libKw = libraryRef.current.find(k => k.name.toLowerCase() === keyword.toLowerCase());
          const isContainer = libKw ? libKw.isContainer : ['IF', 'FOR', 'WHILE', 'ELSE IF', 'ELSE'].includes(keyword.toUpperCase());

          let namedArgs = {};
          let extraArgs = [];
          if (libKw && libKw.args) {
            libKw.args.forEach((argName, idx) => {
              if (idx < args.length) {
                namedArgs[argName] = args[idx];
              } else {
                namedArgs[argName] = '';
              }
            });
            if (args.length > libKw.args.length) {
              extraArgs = args.slice(libKw.args.length);
            }
          } else {
            args.forEach((arg) => {
              extraArgs.push(arg);
            });
          }

          return {
            id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            keyword: keyword,
            isCustomCode: false,
            isContainer: isContainer,
            isComment: false,
            args: namedArgs,
            extraArgs: extraArgs,
            modifier: modifier,
            outputVars: outputVars,
            children: isContainer ? [] : undefined
          };
        };

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const trimmed = line.trim();

          if (!trimmed && currentSection !== 'keywords' && currentSection !== 'settings') continue;

          if (trimmed.startsWith('***')) {
            const sectionName = trimmed.replace(/\*/g, '').trim().toLowerCase();
            if (sectionName.includes('settings')) {
              currentSection = 'settings';
              finalizeTestCase();
            } else if (sectionName.includes('variables')) {
              currentSection = 'variables';
              finalizeTestCase();
            } else if (sectionName.includes('test cases')) {
              currentSection = 'testcases';
              finalizeTestCase();
            } else if (sectionName.includes('keywords')) {
              currentSection = 'keywords';
              finalizeTestCase();
            }
            continue;
          }

          if (currentSection === 'settings') {
            if (trimmed) parsedSettings.push(line);
          } else if (currentSection === 'keywords') {
            if (line.trim() || parsedKeywords.length > 0) parsedKeywords.push(line);
          } else if (currentSection === 'variables') {
            const parts = trimmed.split(/\s{2,}|\t+/);
            if (parts.length >= 2) {
              parsedGlobalVars.push({ name: parts[0], value: parts[1] });
            }
          } else if (currentSection === 'testcases') {
            if (!line.startsWith(' ') && !line.startsWith('\t')) {
              finalizeTestCase();
              currentTestCase = {
                id: `tc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: trimmed,
                teardown: '',
                tags: '',
                steps: []
              };
              blockStack = [];
            } else if (currentTestCase) {
              if (trimmed.startsWith('[Tags]')) {
                currentTestCase.tags = trimmed.replace('[Tags]', '').trim();
              } else if (trimmed.startsWith('[Teardown]')) {
                currentTestCase.teardown = trimmed.replace('[Teardown]', '').trim();
              } else if (trimmed.startsWith('#')) {
                const step = {
                  id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  keyword: '#',
                  isComment: true,
                  args: { text: trimmed.substring(1).trim() }
                };
                if (blockStack.length > 0) {
                  blockStack[blockStack.length - 1].children.push(step);
                } else {
                  currentTestCase.steps.push(step);
                }
              } else if (trimmed.toUpperCase() === 'END') {
                blockStack.pop();
              } else {
                const step = parseStepLine(trimmed);
                if (step) {
                  if (['ELSE', 'ELSE IF'].includes(step.keyword.toUpperCase())) {
                     blockStack.pop();
                  }

                  if (blockStack.length > 0) {
                    blockStack[blockStack.length - 1].children.push(step);
                  } else {
                    currentTestCase.steps.push(step);
                  }

                  if (step.isContainer) {
                    blockStack.push(step);
                  }
                }
              }
            }
          }
        }
        finalizeTestCase();

        if (parsedTestCases.length > 0) {
          setTestCases(parsedTestCases);
          setActiveTestCaseId(parsedTestCases[0].id);
        }
        setGlobalVars(parsedGlobalVars);
        if (parsedSettings.length > 0) {
          setSettingsSection(parsedSettings.join('\n'));
        } else {
          setSettingsSection("");
        }
        if (parsedKeywords.length > 0) {
          setCustomKeywordsSection(parsedKeywords.join('\n'));
        } else {
          setCustomKeywordsSection("");
        }
        
        setLogs(prev => [...prev, `[INFO] 成功导入并解析 Robot 文件: ${pendingImportFile.name}`]);
      } catch (err) {
        console.error(err);
        setLogs(prev => [...prev, `[ERROR] 解析 Robot 文件失败: ${err.message}`]);
      }
      setPendingImportFile(null);
    };
    reader.readAsText(pendingImportFile);
  };

  // --- Tree Operations ---
  const findStep = (nodes, id) => {
    for (let node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findStep(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const updateNode = (nodes, id, updates) => {
    return nodes.map(node => {
      if (node.id === id) return { ...node, ...updates };
      if (node.children) return { ...node, children: updateNode(node.children, id, updates) };
      return node;
    });
  };

  const removeNode = (nodes, id) => {
    let removedNode = null;
    const filterNodes = (list) => {
      return list.filter(node => {
        if (node.id === id) {
          removedNode = node;
          return false;
        }
        if (node.children) {
          node.children = filterNodes(node.children);
        }
        return true;
      });
    };
    const newNodes = filterNodes(nodes);
    return { newNodes, removedNode };
  };

  const insertNode = (nodes, targetId, position, newNode) => {
    if (!targetId && position === 'append') {
      return [...nodes, newNode];
    }
    
    let result = [];
    for (let node of nodes) {
      if (node.id === targetId) {
        if (position === 'before') {
          result.push(newNode);
          result.push(node);
        } else if (position === 'after') {
          result.push(node);
          result.push(newNode);
        } else if (position === 'inside') {
          result.push({ ...node, children: [...(node.children || []), newNode] });
        }
      } else {
        if (node.children) {
          result.push({ ...node, children: insertNode(node.children, targetId, position, newNode) });
        } else {
          result.push(node);
        }
      }
    }
    return result;
  };

  const moveStep = (stepId, targetId, position) => {
    setSteps(prev => {
      const { newNodes, removedNode } = removeNode(prev, stepId);
      if (!removedNode) return prev;
      return insertNode(newNodes, targetId, position, removedNode);
    });
  };

  const insertNewStep = (keyword, targetId, position) => {
    const defaultArgs = {};
    if (keyword.args) {
      keyword.args.forEach(arg => {
        if (keyword.name === 'sshCommond' && arg === 'channel') defaultArgs[arg] = '${channel}';
        else if (keyword.name === 'Should Be Equal As Strings' && (arg === 'second' || arg === 'rec_status')) defaultArgs[arg] = 'success';
        else if (keyword.name === 'FOR' && arg === 'IN') defaultArgs[arg] = 'IN RANGE';
        else defaultArgs[arg] = '';
      });
    }

    const newStep = {
      id: `step_${Date.now()}`,
      keyword: keyword.name,
      isCustomCode: keyword.isCustomCode || false,
      isContainer: keyword.isContainer || false,
      isComment: keyword.isComment || false,
      args: defaultArgs,
      extraArgs: [],
      modifier: '',
      customCode: '',
      outputVars: [],
      children: keyword.isContainer ? [] : undefined
    };

    setSteps(prev => insertNode(prev, targetId, position, newStep));
    setSelectedStepId(newStep.id);
  };

  // --- Drag and Drop ---
  const handleDragStart = (e, keyword) => {
    e.dataTransfer.setData('application/json', JSON.stringify(keyword));
    e.stopPropagation();
  };

  const handleStepDragStart = (e, id) => {
    e.dataTransfer.setData('stepId', id);
    setDraggedStepId(id);
    e.stopPropagation();
  };

  const handleStepDragOver = (e, id, isContainer) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedStepId === id) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    let position = 'after';
    if (y < rect.height * 0.25) {
      position = 'before';
    } else if (isContainer && y < rect.height * 0.75) {
      position = 'inside';
    }
    
    setDropTarget({ id, position });
  };

  const handleStepDrop = (e, targetId) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(null);
    setDraggedStepId(null);
    
    const stepId = e.dataTransfer.getData('stepId');
    const keywordData = e.dataTransfer.getData('application/json');
    
    if (stepId) {
      if (stepId === targetId) return;
      moveStep(stepId, targetId, dropTarget?.position || 'after');
    } else if (keywordData) {
      const keyword = JSON.parse(keywordData);
      insertNewStep(keyword, targetId, dropTarget?.position || 'after');
    }
  };

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(null);
    setDraggedStepId(null);
    
    const stepId = e.dataTransfer.getData('stepId');
    const keywordData = e.dataTransfer.getData('application/json');
    
    if (stepId) {
      moveStep(stepId, null, 'append');
    } else if (keywordData) {
      const keyword = JSON.parse(keywordData);
      insertNewStep(keyword, null, 'append');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnd = () => {
    setDraggedStepId(null);
    setDropTarget(null);
  };

  // --- Handlers ---
  const updateStep = (id, updates) => setSteps(prev => updateNode(prev, id, updates));
  
  const handleDelete = (e, id) => {
    e.stopPropagation();
    setSteps(prev => {
      const { newNodes } = removeNode(prev, id);
      return newNodes;
    });
    if (selectedStepId === id) setSelectedStepId(null);
  };

  const selectedStep = findStep(steps, selectedStepId);

  // --- Code Generation ---
  const generateStepCode = (nodes, indentLevel = 1) => {
    let code = '';
    const indent = '    '.repeat(indentLevel);
    
    nodes.forEach((step, index) => {
      if (step.isComment) {
        code += `${indent}# ${step.args.text}\n`;
      } else if (step.isCustomCode) {
        step.customCode.split('\n').forEach(line => { code += `${indent}${line}\n`; });
      } else if (step.isContainer) {
        let line = `${indent}${step.keyword}`;
        Object.values(step.args).forEach(val => { if (val) line += `    ${val}`; });
        if (step.extraArgs) {
          step.extraArgs.forEach(val => { if (val) line += `    ${val}`; });
        }
        code += line + '\n';
        
        if (step.children && step.children.length > 0) {
          code += generateStepCode(step.children, indentLevel + 1);
        } else {
          code += `${indent}    # TODO: Add steps here\n`;
        }
        
        // RF requires END for IF/FOR/WHILE
        const kwUpper = step.keyword.toUpperCase();
        if (['FOR', 'WHILE', 'IF', 'ELSE IF', 'ELSE'].includes(kwUpper)) {
          const nextStep = nodes[index + 1];
          const isIfChain = ['IF', 'ELSE IF', 'ELSE'].includes(kwUpper);
          const hasNextElse = isIfChain && nextStep && ['ELSE IF', 'ELSE'].includes(nextStep.keyword.toUpperCase());
          
          if (!hasNextElse) {
            code += `${indent}END\n`;
          }
        }
      } else {
        let line = indent;
        
        if (step.outputVars && step.outputVars.length > 0) {
          const validVars = step.outputVars.filter(v => v.trim() !== '');
          if (validVars.length > 0) {
            line += validVars.join('    ') + '    ';
          }
        } else if (step.outputVar) {
          line += `${step.outputVar}    `;
        }

        if (step.modifier) line += `${step.modifier}    `;
        line += step.keyword;
        Object.values(step.args).forEach(val => { if (val) line += `    ${val}`; });
        if (step.extraArgs) {
          step.extraArgs.forEach(val => { if (val) line += `    ${val}`; });
        }
        code += line + '\n';
      }
    });
    return code;
  };

  const generateCode = () => {
    let code = '*** Settings ***\n';
    if (settingsSection) {
      code += settingsSection + '\n';
    }
    code += '\n';
    
    if (globalVars.length > 0 && globalVars.some(v => v.name)) {
      code += '*** Variables ***\n';
      globalVars.forEach(v => { if (v.name && v.value) code += `${v.name.padEnd(20)} ${v.value}\n`; });
      code += '\n';
    }

    code += '*** Test Cases ***\n';
    
    testCases.forEach(tc => {
      code += `${tc.name || 'Demo Visual Test Case'}\n`;
      if (tc.tags) {
        code += `    [Tags]    ${tc.tags}\n`;
      }
      code += generateStepCode(tc.steps, 1);
      
      if (tc.teardown) {
        code += `    [Teardown]    ${tc.teardown}\n`;
      }
      code += '\n';
    });
    
    if (customKeywordsSection.trim()) {
      code += '*** Keywords ***\n';
      code += customKeywordsSection + '\n';
    }
    
    return code;
  };

  // --- Download Code ---
  const handleDownload = () => {
    const code = generateCode();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test_suite.robot`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Simulation ---
  const runSimulation = () => {
    setIsRunning(true);
    setShowCode(false);
    setLogs(['[INFO] Starting test execution...', '[INFO] Parsing visual blocks...']);
    setTimeout(() => {
      setLogs(prev => [...prev, '[PASS] Test execution completed successfully.']);
      setIsRunning(false);
    }, 1500);
  };

  // --- Renderers ---
  const renderSteps = (nodes, parentId = null) => {
    if (!nodes || nodes.length === 0) {
      if (parentId) {
        return (
          <div className="py-4 text-center border-2 border-dashed border-gray-200 rounded bg-gray-50/50 text-gray-400 text-xs font-medium">
            拖拽模块到此内部
          </div>
        );
      }
      return null;
    }

    return nodes.map((step, index) => {
      const isDragTarget = dropTarget?.id === step.id;

      if (step.isComment) {
        return (
          <React.Fragment key={step.id}>
            {isDragTarget && dropTarget.position === 'before' && (
              <div className="h-1 bg-[#F27D26] rounded my-1"></div>
            )}
            <div 
              draggable
              onDragStart={(e) => handleStepDragStart(e, step.id)}
              onDragOver={(e) => handleStepDragOver(e, step.id, false)}
              onDrop={(e) => handleStepDrop(e, step.id)}
              onDragEnd={handleDragEnd}
              onClick={(e) => { e.stopPropagation(); setSelectedStepId(step.id); }}
              className={`group relative flex items-center bg-green-50/50 border rounded-lg shadow-sm cursor-pointer transition-all mb-2 px-3 py-2 ${selectedStepId === step.id ? 'border-green-500 ring-1 ring-green-500' : 'border-green-200 hover:border-green-300'} ${draggedStepId === step.id ? 'opacity-50' : ''}`}
            >
              <GripVertical size={16} className="text-green-400 mr-2 opacity-50 group-hover:opacity-100 cursor-grab active:cursor-grabbing" />
              <Hash size={14} className="text-green-600 mr-1" />
              <span className="text-green-700 font-mono text-sm flex-1">{step.args.text || 'Comment'}</span>
              <button onClick={(e) => handleDelete(e, step.id)} className="text-green-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
            </div>
            {isDragTarget && dropTarget.position === 'after' && (
              <div className="h-1 bg-[#F27D26] rounded my-1"></div>
            )}
          </React.Fragment>
        );
      }

      return (
        <React.Fragment key={step.id}>
          {isDragTarget && dropTarget.position === 'before' && (
            <div className="h-1 bg-[#F27D26] rounded my-1"></div>
          )}
          <div 
            draggable
            onDragStart={(e) => handleStepDragStart(e, step.id)}
            onDragOver={(e) => handleStepDragOver(e, step.id, step.isContainer)}
            onDrop={(e) => handleStepDrop(e, step.id)}
            onDragEnd={handleDragEnd}
            onClick={(e) => { e.stopPropagation(); setSelectedStepId(step.id); }}
            className={`group relative flex flex-col bg-white border rounded-lg shadow-sm cursor-pointer transition-all mb-2 ${selectedStepId === step.id ? 'border-[#F27D26] ring-1 ring-[#F27D26]' : 'border-gray-300 hover:border-gray-400'} ${draggedStepId === step.id ? 'opacity-50' : ''} ${isDragTarget && dropTarget.position === 'inside' ? 'ring-2 ring-[#F27D26]' : ''}`}
          >
            {/* Step Header */}
            <div className="flex items-stretch">
              <div className={`w-8 flex items-center justify-center border-r border-gray-100 text-gray-400 group-hover:text-gray-600 rounded-tl-lg cursor-grab active:cursor-grabbing ${step.isContainer ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <GripVertical size={16} />
              </div>
              <div className="flex-1 p-3 flex flex-col justify-center">
                <div className="flex items-center gap-2 flex-wrap">
                  {step.isContainer && <CornerDownRight size={14} className="text-blue-500" />}
                  
                  {(step.outputVars || []).filter(v => v).length > 0 ? (
                    <span className="text-xs font-mono text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                      {step.outputVars.filter(v => v).join(', ')} =
                    </span>
                  ) : step.outputVar ? (
                    <span className="text-xs font-mono text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                      {step.outputVar} =
                    </span>
                  ) : null}

                  {step.modifier && (
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                      {step.modifier}
                    </span>
                  )}
                  <span className={`text-sm font-bold ${step.isCustomCode ? 'text-blue-600' : step.isContainer ? 'text-blue-700' : 'text-gray-800'}`}>
                    {step.keyword}
                  </span>
                  {/* Inline Args */}
                  <div className="flex gap-2 ml-2 flex-wrap">
                    {Object.entries(step.args).map(([key, val]) => val && (
                      <span key={key} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                        {key}: <span className="font-mono text-gray-800">{val}</span>
                      </span>
                    ))}
                    {(step.extraArgs || []).map((val, idx) => val && (
                      <span key={`extra_${idx}`} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                        arg{idx+1}: <span className="font-mono text-gray-800">{val}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button 
                onClick={(e) => handleDelete(e, step.id)}
                className="w-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-tr-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Container Body (Nested Dropzone) */}
            {step.isContainer && (
              <div 
                className="ml-8 mr-2 mb-2 p-2 border-l-2 border-blue-300 bg-blue-50/30 rounded-r min-h-[40px]"
                onDrop={(e) => handleStepDrop(e, step.id)}
                onDragOver={(e) => handleStepDragOver(e, step.id, true)}
              >
                {renderSteps(step.children, step.id)}
              </div>
            )}
          </div>
          {isDragTarget && dropTarget.position === 'after' && (
            <div className="h-1 bg-[#F27D26] rounded my-1"></div>
          )}
        </React.Fragment>
      );
    });
  };

  const filteredLibrary = library.filter(kw => kw.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const categories = [...new Set(filteredLibrary.map(kw => kw.category))];

  return (
    <div className="flex flex-col h-screen bg-[#E4E3E0] text-[#141414] font-sans overflow-hidden">
      {/* Import Confirmation Modal */}
      {showImportConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">确认导入</h3>
            <p className="text-sm text-gray-600 mb-6">导入将覆盖当前画布中的所有内容，是否继续？</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelImport}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                取消
              </button>
              <button 
                onClick={confirmImport}
                className="px-4 py-2 text-sm font-medium text-white bg-[#F27D26] hover:bg-[#d96b1c] rounded-md"
              >
                确认导入
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#141414] text-[#E4E3E0] shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F27D26] rounded flex items-center justify-center font-bold text-white">RF</div>
          <div>
            <h1 className="font-bold text-sm tracking-wide">Robot Framework Visual Editor</h1>
            <p className="text-[10px] text-gray-400 font-mono">MVP Prototype</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowCode(!showCode)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-gray-600 rounded hover:bg-gray-800 transition-colors">
            <Code size={14} /> {showCode ? '隐藏代码' : '查看生成的代码'}
          </button>
          <button onClick={() => robotInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-gray-600 rounded hover:bg-gray-800 transition-colors">
            <Upload size={14} /> 导入 .robot 文件
          </button>
          <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-gray-600 rounded hover:bg-gray-800 transition-colors">
            <Download size={14} /> 保存 .robot 文件
          </button>
          <button onClick={runSimulation} disabled={isRunning || steps.length === 0} className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold bg-[#F27D26] text-white rounded hover:bg-[#d96b1f] disabled:opacity-50 transition-colors">
            <Play size={14} fill="currentColor" /> 运行测试
          </button>
          <input type="file" accept=".robot" ref={robotInputRef} style={{ display: 'none' }} onChange={handleImportRobot} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Library */}
        <div className="w-64 bg-white border-r border-gray-300 flex flex-col shadow-sm z-10">
          <div className="p-3 border-b border-gray-200">
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                <input type="text" placeholder="搜索关键字..." className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-gray-600 flex items-center justify-center transition-colors"
                title="导入 JSON 关键字"
              >
                <Upload size={14} />
              </button>
              <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleImportKeywords} 
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {categories.map(cat => (
              <div key={cat}>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">{cat}</div>
                <div className="space-y-1">
                  {filteredLibrary.filter(kw => kw.category === cat).map(kw => (
                    <div key={kw.name} draggable onDragStart={(e) => handleDragStart(e, kw)} className={`px-3 py-2 text-xs border rounded cursor-grab active:cursor-grabbing hover:shadow-sm transition-all ${kw.isContainer ? 'bg-blue-50 border-blue-200 text-blue-800 border-l-4 border-l-blue-500' : kw.isComment ? 'bg-green-50 border-green-200 text-green-800' : kw.isCustomCode ? 'bg-purple-50 border-purple-200 text-purple-800' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`} title={kw.desc}>
                      <div className="font-medium flex items-center gap-1">
                        {kw.isContainer && <CornerDownRight size={12} />}
                        {kw.isComment && <Hash size={12} />}
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
        <div className="flex-1 flex flex-col relative bg-[#f5f5f5]">
          {showCode ? (
            <div className="flex-1 p-4 overflow-auto">
              <div className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-lg shadow-inner font-mono text-sm whitespace-pre h-full overflow-auto">
                {generateCode()}
              </div>
            </div>
          ) : (
            <div className="flex-1 p-6 overflow-y-auto" onDrop={handleCanvasDrop} onDragOver={handleDragOver}>
              <div className="max-w-3xl mx-auto min-h-full pb-32">
                {/* Test Case Tabs */}
                <div className="flex items-end gap-1 mb-4 border-b border-gray-300 overflow-x-auto pt-2 px-2">
                  {testCases.map(tc => (
                    <div 
                      key={tc.id}
                      onClick={() => setActiveTestCaseId(tc.id)}
                      className={`group flex items-center gap-2 px-4 py-2 rounded-t-lg border-t border-l border-r cursor-pointer whitespace-nowrap transition-colors ${activeTestCaseId === tc.id ? 'bg-white border-gray-300 text-[#F27D26] font-bold relative top-[1px]' : 'bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200'}`}
                    >
                      <span className="max-w-[200px] truncate" title={tc.name || '未命名用例'}>
                        {tc.name || '未命名用例'}
                      </span>
                      {testCases.length > 1 && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const newTestCases = testCases.filter(t => t.id !== tc.id);
                            setTestCases(newTestCases);
                            if (activeTestCaseId === tc.id) {
                              setActiveTestCaseId(newTestCases[0].id);
                            }
                          }}
                          className={`ml-1 ${activeTestCaseId === tc.id ? 'text-gray-400 hover:text-red-500' : 'text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500'}`}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const newId = `tc_${Date.now()}`;
                      setTestCases([...testCases, {
                        id: newId,
                        name: `新测试用例 ${testCases.length + 1}`,
                        teardown: '',
                        tags: '',
                        steps: []
                      }]);
                      setActiveTestCaseId(newId);
                    }}
                    className="flex items-center gap-1 px-3 py-2 rounded-t-lg text-gray-500 hover:text-[#F27D26] hover:bg-gray-100 cursor-pointer whitespace-nowrap transition-colors mb-[1px]"
                  >
                    <Plus size={14} /> 添加用例
                  </button>
                </div>

                {/* Test Case Settings */}
                <div className="mb-6 bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                  <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => setShowSettings(!showSettings)}>
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700"><Settings size={16} /> 设置 (Suite & Test Case Settings)</div>
                    {showSettings ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                  {showSettings && (
                    <div className="p-4 space-y-4">
                      {/* Suite Settings */}
                      <div className="pb-4 border-b border-gray-100 space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">*** Settings *** (全局配置)</label>
                          <textarea 
                            value={settingsSection} 
                            onChange={(e) => setSettingsSection(e.target.value)} 
                            className="w-full px-2 py-1.5 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" 
                            rows={3}
                            placeholder="Resource    PreDefinedKey.robot"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">全局变量 (Suite Variables)</label>
                          <div className="space-y-2">
                            {globalVars.map((v, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <input type="text" value={v.name} onChange={(e) => { const newVars = [...globalVars]; newVars[i].name = e.target.value; setGlobalVars(newVars); }} placeholder="${VAR_NAME}" className="w-1/3 px-2 py-1 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" />
                                <span className="text-gray-400">=</span>
                                <input type="text" value={v.value} onChange={(e) => { const newVars = [...globalVars]; newVars[i].value = e.target.value; setGlobalVars(newVars); }} placeholder="Value" className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" />
                                <button onClick={() => setGlobalVars(globalVars.filter((_, idx) => idx !== i))} className="p-1 text-gray-400 hover:text-red-500"><X size={14} /></button>
                              </div>
                            ))}
                            <button onClick={() => setGlobalVars([...globalVars, { name: '', value: '' }])} className="flex items-center gap-1 text-xs text-[#F27D26] font-medium hover:underline mt-2"><Plus size={12} /> 添加变量</button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">*** Keywords *** (自定义关键字)</label>
                          <textarea 
                            value={customKeywordsSection} 
                            onChange={(e) => setCustomKeywordsSection(e.target.value)} 
                            className="w-full px-2 py-1.5 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" 
                            rows={3}
                            placeholder="自定义关键字定义..."
                          />
                        </div>
                      </div>

                      {/* Active Test Case Settings */}
                      <div>
                        <h3 className="text-xs font-bold text-[#F27D26] mb-3 uppercase tracking-wider">当前用例设置 (Active Test Case)</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">用例名称 (Test Case Name)</label>
                            <input type="text" value={activeTestCase.name} onChange={(e) => updateActiveTestCase({ name: e.target.value })} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">标签 (Tags)</label>
                            <input type="text" value={activeTestCase.tags || ''} onChange={(e) => updateActiveTestCase({ tags: e.target.value })} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" placeholder="例如: Done, Smoke" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">清理步骤 (Teardown)</label>
                            <input type="text" value={activeTestCase.teardown || ''} onChange={(e) => updateActiveTestCase({ teardown: e.target.value })} className="w-full px-2 py-1.5 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" placeholder="例如: sshClose     ${SUITE START TIME}" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Steps Area */}
                {steps.length === 0 ? (
                  <div className="h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400">
                    <FileText size={48} className="mb-4 opacity-50" />
                    <p className="font-medium">从左侧拖拽关键字到此处</p>
                    <p className="text-xs mt-1">支持 IF/FOR 嵌套结构</p>
                  </div>
                ) : (
                  renderSteps(steps, null)
                )}
              </div>
            </div>
          )}

          {/* Console */}
          <div className="h-48 bg-[#1e1e1e] border-t border-gray-700 flex flex-col z-10">
            <div className="px-4 py-1.5 bg-[#2d2d2d] border-b border-gray-700 flex items-center gap-2 text-xs font-medium text-gray-300"><Terminal size={14} /> 执行控制台</div>
            <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] text-gray-300 space-y-1">
              {logs.length === 0 ? <div className="text-gray-600 italic">等待执行...</div> : logs.map((log, i) => <div key={i} className={`${log.includes('[PASS]') ? 'text-green-400' : ''}`}>{log}</div>)}
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
                    <textarea 
                      value={selectedStep.args.text || ''}
                      onChange={(e) => updateStep(selectedStep.id, { args: { text: e.target.value } })}
                      className="w-full h-24 p-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]"
                      placeholder="输入注释内容..."
                    />
                  </div>
                ) : selectedStep.isCustomCode ? (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">原生代码</label>
                    <textarea value={selectedStep.customCode} onChange={(e) => updateStep(selectedStep.id, { customCode: e.target.value })} className="w-full h-48 p-2 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:border-[#F27D26] bg-gray-50" />
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
                              <input type="text" value={selectedStep.args[argName]} onChange={(e) => updateStep(selectedStep.id, { args: { ...selectedStep.args, [argName]: e.target.value } })} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" placeholder={`输入 ${argName}`} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {!selectedStep.isContainer && (
                      <div className="pt-4 border-t border-gray-100">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">执行修饰符 (Modifier)</label>
                        <select
                          value={selectedStep.modifier || ''}
                          onChange={(e) => updateStep(selectedStep.id, { modifier: e.target.value })}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26] bg-white"
                        >
                          <option value="">无 (None)</option>
                          <option value="Run Keyword And Continue On Failure">Run Keyword And Continue On Failure</option>
                          <option value="Run Keyword And Ignore Error">Run Keyword And Ignore Error</option>
                          <option value="Wait Until Keyword Succeeds">Wait Until Keyword Succeeds</option>
                        </select>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-100">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">附加参数 (Extra Args)</label>
                      {(selectedStep.extraArgs || []).map((arg, idx) => (
                        <div key={idx} className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={arg}
                            onChange={(e) => {
                              const newArgs = [...(selectedStep.extraArgs || [])];
                              newArgs[idx] = e.target.value;
                              updateStep(selectedStep.id, { extraArgs: newArgs });
                            }}
                            className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]"
                            placeholder={`Arg ${idx + 1}`}
                          />
                          <button onClick={() => {
                            const newArgs = [...(selectedStep.extraArgs || [])];
                            newArgs.splice(idx, 1);
                            updateStep(selectedStep.id, { extraArgs: newArgs });
                          }} className="p-1 text-gray-400 hover:text-red-500"><X size={14} /></button>
                        </div>
                      ))}
                      <button onClick={() => {
                        const newArgs = [...(selectedStep.extraArgs || []), ''];
                        updateStep(selectedStep.id, { extraArgs: newArgs });
                      }} className="flex items-center gap-1 text-xs text-[#F27D26] font-medium hover:underline"><Plus size={12} /> 添加参数</button>
                    </div>

                    {!selectedStep.isContainer && (
                      <div className="pt-4 border-t border-gray-100">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">输出变量 (Return Values)</label>
                        {(selectedStep.outputVars || []).map((v, idx) => (
                          <div key={idx} className="flex items-center gap-2 mb-2">
                            <input
                              type="text"
                              value={v}
                              onChange={(e) => {
                                const newVars = [...(selectedStep.outputVars || [])];
                                newVars[idx] = e.target.value;
                                updateStep(selectedStep.id, { outputVars: newVars });
                              }}
                              className="flex-1 px-2 py-1.5 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]"
                              placeholder="例如: ${result}"
                            />
                            <button onClick={() => {
                              const newVars = [...(selectedStep.outputVars || [])];
                              newVars.splice(idx, 1);
                              updateStep(selectedStep.id, { outputVars: newVars });
                            }} className="p-1 text-gray-400 hover:text-red-500"><X size={14} /></button>
                          </div>
                        ))}
                        <button onClick={() => {
                          const newVars = [...(selectedStep.outputVars || []), ''];
                          updateStep(selectedStep.id, { outputVars: newVars });
                        }} className="flex items-center gap-1 text-xs text-[#F27D26] font-medium hover:underline"><Plus size={12} /> 添加输出变量</button>
                        
                        {/* Legacy support for single outputVar if it exists */}
                        {selectedStep.outputVar && (!selectedStep.outputVars || selectedStep.outputVars.length === 0) && (
                          <div className="mt-2">
                            <input type="text" value={selectedStep.outputVar} onChange={(e) => updateStep(selectedStep.id, { outputVar: e.target.value })} className="w-full px-2 py-1.5 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:border-[#F27D26]" placeholder="例如: ${result}" />
                          </div>
                        )}
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
