import { Fragment } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button'; 
import Image from 'next/image';
import Link from 'next/link';



export default function Register(): JSX.Element {
  return (
    <Fragment>
      <section className='w-full flex justify-evenly items-center text-po'>
        <main className='w-96 flex flex-col gap-5'>
          <h1 className='font-bold text-center text-xl'>INFORMACION DE USUARIO</h1>
          <label>
            <Input label='Correo Electronico' color='default' variant='underlined'></Input>
          </label>
          <label>
            <Input label='Contraseña' color='default' variant='underlined'></Input>
          </label>
          <div>
            <Button color='secondary' radius='none' variant='shadow' className='w-full'>REGISTRARSE</Button>
          </div>
          <div>
            <p className='text-sm text-center'>¿Ya Tienes Una Cuenta Registrada? <Link href='/Login' className='text-blue-500'>Inicia Sesion</Link></p>
          </div>
        </main>
        <div>
          <Image src={'/image-register.svg'} alt={''} width={350} height={350}></Image>
        </div>
      </section>
    </Fragment>
  );
}