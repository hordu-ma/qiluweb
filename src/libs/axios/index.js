import chatbot from './chatbot';
import login from './login';
import namespace from './namespace';
import namespaceFile from './namespaceFile';
import namespaceExcel from "./namespaceExcel";
import vector from './vector';
import chatHistoryCount from "./chatHistoryCount";
import chatHistory from "./chatHistory";
import prohibited from "./prohibited";
import prohibitedHistory from "./prohibitedHistory";
import ningbo from "./ningbo";
import user from "./user";

const list = Object.assign(chatbot, login,namespace,namespaceFile,vector,chatHistoryCount,chatHistory,prohibited,namespaceExcel,prohibitedHistory, ningbo, user);
export default list
