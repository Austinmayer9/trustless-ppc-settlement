'use client'

import { useState } from 'react'
import { createEscrowOrder } from './actions'

export default function Home() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [lockData, setLockData] = useState<any>(null)

  async function handleCreateLock() {
    setStatus('loading')
    
    // Call the Server Action we just wrote
    const result = await createEscrowOrder(email, 100) // Hardcoded 100 XRP for demo
    
    if (result.success) {
      setLockData(result)
      setStatus('ready_to_sign')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-950 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-blue-500">
          Trustless Pay-Per-Close
        </h1>

        {/* STEP 1: CREATE THE AGREEMENT */}
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-800">
          <h2 className="text-xl mb-4">Step 1: Create Escrow Agreement</h2>
          <div className="flex gap-4">
            <input 
              type="email" 
              placeholder="Client Email" 
              className="p-2 rounded text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button 
              onClick={handleCreateLock}
              disabled={status === 'loading'}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-bold transition"
            >
              {status === 'loading' ? 'Generating Keys...' : 'Generate Contract'}
            </button>
          </div>
        </div>

     {/* STEP 2: SIMULATE THE CLOSE */}
     {status === 'ready_to_sign' && (
          <div className="mt-8 bg-gray-900 p-8 rounded-lg border border-green-900">
            <h2 className="text-xl mb-4 text-green-400">Step 2: AI Verification</h2>
            <p className="mb-4 text-gray-400">
              Contract created! The funds are locked on-chain. <br/>
              <span className="text-white font-bold">Scenario:</span> Your AI just detected a "Closed Won" deal in the CRM.
            </p>
            
            <div className="bg-black p-4 rounded overflow-x-auto mb-6 border border-gray-800">
               <div className="flex justify-between text-xs text-gray-500 mb-2">
                 <span>LOCK CONDITION</span>
                 <span>STATUS: <span className="text-yellow-500">LOCKED</span></span>
               </div>
               <code className="text-xs text-green-300 block break-all">{lockData.condition}</code>
            </div>

            <button 
              onClick={async () => {
                 alert("Simulating: AI Agent detected payment... Releasing funds!");
                 // In a real app, you'd call releaseFunds(lockData.escrowId) here
                 // For this demo, we just show the success state
                 setStatus('released');
              }}
              className="w-full bg-green-600 hover:bg-green-700 py-3 rounded font-bold transition flex items-center justify-center gap-2"
            >
              <span>🤖 Trigger "Pay-Per-Close" Release</span>
            </button>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {status === 'released' && (
          <div className="mt-8 bg-green-950 p-8 rounded-lg border border-green-500 text-center animate-pulse">
            <h1 className="text-4xl mb-2">💸</h1>
            <h2 className="text-2xl font-bold text-green-400 mb-2">Funds Released!</h2>
            <p className="text-green-200">
              The cryptographic key was decrypted and sent to the XRP Ledger.
              <br/>Settlement complete.
            </p>
          </div>
        )}

      </div>
    </main>
  )
}