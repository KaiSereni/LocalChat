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
import { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import {Popover, PopoverTrigger, PopoverContent} from "@heroui/popover";

export default function Home() {
  type messages = {"role": "user"|"assistant", "content":string}[];
  const [messageHistory, setMessageHistory] = useState<messages>([]);
  const [chatHistory, setChatHistory] = useState<{"id":number, "description":string}[]>([]);
  const [model_temp, setModelTemp] = useState<string>("2.5");
  const [model_max_tokens, setModelMaxTokens] = useState<number>(500);
  const [model_cot, setModelCot] = useState<boolean>(false);
  const [current_message, setCurrentMessage] = useState<string>("");
  const [model_id, setModelID] = useState<string>("openai/gpt-2");
  const availableModels: {"org": string, "models": string[]}[] = [
    {"org": "openai", "models": ["gpt-2"]},
    {"org": "deepseek-ai", "models": ["DeepSeek-V3", "DeepSeek-Coder-V2-Base"]},
    {"org": "mistralai", "models": ["Mistral-Small-24B-Instruct-2501", "Ministral-8B-Instruct-2410"]}
  ]
  const [customModelField, setCustomModelField] = useState<string>("");

  const sendChatRequest = (message: string) => {
    messageHistory.push({"role":"user", "content":message});
    fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: chatHistory,
            model: model_id,
            temperature: parseFloat(model_temp),
            max_length: model_max_tokens
        })
    })
    .then(response => response.json())
    .then(data => {
        messageHistory.push({"role":"assistant", "content":data.response});
        setMessageHistory([...messageHistory]);
    });
  }

  return (
    <div className="w-full h-full absolute flex">
      <div className="fixed h-full w-64 max-w-[40vw] bg-purple-500 shadow rounded-lg">
        <div className='h-12 p-4 flex items-center'>
          <div className='w-fit h-full flex space-x-4'>
            <img src={menu.src} className='h-full cursor-pointer hover:opacity-80' style={{'filter': 'invert(0.7)'}}/>
          </div>
          <div className='w-fit ml-auto h-full flex space-x-4'>
            <img src={search.src} className='h-full cursor-pointer hover:opacity-80' style={{'filter': 'invert(0.7)'}}/>
            <img src={pen.src} className='h-full cursor-pointer hover:opacity-80' style={{'filter': 'invert(0.7)'}}/>
          </div>
        </div>
      </div>
      <div className="relative ml-64 w-full h-full">
        <div className="fixed w-full h-16 p-3 px-6 flex bg-[#00000066] shadow-lg">
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
        </div>
        <div className={clsx("w-full h-full flex justify-center items-center", [messageHistory.length ? "" : "items-center"])}>
          <div className={clsx("block h-fit", [messageHistory.length ? "w-full" : "w-2/3 mb-32"])}>
            {
              !messageHistory.length &&
              <div className="font-bold text-2xl p-4 w-full flex text-center justify-center">
                Local GPT
              </div>
            }
            {
              Boolean(messageHistory.length) &&
              <div className='mb-32 mt-[340px]'>
                {
                  messageHistory.map((message, index) => (
                    <div key={index} className={clsx("p-2 w-full", [message.role === "assistant" ? "justify-end" : "justify-start"])}>
                      <div className={clsx("p-4 rounded-2xl shadow-lg w-fit max-w-[70vw]", [message.role === "assistant" ? "ml-auto rounded-br-sm bg-purple-200" : "mr-auto rounded-bl-sm bg-purple-100"])}>
                        {message.content}
                      </div>
                    </div>
                  ))
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
                <div className="h-full w-8 rounded-full bg-white ml-auto hover:bg-gray-300 cursor-pointer">
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
