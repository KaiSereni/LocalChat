"use client";

import upArrow from '../images/arrow-up-solid.svg'
import menu from '../images/bars-solid.svg'
import search from '../images/magnifying-glass-solid.svg'
import pen from '../images/pen-to-square-solid.svg'
import temp from '../images/temperature-half-solid.svg'
import hand from '../images/hand-solid.svg'
import chain from '../images/link-solid.svg'

export default function Home() {
  type messages = {"role": "user"|"assistant", "content":string}[]
  let messageHistory: messages = []
  let model_temp: number = 2.5
  let model_max_tokens: number = 500
  let model_cot: boolean = false
  let current_message: string = ""

  return (
    <div className="w-full h-full absolute flex">
      <div className="h-full w-64 max-w-[40vw] bg-purple-500 shadow rounded-lg">
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
      <div className="w-full h-full">
        <div className="w-full h-16 p-3 px-6 flex">
          <div className='text-lg font-semibold text-gray-400 px-2 rounded-lg flex items-center cursor-pointer hover:bg-gray-700'>
            GPT-2
          </div>
        </div>
        <div className="w-full h-full flex items-center justify-center">
          <div className="block w-2/3 h-fit mb-48">
            <div className="font-bold text-2xl p-4 w-full flex text-center justify-center">
              Local GPT
            </div>
            <div className="bg-purple-200 w-full h-fit min-h-2 rounded-[30px] shadow-lg">
              <textarea
              className="resize-none duration-200 overflow-none bg-transparent w-full p-3 px-5 focus:outline-none"
              placeholder="Message locally"
              rows={1}
              value={current_message}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                current_message = target.value;
                const minHeight = 65;
                target.style.height = "auto";
                target.style.height = `${target.scrollHeight > minHeight ? target.scrollHeight : minHeight}px`;
              }}
              />
              <div className="flex w-full h-16 p-4">
                <div className='h-full w-fit flex space-x-2'>
                  <div className='flex h-full w-fit space-x-2 border border-gray-600 rounded-full'>
                    <img src={temp.src} className='h-full py-[7px] ml-3' style={{filter: 'invert(0.5)'}}/>
                    <input className='h-full w-12 bg-[#00000022] rounded-full text-center text-sm -ml-1'/>
                  </div>
                  <div className='flex h-full w-fit space-x-2 border border-gray-600 rounded-full'>
                    <img src={hand.src} className='h-full py-[7px] ml-3' style={{filter: 'invert(0.5)'}}/>
                    <input className='h-full w-12 bg-[#00000022] rounded-full text-center text-sm -ml-1'/>
                  </div>
                  <div className='flex h-full w-fit space-x-2 border border-gray-600 rounded-full'>
                    <img src={chain.src} className='h-full p-[8px]' style={{filter: 'invert(0.5)'}}/>
                  </div>
                </div>
                <div className="h-full w-8 rounded-full bg-white ml-auto hover:bg-gray-300 cursor-pointer">
                  <img src={upArrow.src} className="p-[10px] -translate-y-0.5"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
