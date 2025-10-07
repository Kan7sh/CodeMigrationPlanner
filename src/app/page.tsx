"use client";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {

  const signInWithGithub = async () => {
    await signIn("github", { redirect: false });
  };

  async function logout() {
    await signOut();
  }
  
  return (
    <div className="h-screen w-screen flex flex-col gap-4 items-center justify-center">
      <button className="bg-gray-400 p-5 rounded-2xl text-black font-mono cursor-pointer" onClick={signInWithGithub}>
        Sigin Github
      </button>

      <button className="bg-gray-400 p-5 rounded-2xl text-black font-mono cursor-pointer" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
