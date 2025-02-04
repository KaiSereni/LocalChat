"use client";

import clsx from 'clsx';
import upArrow from '../images/arrow-up-solid.svg'
import menu from '../images/bars-solid.svg'
import search from '../images/magnifying-glass-solid.svg'
import pen from '../images/pen-to-square-solid.svg'
import temp from '../images/temperature-half-solid.svg'
import hand from '../images/hand-solid.svg'
import chain from '../images/link-solid.svg'
import caret from '../images/caret-down-solid.svg';
import trash from '../images/trash-solid.svg';
import { use, useEffect, useState, useRef } from 'react';
import { Tooltip } from 'react-tooltip';
import {Popover, PopoverTrigger, PopoverContent} from "@heroui/popover";

export default function Home() {
  type messages = {"role": "user"|"assistant", "content":string}[];
  const [messageHistory, setMessageHistory] = useState<messages>([]);
  const [selectedChat, setSelectedChat] = useState<string>("-1");
  const [model_temp, setModelTemp] = useState<string>("2.5");
  const [model_max_tokens, setModelMaxTokens] = useState<number>(500);
  const [model_cot, setModelCot] = useState<boolean>(false);
  const [current_message, setCurrentMessage] = useState<string>("");
  const [model_id, setModelID] = useState<string>("openai/gpt-2");
  const [loadedModel, setLoadedModel] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const availableModels: {"org": string, "models": string[]}[] = [
    {"org": "openai", "models": ["gpt-2"]},
    {"org": "deepseek-ai", "models": ["DeepSeek-V3", "DeepSeek-Coder-V2-Base"]},
    {"org": "mistralai", "models": ["Mistral-Small-24B-Instruct-2501", "Ministral-8B-Instruct-2410"]}
  ]
  const [customModelField, setCustomModelField] = useState<string>("");
  const [chatList, setChatList] = useState<any[]>([]);
  const [showChatHistory, setShowChatHistory] = useState<boolean>(true);

  const createNewChat = () => {
    const chatid = Math.floor(Math.random()*99999)
    setSelectedChat(chatid.toString());
    setMessageHistory([]);
  }

  const deleteChat = (chat_id: number) => {
    fetch('http://localhost:3001/deleteChat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatid: chat_id
      })
    })
    .then(response => response.json())
    .then(data => {
      fetch('http://localhost:3001/chatList', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      .then(response => response.json())
      .then(data => {
        setChatList(data);
      });
    });
  }

  const sendChatRequest = (message: string) => {
    messageHistory.push({"role":"user", "content":message});
    fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: messageHistory,
            model: model_id,
            temperature: String(parseFloat(model_temp)),
            max_length: model_max_tokens,
            chain_of_thought: model_cot,
            chatid: selectedChat
        })
    })
    .then(response => response.json())
    .then(data => {
        if (messageHistory.length === 1) {
          fetch('http://localhost:3001/chatList', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          })
          .then(response => response.json())
          .then(data => {
            setChatList(data);
          });
        }
        messageHistory.push({"role":"assistant", "content":data['response']});
        setMessageHistory([...messageHistory]);
    });
  }

  useEffect(() => {
    fetch('http://localhost:3001/chatList', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
      setChatList(data);
    });
  }, []);

  const updateChatHistory = (chat_id: number) => {
    if (chat_id === parseInt(selectedChat)) return;
    setSelectedChat(chat_id.toString());
    fetch('http://localhost:3001/chatHistory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatid: chat_id
      })
    })
    .then(response => response.json())
    .then(data => {
      setMessageHistory(data["messages"]);
      console.log(messageHistory);
    });
  }

  const loadModel = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/loadModel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model_id
        })
      });
      const data = await response.json();
      if (data.success) {
        setLoadedModel(model_id);
      }
    } catch (error) {
      console.error('Error loading model:', error);
    }
    setIsLoading(false);
  }

  return (
    <div className="min-w-[100vw] min-h-[100vh] relative flex">
      <div className={clsx("fixed min-h-full max-w-[40vw] bg-purple-500 shadow rounded-lg duration-100", [showChatHistory ? "w-64" : "w-12"])} id='sidebar'>
        <div className='h-12 p-4 flex items-center'>
          <div className='w-fit h-full flex space-x-4'>
            <img src={menu.src} className='h-full cursor-pointer hover:opacity-80' style={{'filter': 'invert(0.7)'}} onClick={() => setShowChatHistory(!showChatHistory)}/>
          </div>
          {
            showChatHistory &&
            <div className='w-fit ml-auto h-full flex space-x-4'>
              <img src={search.src} className='h-full cursor-pointer hover:opacity-80' style={{'filter': 'invert(0.7)'}}/>
              <img src={pen.src} className='h-full cursor-pointer hover:opacity-80' style={{'filter': 'invert(0.7)'}} onClick={createNewChat}/>
            </div>
          }
        </div>
        {
          showChatHistory &&
          <div className='p-4'>
            <div className='space-y-2'>
              {
                chatList.map((chat, index) => (
                  <div key={index} className={clsx("p-2 rounded-lg cursor-pointer hover:bg-gray-700 border border-gray-700 flex justify-between items-center", [selectedChat === chat.id ? "bg-gray-700 text-white" : "text-gray-400"])} onClick={() => updateChatHistory(chat.id)}>
                    {chat.title}
                    <img 
                    src={trash.src} 
                    className="h-4 ml-2 cursor-pointer hover:opacity-80"
                    style={{filter: 'invert(0.5)'}}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }} 
                    />
                  </div>
                ))
              }
            </div>
          </div>
        }
      </div>
      <div className={clsx("relative w-full min-h-full duration-100", [showChatHistory ? "ml-64" : "ml-12"])}>
        <div className="fixed w-full h-16 p-3 px-6 flex bg-[#00000066] shadow-lg items-center">
          <Popover placement='bottom-start'>
            <PopoverTrigger>
              <div className='text-lg font-semibold text-gray-400 px-2 rounded-lg flex items-center cursor-pointer hover:bg-gray-700'>
                <>{model_id}</>
                <img src={caret.src} className='h-4 ml-2' style={{filter: "invert(0.6)"}}/>
              </div>
            </PopoverTrigger>
            <PopoverContent className="bg-gray-900 shadow-lg rounded-lg p-4">
              {availableModels.map((org, index) => (
                <div key={index} className="mb-2">
                  <div className="font-semibold">{org.org}</div>
                  {org.models.map((model, idx) => (
                    <div
                      key={idx}
                      className={clsx("cursor-pointer p-2 rounded hover:bg-gray-800", model_id === `${org.org}/${model}` && "bg-gray-700")}
                      onClick={() => setModelID(`${org.org}/${model}`)}
                    >
                      {model}
                    </div>
                  ))}
                </div>
              ))}
              <div className='mb-2'>
                <div className='font-semibold mb-2'>Custom</div>
                <input 
                  className='w-full bg-gray-800 p-2 rounded focus:outline-none'
                  placeholder='Enter model ID'
                  value={customModelField}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    setCustomModelField(target.value);
                    setModelID(target.value);
                  }}
                  onClick={() => setModelID(customModelField)}
                />
              </div>
            </PopoverContent>
          </Popover>
          
          <div className='flex items-center ml-4 space-x-4'>
            <button 
              onClick={loadModel}
              disabled={isLoading || model_id === loadedModel}
              className={`px-4 py-2 rounded-lg font-medium ${
                isLoading ? 'bg-gray-600 cursor-wait' :
                model_id === loadedModel ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'
              } text-white`}
            >
              {isLoading ? 'Loading...' : 
              model_id === loadedModel ? 'Model Loaded' : 'Load Model'}
            </button>
            {loadedModel && (
              <span className='text-gray-400'>
                Active model: {loadedModel}
              </span>
            )}
          </div>
        </div>
        <div className={clsx("w-full h-full flex justify-center items-center mb-12", [messageHistory.length ? "" : "items-center"])}>
          <div className={clsx("block h-fit", [messageHistory.length ? "w-full" : "w-2/3 mb-32"])}>
            {
              !messageHistory.length &&
              <div className="font-bold text-2xl p-4 w-full flex text-center justify-center">
                Local GPT
              </div>
            }
            {
              Boolean(messageHistory.length) &&
              <div className='mb-32 mt-12'>
                {
                  messageHistory.map((message, index) => {
                    const isLastMessage = index === messageHistory.length - 1;
                    return (
                      <div 
                        key={index} 
                        ref={isLastMessage ? (el) => {
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth' });
                          }
                        } : null}
                        className={clsx("p-2 w-full", [
                          message.role === "assistant" ? "justify-end" : "justify-start"
                        ])}
                      >
                        <div className={clsx("p-4 rounded-2xl shadow-lg w-fit max-w-[70vw]", [message.role === "assistant" ? "ml-auto rounded-br-sm bg-purple-200" : "mr-auto rounded-bl-sm bg-purple-100"])}>
                          {message.content}
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            }
            <div className={clsx("bg-purple-200 w-full h-fit min-h-2 shadow-lg", [messageHistory.length ? "fixed bottom-0" : "rounded-[30px]"] )}>
              <textarea
                className="resize-none duration-200 overflow-none bg-transparent w-full p-3 px-5 focus:outline-none rounded=[30px] border-none"
                placeholder="Message locally"
                rows={1}
                value={current_message}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  setCurrentMessage(target.value);
                  const minHeight = 65;
                  target.style.height = "auto";
                  target.style.height = `${target.scrollHeight > minHeight ? target.scrollHeight : minHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (current_message.trim()) {
                      sendChatRequest(current_message);
                      setCurrentMessage("");
                    }
                  }
                }}
              />
              <div className="flex w-full h-16 p-4">
                <div className='h-full w-fit flex space-x-2'>
                  <div className='flex h-full w-fit space-x-2 border border-gray-600 rounded-full'>
                    <div className="ml-3">
                      <Tooltip id='temp' />
                      <img 
                        src={temp.src}
                        className='h-full py-[7px] cursor-pointer'
                        style={{filter: 'invert(0.5)'}}
                        data-tooltip-id='temp'
                        data-tooltip-content={`Temperature: lower values will make the model more predictable,\n higher values will make it more creative.`}
                        data-tooltip-place="top"
                        data-tooltip-class-name='max-w-[400px] text-center'
                        data-tooltip-delay-show={500}
                      />
                    </div>
                    <input 
                      className='h-full w-12 bg-[#00000033] rounded-full text-center text-sm -ml-1'
                      value={model_temp}
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        setModelTemp(target.value.replace(/[^0-9.]/g, ''));
                      }}
                      maxLength={4}
                    />
                  </div>
                  <div className='flex h-full w-fit space-x-2 border border-gray-600 rounded-full'>
                    <div>
                      <Tooltip id='limit' />
                      <img 
                        src={hand.src} 
                        className='h-full py-[7px] ml-3 cursor-pointer' 
                        style={{filter: 'invert(0.5)'}}
                        data-tooltip-id='limit'
                        data-tooltip-content={`Max tokens: set the maximum number of tokens the model can generate.\n 1 token is roughly 4 characters.`}
                        data-tooltip-place="top"
                        data-tooltip-class-name='max-w-[400px] text-center'
                        data-tooltip-delay-show={500}
                      />
                    </div>
                    <input 
                      className='h-full w-12 bg-[#00000033] rounded-full text-center text-sm -ml-1'
                      value={model_max_tokens}
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        setModelMaxTokens(parseInt(target.value.replace(/[^0-9]/g, '')) || 0);
                      }}
                      maxLength={5}
                    />
                  </div>
                  <div className={clsx('flex h-full w-fit space-x-2 border rounded-full cursor-pointer hover:bg-gray-700', model_cot ? 'bg-[#00000033] border-transparent' : 'border-gray-600')} onClick={() => setModelCot(!model_cot)}>
                    <div>
                      <Tooltip id='cot' />
                      <img 
                        src={chain.src} 
                        className='h-full p-[8px]' 
                        style={{filter: 'invert(0.5)'}}
                        data-tooltip-id='cot'
                        data-tooltip-content={`Chain of thought: the model will recursively prompt itself to simulate thought before responding. Response time will increase.`}
                        data-tooltip-place="top"
                        data-tooltip-class-name='max-w-[400px] text-center'
                        data-tooltip-delay-show={500}
                      />
                    </div>
                  </div>
                </div>
                <div className={clsx("h-full w-8 rounded-full bg-white ml-auto hover:bg-gray-300 cursor-pointer", [messageHistory.length && "mr-64"])}>
                  <img src={upArrow.src} className="p-[10px] -translate-y-0.5" onClick={() => {
                    sendChatRequest(current_message);
                    setCurrentMessage("");
                  }}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
