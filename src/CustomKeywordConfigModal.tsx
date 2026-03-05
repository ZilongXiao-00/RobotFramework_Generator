import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';


// ─── 自定义关键字子函数定义 ─────────────────────────────────
export const CUSTOM_KEYWORD_DEFS: Record<string, {
  fixedArg: string;
  fixedArgDesc: string;
  returnVars: Record<string, string>;
  subFunctions: Record<string, {
    returnVars: Record<string, string>;
    args: Record<string, { desc: string; recommended: string }>;
  }>;
}> = {
  "sshCommond": {
    fixedArg: "${channel}",
    fixedArgDesc: "传入的下位机终端",
    returnVars: { "${rec_status}": "success:目标达到预期状态 | fail:函数执行失败 | notdone:目标未达到预期状态" },
    subFunctions: {
      "HMI_ShortPress": {
        returnVars: { "${rec_status}": "success:目标达到预期状态 | fail:函数执行失败 | notdone:目标未达到预期状态" },
        args: {
          HMIName: { desc: "被操作对象", recommended: "" },
          Recovery: { desc: "Enable:复位 | Disable:不复位 | Conti:悬空继续", recommended: "Enable/Disable/Conti" },
          time: { desc: "点击持续时间(秒)", recommended: "0.5" },
          status: { desc: "目标状态(可选)", recommended: "" }
        }
      },
      "HMI_AccountOperation": {
        returnVars: { "${rec_status}": "success:操作成功 | fail:故障 | done:已处于目标状态" },
        args: {
          HMIName: { desc: "飞书Home页面下的用户", recommended: "" },
          Recovery: { desc: "Enable:复位 | Disable:不复位 | Conti:悬空继续", recommended: "Enable/Disable/Conti" },
          time: { desc: "点击持续时间(秒)", recommended: "0.5" },
          status: { desc: "目标状态(可选)", recommended: "" }
        }
      },
      "HMI_CheckStatus": {
        returnVars: { "${rec_status}": "success:操作成功 | fail:故障" },
        args: {
          HMIName: { desc: "被操作对象", recommended: "" },
          Status: { desc: "On/Off:开关类 | [数字]:档位温度", recommended: "" }
        }
      },
      "HMI_CheckExist": {
        returnVars: { "${rec_status}": "success:存在 | fail:不存在" },
        args: {
          HMIName: { desc: "被操作对象", recommended: "" },
          Status: { desc: "Exist:存在 | notExist:不存在", recommended: "Exist/notExist" }
        }
      },
      "HMI_CheckButtonText": {
        returnVars: { "${rec_status}": "状态", "${result}": "按钮文字" },
        args: {
          HMIName: { desc: "被操作对象", recommended: "" }
        }
      },
      "HMI_CheckMultiButtonText": {
        returnVars: {},
        args: {
          HMIName: { desc: "被操作对象", recommended: "" }
        }
      }
    }
  },
  "ser_write_FLO_command": {
    fixedArg: "",
    fixedArgDesc: "",
    returnVars: { "${result_SendCmd}": "True:成功 | False:失败" },
    subFunctions: {}
  }
};

