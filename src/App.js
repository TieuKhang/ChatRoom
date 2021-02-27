import React, { useRef, useState} from 'react';
import './App.css';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';
import AsyncSelect from 'react-select/async';
import {Component} from 'react';
import TextSearch from './component/Textsearch'

firebase.initializeApp({
  apiKey: "AIzaSyAcb60kPfml7kFktuqpND1hENe6dYk0oJ8",
  authDomain: "chat-room-5e1bc.firebaseapp.com",
  projectId: "chat-room-5e1bc",
  storageBucket: "chat-room-5e1bc.appspot.com",
  messagingSenderId: "815991235227",
  appId: "1:815991235227:web:9b07c8815a2c0624d81c3e",
  measurementId: "G-W8EHG4BP35"
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>
      <div className="textSearch">
        <TextSearch client={firestore}/>
      </div>
      <section>
        {user? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const googleSignIn = () => {
    const prov = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(prov);
  }
  return (
    <button onClick={googleSignIn}> Sign In with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}> Sign out </button>
  )
} 

function ChatRoom() {
  const dummy = useRef();
  const msgRef = firestore.collection('messages');
  const query = msgRef.orderBy('createdAt').limit(25);
  const [msg] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');
  const sendMsg = async(e) => {
    e.preventDefault();
    const {uid, photoURL} = auth.currentUser;
    await msgRef.add({
      text:formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      like:0
    });
    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return(
    <>
      <div>
        {msg && msg.map(par => <ChatMsg key={par.id} message={par} idVal={par.id}/>)}
        <span ref={dummy}></span>
      </div>
      <form onSubmit={sendMsg}>
        <input value = {formValue} onChange={(e) => setFormValue(e.target.value)}/>
        <button type="submit"> Send </button>
      </form>
    </>
  )
}

function ChatMsg(props){
  const {text, uid, photo, like, idField} = props.message;
  const id = props.idVal;
  const msgClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  const [likenum, setLike] = useState(like);
  const updateLike = () => {
    setLike(likenum+1);
    firestore.collection("messages").doc(id).update({like: likenum})
  }
  return (
    <>
      <div className={`message ${msgClass}`}>
        <img src = {photo || 'https://icons-for-free.com/iconfiles/png/512/avatar+human+man+profile+icon-1320085876716628234.png'}/>
        <p>{text}</p>
        <button onClick={updateLike}>Likes: {likenum}</button>
      </div>
    </>
  )
}



export default App;
