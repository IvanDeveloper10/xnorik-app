'use client'

import { Fragment, useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button'; 
import { useRouter } from 'next/navigation';
import { app } from '@/utils/firebase';
import Image from 'next/image';
import Link from 'next/link';



export default function Register(): JSX.Element {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const auth = getAuth(app);
  const router = useRouter();

  const handleRegister = async () => {
    setError(null);
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      router.push('/Login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }


  return (
    <Fragment>
      <section className='w-full flex justify-evenly items-center text-po'>
        <main className='w-96 flex flex-col gap-5'>
          <h1 className='font-bold text-center text-xl'>INFORMACION DE USUARIO</h1>
          <label translate='no'>
            <Input label='Email' translate='no' autoComplete='off' color='default' variant='underlined' type='email' value={email} onChange={(e) => setEmail(e.target.value)}></Input>
          </label>
          <label translate='no'>
            <Input label='Password' translate='no' autoComplete='off' color='default' variant='underlined' type='password' value={password} onChange={(e) => setPassword(e.target.value)}></Input>
          </label>
          {error && <p className='text-red-500 text-sm text-center text-po'>{error}</p>}
          <div>
            <Button color='secondary' translate='no' radius='none' variant='shadow' className='w-full' onPress={handleRegister} isLoading={loading}>REGISTER</Button>
          </div>
          <div>
            <p className='text-sm text-center'>¿Ya Tienes Una Cuenta Registrada? <Link href='/Login' className='text-blue-500'>Inicia Sesion Aquí</Link></p>
          </div>
        </main>
        <div>
          <Image src={'/image-register.svg'} alt={''} width={350} height={350}></Image>
        </div>
      </section>
    </Fragment>
  );
}