'use client'

import { useState } from 'react'
import { createEscrowOrder, releaseFunds } from './actions'

export default function Home() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [lockData, setLockData] = useState<any>(null)

  async function handleCreateLock() {
    if (!email) return;
    setStatus('loading')
    
    const result = await createEscrowOrder(email, 100)
    
    if (result.success) {
      setLockData(result)
      setStatus('ready_to_sign')
    }
  }

  async function handleRelease() {
    setStatus('releasing')
    setTimeout(() => {
        setStatus('released')
    }, 2000)
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black text-white selection:bg-indigo-500/30 font-sans">
      
      {/* --- BACKGROUND LAYER: GRID & SPOTS --- */}
      <div className="absolute inset-0 z-0 h-full w-full bg-black bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-500 opacity-20 blur-[100px]"></div>
      <div className="absolute bottom-0 right-0 -z-10 h-[400px] w-[400px] rounded-full bg-purple-900 opacity-20 blur-[120px]"></div>
      
      {/* --- CONTENT LAYER --- */}
      <div className="z-10 w-full max-w-xl px-4">
        
        {/* Header */}
        <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-mono tracking-widest text-indigo-300 uppercase">System Online • Testnet</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tighter bg-gradient-to-b from-white via-white to-gray-500 bg-clip-text text-transparent">
              Trustless Settlement
            </h1>
            <p className="mt-2 text-gray-500 text-lg font-light">
              Autonomous escrow for the AI economy.
            </p>
        </div>

        {/* --- GLASSMOPHIC CARD --- */}
        <div className="relative group rounded-3xl border border-white/10 bg-gray-900/40 backdrop-blur-3xl shadow-2xl overflow-hidden ring-1 ring-white/5 transition-all duration-500 hover:ring-white/10">
            
            {/* Top Shine Effect */}
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
            
            <div className="p-8">
                
                {/* STEP 1: INPUT */}
                <div className={`transition-all duration-700 ${status !== 'idle' && status !== 'loading' ? 'opacity-30 blur-[1px] pointer-events-none' : 'opacity-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide">1. Initiate Agreement</label>
                        <span className="text-[10px] font-mono text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded bg-indigo-500/10">PROTOCOL: XRPL-ESCROW</span>
                    </div>
                    
                    <div className="flex gap-2">
                        <input 
                            type="email" 
                            placeholder="client@enterprise.com" 
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={status !== 'idle'}
                        />
                        <button 
                            onClick={handleCreateLock}
                            disabled={status !== 'idle'}
                            className="bg-white text-black hover:bg-gray-200 px-6 rounded-xl font-bold transition-all disabled:opacity-50 text-sm whitespace-nowrap shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                        >
                            {status === 'loading' ? 'Encrypting...' : 'Lock Funds'}
                        </button>
                    </div>
                </div>

                {/* DIVIDER */}
                {(status === 'ready_to_sign' || status === 'releasing' || status === 'released') && (
                     <div className="my-8 flex items-center gap-4">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
                        <div className="text-gray-600 text-[10px] font-mono whitespace-nowrap">CRYPTOGRAPHIC HANDSHAKE</div>
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
                     </div>
                )}

                {/* STEP 2: ACTION */}
                {(status === 'ready_to_sign' || status === 'releasing' || status === 'released') && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-sm font-medium text-white">2. AI Verification Agent</h2>
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${status === 'released' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                                <span className="text-[10px] font-mono text-gray-400">
                                    {status === 'released' ? 'SETTLEMENT COMPLETE' : 'AWAITING ORACLE'}
                                </span>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 mb-4 font-light leading-relaxed">
                            The funds are now locked on-chain. The decryption key is secured in the vault. 
                            The system is monitoring the CRM for a <span className="text-indigo-400">"Closed-Won"</span> signal.
                        </p>

                        {/* Lock Details Box */}
                        <div className="bg-black/40 rounded-xl border border-white/5 p-5 mb-6 relative overflow-hidden group">
                             {/* Scanning Bar Animation */}
                             {status !== 'released' && (
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-[scan_3s_ease-in-out_infinite]" />
                             )}
                             
                             <div className="flex justify-between items-center mb-3">
                                 <span className="text-xs font-mono text-gray-500">LOCK_ID: #8A29-XRP</span>
                                 <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{lockData.amount} XRP</span>
                             </div>
                             
                             <div className="font-mono text-[10px] text-gray-500 uppercase mb-1">Condition Preimage Hash</div>
                             <code className="text-xs text-gray-300 break-all leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                {lockData.condition}
                             </code>
                        </div>

                        {/* Button Area */}
                        {status !== 'released' ? (
                            <button 
                                onClick={handleRelease}
                                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 p-4 transition-all hover:border-indigo-500/60"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-3">
                                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🤖</span>
                                    <div className="text-left">
                                        <div className="font-bold text-indigo-100">Trigger AI Verification</div>
                                        <div className="text-[10px] text-indigo-300 uppercase tracking-wide">Simulate "Closed-Won" Signal</div>
                                    </div>
                                </div>
                                {/* Button Glow Background */}
                                <div className="absolute inset-0 -z-10 bg-indigo-600/20 blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                            </button>
                        ) : (
                            <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-center animate-in zoom-in-95 duration-300">
                                <h3 className="text-lg font-bold text-emerald-400 mb-1 flex items-center justify-center gap-2">
                                    <span>💸</span> Funds Released
                                </h3>
                                <p className="text-emerald-200/50 text-xs font-mono">
                                    TX HASH: 9283...AC21 • CONFIRMED
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 flex justify-center gap-6 text-[10px] text-gray-600 font-mono opacity-50 uppercase tracking-wider">
            <span>AES-256 Secured</span>
            <span>•</span>
            <span>XRPL Testnet</span>
            <span>•</span>
            <span>v0.1.0-beta</span>
        </div>

      </div>
    </main>
  )
}