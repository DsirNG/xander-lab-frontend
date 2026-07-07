import React from 'react';
import PropTypes from 'prop-types';
import {
    Info, FileCode, Edit2,
    Trash2, HelpCircle, Compass
} from 'lucide-react';
import Modal from '@/components/common/Modal';
import TourSpotlight from '@/components/common/TourSpotlight';

const ShareModals = ({
    // Modal visibility
    addModalOpen,
    deleteModalOpen,
    helpModalOpen,
    editScenarioModalOpen,
    tourWelcomeOpen,
    // Modal handlers
    onCloseAddModal,
    onAddFileSubmit,
    onCloseDeleteModal,
    onConfirmDeleteFile,
    onCloseHelpModal,
    onApplySample,
    onCloseEditScenarioModal,
    onEditScenarioSubmit,
    onTourWelcomeSkip,
    onTourWelcomeStart,
    onTourSpotlightSkip,
    // Form state
    newFileName,
    setNewFileName,
    fileToDeleteIdx,
    helpType,
    editScenTitleZh,
    setEditScenTitleZh,
    editScenTitleEn,
    setEditScenTitleEn,
    // Data
    libFiles,
    // Tour
    currentTourTarget,
}) => {
    return (
        <>
            {/* --- Add File Modal --- */}
            <Modal
                isOpen={addModalOpen}
                onClose={onCloseAddModal}
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center">
                            <FileCode className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-[14px]">新建文件</span>
                    </div>
                }
                width="max-w-[400px]"
                footer={
                    <>
                        <button onClick={onCloseAddModal} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100  transition-all">取消</button>
                        <button onClick={onAddFileSubmit} className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-700 shadow-lg shadow-primary/20 active:scale-95 transition-all">确定创建</button>
                    </>
                }
            >
                <div className="space-y-4 py-2">
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 block mb-2">File Name</label>
                        <input
                            autoFocus
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') onAddFileSubmit(); }}
                            className="w-full px-4 py-3 bg-slate-50  border border-slate-200  rounded-2xl text-[13px] font-mono text-slate-900  focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300 "
                            placeholder="e.g. Button.tsx"
                        />
                    </div>
                    <div className="bg-amber-50 text-amber-600 p-3 flex gap-3 text-xs rounded-xl font-medium border border-amber-100 ">
                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>推荐使用标准的前端扩展名如 <code className="bg-amber-100/50 px-1 py-0.5 rounded font-black italic">.jsx</code>, <code className="bg-amber-100/50 px-1 py-0.5 rounded font-black italic">.ts</code>, <code className="bg-amber-100/50 px-1 py-0.5 rounded font-black italic">.tsx</code>。</p>
                    </div>
                </div>
            </Modal>

            {/* --- Delete File Modal --- */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={onCloseDeleteModal}
                title="删除确认"
                width="max-w-[360px]"
                footer={
                    <>
                        <button onClick={onCloseDeleteModal} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100  transition-all">取消</button>
                        <button onClick={onConfirmDeleteFile} className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20 active:scale-95 transition-all flex items-center gap-2">
                            <Trash2 className="w-3.5 h-3.5" /> 确认删除
                        </button>
                    </>
                }
            >
                <div className="py-2 text-[14px] font-medium flex items-start gap-4 text-slate-600 ">
                    <div className="w-10 h-10 rounded-full bg-rose-100/50 text-rose-500 shrink-0 flex items-center justify-center border border-rose-200/50">
                        <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                        你正在极其危险地彻底抹除代码资产：<br />
                        <span className="text-slate-900  font-black italic border-b border-rose-200 mt-2 inline-block">
                            {fileToDeleteIdx !== null ? libFiles[fileToDeleteIdx].name : ''}
                        </span>
                        <p className="text-[12px] text-slate-400 mt-2">一旦删除，本地将丢失该文件的源码结构，是否强行覆盖执行？</p>
                    </div>
                </div>
            </Modal>

            {/* --- Help Modal --- */}
            <Modal
                isOpen={helpModalOpen}
                onClose={onCloseHelpModal}
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center">
                            <HelpCircle className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-[14px]">预置样例库 - {helpType.toUpperCase()}</span>
                    </div>
                }
                width="max-w-[420px]"
                footer={
                    <>
                        <button onClick={onCloseHelpModal} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100  transition-all">取消</button>
                        <button id="tour-apply-btn" onClick={onApplySample} className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-700 shadow-lg shadow-primary/20 active:scale-95 transition-all relative z-10">
                            一键装载
                        </button>
                    </>
                }
            >
                <div className="py-2 text-[13px] text-slate-600  leading-relaxed font-medium">
                    这是一项开发向导功能。点击下方按钮后，我们将为您本环节自动填入 <strong>『全局物理通知组件 (Toast)』</strong> 的标准工程测试数据。<br /><br />
                    {helpType === 'meta' && '该操作将会为您填入 Toast 组件的完整基本信息（中英文名称、描述及版本），跳过繁杂的手动录入。'}
                    {helpType === 'scenario' && '该操作将会一键填充一份同时包含了 { 成功态 / 失败态 / 进度流 } 等交互机制的完整 React DOM 运行场景。'}
                    {helpType === 'logic' && '该操作将会为您直接写入 ToastContext、ToastItem 和 ToastContainer 三个具备相互依赖关系的核心架构文件。'}
                    {helpType === 'env' && '该操作将会为您填入 <ToastProvider /> 等全量外层上下文节点，使您的演示代码能够正常接管全局路由或顶层依赖。'}
                    {helpType === 'css' && '该操作将会为您补充 Toast 高性能进退场的 CSS Keyframes 等基底渲染数据。'}
                </div>
            </Modal>

            {/* --- Edit Scenario Modal --- */}
            <Modal
                isOpen={editScenarioModalOpen}
                onClose={onCloseEditScenarioModal}
                title={
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center">
                            <Edit2 className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-[14px]">修改测试场景信息</span>
                    </div>
                }
                width="max-w-[400px]"
                footer={
                    <>
                        <button onClick={onCloseEditScenarioModal} className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100  transition-all">取消</button>
                        <button onClick={onEditScenarioSubmit} className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-700 shadow-lg shadow-primary/20 active:scale-95 transition-all">
                            保存修改
                        </button>
                    </>
                }
            >
                <div className="space-y-4 py-2">
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 block mb-2">中文名称</label>
                        <input
                            autoFocus
                            value={editScenTitleZh}
                            onChange={(e) => setEditScenTitleZh(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') onEditScenarioSubmit(); }}
                            className="w-full px-4 py-3 bg-slate-50  border border-slate-200  rounded-2xl text-[13px] font-bold text-slate-900  focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300"
                            placeholder="输入场景中文名..."
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 block mb-2">English Title</label>
                        <input
                            value={editScenTitleEn}
                            onChange={(e) => setEditScenTitleEn(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') onEditScenarioSubmit(); }}
                            className="w-full px-4 py-3 bg-slate-50  border border-slate-200  rounded-2xl text-[13px] font-bold text-slate-900  focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300"
                            placeholder="e.g. Interaction Study"
                        />
                    </div>
                </div>
            </Modal>

            {/* --- Tour Welcome Modal --- */}
            <Modal
                isOpen={tourWelcomeOpen}
                onClose={onTourWelcomeSkip}
                title="欢迎访问系统实验室"
                footer={
                    <>
                        <button onClick={onTourWelcomeSkip} className="px-5 py-2.5 text-xs text-slate-500 hover:bg-slate-100 rounded-xl font-bold transition-all">
                            我已熟悉，残忍拒绝
                        </button>
                        <button onClick={onTourWelcomeStart} className="px-6 py-2.5 bg-primary hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center gap-2">
                            <Compass className="w-4 h-4" /> 启动教学向导
                        </button>
                    </>
                }
            >
                <div className="text-slate-600  text-[13px] leading-loose">
                    侦测到系统架构池处于初始完全清空状态，且您是第一次进入<strong> Xander-Lab Workspace</strong>。<br />
                    为了帮助您最快熟悉这个"四合一"热重载沙盒，我们为您内置了一整套全局通知系统（Toast）的骨架。<br /><br />
                    是否愿意花 <b>30 秒</b>的世界时间，跟随强光指引，一点点体验如何无脑将组件拼装、编译并最终发射运作？
                </div>
            </Modal>

            {/* --- Tour Spotlight --- */}
            <TourSpotlight targetConfig={currentTourTarget} onSkip={onTourSpotlightSkip} />
        </>
    );
};

ShareModals.propTypes = {
    // Modal visibility
    addModalOpen: PropTypes.bool.isRequired,
    deleteModalOpen: PropTypes.bool.isRequired,
    helpModalOpen: PropTypes.bool.isRequired,
    editScenarioModalOpen: PropTypes.bool.isRequired,
    tourWelcomeOpen: PropTypes.bool.isRequired,
    // Modal handlers
    onCloseAddModal: PropTypes.func.isRequired,
    onAddFileSubmit: PropTypes.func.isRequired,
    onCloseDeleteModal: PropTypes.func.isRequired,
    onConfirmDeleteFile: PropTypes.func.isRequired,
    onCloseHelpModal: PropTypes.func.isRequired,
    onApplySample: PropTypes.func.isRequired,
    onCloseEditScenarioModal: PropTypes.func.isRequired,
    onEditScenarioSubmit: PropTypes.func.isRequired,
    onTourWelcomeSkip: PropTypes.func.isRequired,
    onTourWelcomeStart: PropTypes.func.isRequired,
    onTourSpotlightSkip: PropTypes.func.isRequired,
    // Form state
    newFileName: PropTypes.string.isRequired,
    setNewFileName: PropTypes.func.isRequired,
    fileToDeleteIdx: PropTypes.number,
    helpType: PropTypes.string.isRequired,
    editScenTitleZh: PropTypes.string.isRequired,
    setEditScenTitleZh: PropTypes.func.isRequired,
    editScenTitleEn: PropTypes.string.isRequired,
    setEditScenTitleEn: PropTypes.func.isRequired,
    // Data
    libFiles: PropTypes.array.isRequired,
    // Tour
    currentTourTarget: PropTypes.object,
};

export default ShareModals;
