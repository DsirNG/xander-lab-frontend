import React from 'react';

/**
 * 用户聊天气泡
 */
const AgentChatMessage = ({ content }) => (
  <div className="flex justify-end">
    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-slate-900 px-4 py-3 text-sm leading-6 text-white shadow-sm whitespace-pre-wrap">
      {content}
    </div>
  </div>
);

export default AgentChatMessage;
