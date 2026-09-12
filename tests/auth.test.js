import {test} from 'node:test'
import assert from 'node:assert/strict'
import {validateCredentials, authError} from '../src/authValidation.js'
const base = {email:'test@example.com',password:'Example-pass-123',confirmation:'Example-pass-123',signingUp:true}
test('registration rejects mismatched passwords before sending credentials',()=>{
 assert.match(validateCredentials({...base,confirmation:'different'}),/don’t match/)
 assert.equal(validateCredentials(base),'')
})
test('login does not require confirmation and accepts existing shorter passwords',()=>{
 assert.equal(validateCredentials({...base,password:'oldpwd',confirmation:'',signingUp:false}),'')
 assert.match(validateCredentials({...base,email:'invalid'}),/valid email/)
 assert.match(validateCredentials({...base,password:'short',confirmation:'short'}),/8 characters/)
})
test('auth failures are actionable without revealing raw server details',()=>{
 assert.match(authError({code:'email_not_confirmed'}),/confirm your email/)
 assert.match(authError({code:'invalid_credentials'}),/incorrect/)
 assert.match(authError({status:429}),/wait/)
 assert.equal(authError({message:'sensitive internal detail'}).includes('sensitive'),false)
})
