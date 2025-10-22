'use client';

import { Fragment, useState } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Spinner } from '@heroui/spinner';
import Image from 'next/image';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import { addToast } from '@heroui/toast';

export default function ClientRegister(): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Por favor, complete todos los campos');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = '/User'; 
    } catch (error: any) {
      alert(`Error al registrar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <section className='w-full flex justify-around flex-wrap pt-10'>
        <div className='w-2/5'>
          <h1 className='font-extrabold text-2xl text-po text-center my-3'>
            INICIA SESION CON CUENTA CREADA
          </h1>

          <div className='flex flex-col justify-center items-center gap-4 text-po'>
            <Input
              placeholder='Correo Electrónico'
              variant='underlined'
              color='secondary'
              onChange={(e) => setEmail(e.target.value)}
              isDisabled={loading}
            />

            <Input
              placeholder='Contraseña'
              variant='underlined'
              color='secondary'
              type='password'
              onChange={(e) => setPassword(e.target.value)}
              isDisabled={loading}
            />

            <div className='w-full flex justify-around items-center gap-4 my-3'>
              <Link href='/' className='w-full'>
                <Button
                  className='w-full flex justify-center items-center'
                  variant='shadow'
                  color='secondary'
                  isDisabled={loading}
                >
                  <i className='fi fi-rr-arrow-left flex justify-center items-center'></i>{' '}
                  ATRÁS
                </Button>
              </Link>

              <Button
                className='w-full flex justify-center items-center gap-2'
                variant='shadow'
                color='secondary'
                onPress={handleLogin}
                isDisabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size='sm' color='white' /> REGISTRANDO
                  </>
                ) : (
                  'INICIAR'
                )}
              </Button>
            </div>
          </div>
          <div className='flex justify-center items-center my-10'>
            <span className='text-po'>¿No Tienes Una Cuenta? <Link href={'/Register'} className='text-blue-500'>Registrate Aqui</Link></span>
          </div>
        </div>

        <div>
          <Image
            src={'/image-profile.svg'}
            alt={'Image Profile'}
            width={400}
            height={400}
          />
        </div>
      </section>
    </Fragment>
  );
}
