import { motion } from 'framer-motion';
import { SignInButton } from '@clerk/clerk-react';
import { DEMO } from './palette.js';
import logo from '../MMMlogolong.png';

// Screen 1 — Entry. Clean, full-viewport. Get them straight into the demo.
export default function DemoEntry({ onStart, ready }) {
  return (
    <div
      style={{
        minHeight: '100vh', background: DEMO.cream,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '32px 24px', position: 'relative',
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <img src={logo} alt="Make Me Meals" style={{ height: 30, objectFit: 'contain' }} />
      </motion.div>

      {/* Center block */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', maxWidth: '460px', width: '100%' }}>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ fontFamily: DEMO.serif, fontWeight: 700, fontSize: 'clamp(34px, 9vw, 48px)', lineHeight: 1.08, color: DEMO.ink, margin: 0 }}
        >
          What's for dinner this week?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ fontFamily: DEMO.sans, fontSize: '18px', lineHeight: 1.5, color: DEMO.inkMid, margin: '20px 0 0', maxWidth: '340px' }}
        >
          Swipe to build your meal plan. We'll handle the rest.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          onClick={onStart}
          disabled={!ready}
          style={{
            marginTop: '40px',
            fontFamily: DEMO.sans, fontWeight: 800, fontSize: '18px',
            color: '#fff', background: DEMO.coral,
            border: 'none', borderRadius: '999px',
            padding: '17px 40px', cursor: ready ? 'pointer' : 'wait',
            boxShadow: '0 10px 30px rgba(232,85,58,0.35)',
            opacity: ready ? 1 : 0.7, transition: 'opacity 0.2s, transform 0.1s',
          }}
          whileTap={ready ? { scale: 0.97 } : undefined}
        >
          {ready ? 'Start Planning 🍽️' : 'Warming up the kitchen…'}
        </motion.button>
      </div>

      {/* Existing-user bypass */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        style={{ fontFamily: DEMO.sans, fontSize: '15px', color: DEMO.inkMid, paddingBottom: '8px' }}
      >
        Already have an account?{' '}
        <SignInButton mode="modal">
          <button style={{ background: 'none', border: 'none', color: DEMO.coral, fontWeight: 800, cursor: 'pointer', fontSize: '15px', fontFamily: DEMO.sans }}>
            Sign in →
          </button>
        </SignInButton>
      </motion.div>
    </div>
  );
}
