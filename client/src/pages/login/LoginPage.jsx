import React, { useState } from 'react';
import axios from "axios";
import LoginUI from '../../components/Login/LoginUI.jsx';
import BuildDisplay from '../../components/Login/BuildDisplay.jsx';

export default function LoginPage(props) {
  const [build, setBuild] = useState(null);
  const [loginId, setLoginId] = useState('');
 
  return build ? <BuildDisplay build={build} loginId={loginId} onBack={() => setBuild(null)} /> : <LoginUI setBuild={setBuild} loginId={loginId} setLoginId={setLoginId} />

}