// ─── 自定义关键字配置弹窗 ─────────────────────────────────
export function CustomKeywordConfigModal({
  keyword,
  onConfirm,
  onClose
}: {
  keyword: any;
  onConfirm: (config: { keyword: string; args: Record<string, string>; returnVars: string[]; subFuncArgs: string }) => void;
  onClose: () => void;
}) {
  const kwDef = CUSTOM_KEYWORD_DEFS[keyword.name];
  const subFuncNames = kwDef?.subFunctions ? Object.keys(kwDef.subFunctions) : [];
  const [selectedSubFunc, setSelectedSubFunc] = useState<string>("");
  const [searchSubFunc, setSearchSubFunc] = useState("");
  const [argValues, setArgValues] = useState<Record<string, string>>({});
  const [showSubFuncDropdown, setShowSubFuncDropdown] = useState(false);

  const filteredSubFuncs = subFuncNames.filter(sf => sf.toLowerCase().includes(searchSubFunc.toLowerCase()));
  const currentSubFuncDef = selectedSubFunc ? kwDef?.subFunctions[selectedSubFunc] : null;

  // 处理确认
  const handleConfirm = () => {
    if (!kwDef) return;
    // 构建子函数参数（空格拼接）
    const subFuncArgs = selectedSubFunc + (currentSubFuncDef ? " " + Object.values(argValues).filter(v => v).join(" ") : "");
    // 构建返回值
    const returnVars = currentSubFuncDef?.returnVars ? Object.keys(currentSubFuncDef.returnVars) : Object.keys(kwDef.returnVars || {});
    onConfirm({
      keyword: keyword.name,
      args: { channel: kwDef.fixedArg, command: selectedSubFunc, arg: subFuncArgs },
      returnVars,
      subFuncArgs
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center"><Settings size={16} className="text-[#F27D26]"/></div>
          <div><h3 className="font-bold text-gray-900 text-sm">{keyword.name} 配置</h3><p className="text-[10px] text-gray-400">配置子函数和参数</p></div>
          <button onClick={onClose} className="ml-auto p-2 hover:bg-gray-100 rounded-lg"><X size={15} className="text-gray-400"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 子函数搜索选择 */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">子函数</label>
            <div className="relative">
              <input
                type="text"
                value={searchSubFunc}
                onChange={e => { setSearchSubFunc(e.target.value); setShowSubFuncDropdown(true); }}
                onFocus={() => setShowSubFuncDropdown(true)}
                placeholder="搜索子函数..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#F27D26]"
              />
              {showSubFuncDropdown && filteredSubFuncs.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredSubFuncs.map(sf => (
                    <div
                      key={sf}
                      onClick={() => { setSelectedSubFunc(sf); setSearchSubFunc(sf); setShowSubFuncDropdown(false); setArgValues({}); }}
                      className="px-3 py-2 hover:bg-orange-50 cursor-pointer text-sm"
                    >
                      {sf}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 固定参数显示 */}
          {kwDef?.fixedArg && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">固定参数</div>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-[#F27D26]">{kwDef.fixedArg}</code>
                <span className="text-xs text-gray-400">- {kwDef.fixedArgDesc}</span>
              </div>
            </div>
          )}

          {/* 参数配置 */}
          {currentSubFuncDef && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">参数配置</label>
              <div className="space-y-3">
                {Object.entries(currentSubFuncDef.args).map(([argName, argInfo]) => {
                  const recommendedValues = argInfo.recommended ? argInfo.recommended.split("/") : [];
                  const hasRecommended = recommendedValues.length > 0;
                  return (
                    <div key={argName} className="flex gap-2 items-start">
                      <div className="w-32 flex-shrink-0">
                        <div className="text-sm font-medium text-gray-700">{argName}</div>
                        <div className="text-xs text-gray-400">{argInfo.desc}</div>
                      </div>
                      <div className="flex-1 relative">
                        {hasRecommended ? (
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={argValues[argName] || ""}
                              onChange={e => setArgValues(prev => ({ ...prev, [argName]: e.target.value }))}
                              placeholder={argInfo.recommended}
                              className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#F27D26]"
                            />
                            <select
                              value={argValues[argName] || ""}
                              onChange={e => setArgValues(prev => ({ ...prev, [argName]: e.target.value }))}
                              className="px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#F27D26] bg-white"
                            >
                              <option value="">选择</option>
                              {recommendedValues.map(v => (
                                <option key={v} value={v}>{v}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={argValues[argName] || ""}
                            onChange={e => setArgValues(prev => ({ ...prev, [argName]: e.target.value }))}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#F27D26]"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 返回值预览 */}
          {(currentSubFuncDef?.returnVars || kwDef?.returnVars) && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">返回值</label>
              <div className="p-3 bg-gray-50 rounded-lg text-xs space-y-1">
                {Object.entries(currentSubFuncDef?.returnVars || kwDef?.returnVars || {}).map(([varName, desc]) => (
                  <div key={varName} className="flex gap-2">
                    <code className="font-mono text-blue-600">{varName}</code>
                    <span className="text-gray-500">- {desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 代码预览 */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">代码预览</label>
            <pre className="p-3 bg-[#1e1e1e] text-[#d4d4d4] rounded-lg text-xs font-mono overflow-x-auto">
              {selectedSubFunc ? `${Object.keys(currentSubFuncDef?.returnVars || kwDef?.returnVars || {}).join("    ")}    ${keyword.name}    ${kwDef?.fixedArg || ""}    ${selectedSubFunc}${currentSubFuncDef ? " " + Object.values(argValues).filter(v => v).join(" ") : ""}` : "请选择子函数"}
            </pre>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50">取消</button>
          <button onClick={handleConfirm} disabled={!selectedSubFunc} className="flex-1 py-2.5 bg-[#F27D26] text-white text-sm font-bold rounded-lg hover:bg-[#d96b1f] disabled:opacity-50">确认</button>
        </div>
      </div>
    </div>
  );
}
