import {useEffect,useState} from 'react'
import {supabase} from './supabase'
import {AuthContext} from './authState'
export function AuthProvider({children}) {
 const [state,setState]=useState({session:null,ready:!supabase})
 useEffect(()=>{
  if(!supabase)return
  let active=true,received=false
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{received=true;if(active)setState({session,ready:true})})
  supabase.auth.getSession().then(({data})=>{if(active&&!received)setState({session:data.session,ready:true})}).catch(()=>{if(active)setState({session:null,ready:true})})
  return ()=>{active=false;subscription.unsubscribe()}
 },[])
 return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}
